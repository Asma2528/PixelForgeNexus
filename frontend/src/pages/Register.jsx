import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // Importing axios instance for API calls

export default function Register() {
  const navigate = useNavigate(); // React Router hook to navigate between pages

  // State hooks to manage form data, error messages, and loading state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "developer", // Default role is set to "developer"
  });

  const [errMsg, setErrMsg] = useState(""); // Holds error messages
  const [loading, setLoading] = useState(false); // Tracks the loading state

  // Handles input change for form fields
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value, // Dynamically updates form data based on input name
    }));
  };

  // Handles form submission for registration
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default form submission behavior
    setErrMsg(""); // Clears any previous error message
    setLoading(true); // Sets loading state to true while waiting for API response

    try {
      // Sends a POST request to the backend to register the user
      const res = await api.post("/auth/register", formData);
      alert(res.data.message || "Registered successfully!"); // Display success message
      navigate("/login"); // Redirects the user to the login page after successful registration
    } catch (err) {
      // If there's an error during registration, capture and display the error message
      setErrMsg(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false); // Sets loading state to false after the API request completes
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit} // Handles form submission
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600">
          Register New User
        </h2>

        {/* Displays the error message if any */}
        {errMsg && <p className="text-red-500 text-sm text-center">{errMsg}</p>}

        {/* Full Name input field */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.name}
          onChange={handleChange} // Updates name in formData state
          required
        />

        {/* Email Address input field */}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.email}
          onChange={handleChange} // Updates email in formData state
          required
        />

        {/* Password input field */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.password}
          onChange={handleChange} // Updates password in formData state
          required
        />

        {/* Role selection dropdown */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange} // Updates role in formData state
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="developer">Developer</option>
          <option value="lead">Lead</option>
          <option value="admin">Admin</option>
        </select>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading} // Disables button while loading
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
        >
          {loading ? "Registering..." : "Register"} {/* Displays loading state or default text */}
        </button>
      </form>
    </div>
  );
}
