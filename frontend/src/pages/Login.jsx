import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // Axios instance to make API requests
import { useAuth } from "../context/useAuth"; // Custom hook for authentication context
import { Link } from "react-router-dom"; // Link component for routing without full page reload

export default function Login() {
  const { isAuthenticated } = useAuth(); // Destructure to check if the user is authenticated

  const navigate = useNavigate(); // Initialize the navigation hook

  // useEffect to redirect authenticated users away from the login page
  useEffect(() => {
    if (isAuthenticated) navigate("/"); // Redirect to home page if already logged in
  }, [isAuthenticated, navigate]); // Dependency array ensures the effect runs when authentication state changes

  // Local state for form input and error handling
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [errMsg, setErrMsg] = useState(""); // State for storing error messages
  const [loading, setLoading] = useState(false); // State to handle loading (disable button during login)

  // handleSubmit function triggered when the user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setErrMsg(""); // Clear any previous error messages
    setLoading(true); // Start loading

    try {
      // Make a POST request to the server for login
      const res = await api.post("/auth/login", { email, password });

      // If OTP is required, redirect to the OTP verification page
      if (res.data.tempUserId) {
        navigate("/verify-otp", { state: { tempUserId: res.data.tempUserId } });
      }
    } catch (err) {
      // Handle errors if login fails
      setErrMsg(err.response?.data?.message || "Login failed. Try again."); // Display the error message from API response or a default message
    } finally {
      setLoading(false); // Set loading state to false after the request completes
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4"> {/* Center the login form in the middle of the screen */}
      <form
        onSubmit={handleSubmit} // Form submission triggers handleSubmit
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6" // Tailwind classes for styling the form
      >
        <h2 className="text-2xl font-bold text-center text-blue-600"> {/* Header text for the login form */}
          PixelForge Nexus Login
        </h2>

        {/* Display error message if there is any */}
        {errMsg && (
          <p className="text-red-500 text-sm text-center">{errMsg}</p> 
        )}

        {/* Email input field */}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email} // Bind email state to the input value
          onChange={(e) => setEmail(e.target.value)} // Update email state when the input changes
          required // Make the field required
        />

        {/* Password input field */}
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password} // Bind password state to the input value
          onChange={(e) => setPassword(e.target.value)} // Update password state when the input changes
          required // Make the field required
        />

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          disabled={loading} // Disable the button if it's in loading state
        >
          {loading ? "Sending OTP..." : "Login"} {/* Change text depending on loading state */}
        </button>

        {/* Link to reset password */}
        <div className="text-center mt-4">
          <Link to="/request-reset-password" className="text-blue-600 hover:underline">
            Forgot Password? {/* Link to the password reset page */}
          </Link>
        </div>
      </form>
    </div>
  );
}
