import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios"; // Importing axios instance for API calls
import { useAuth } from "../context/useAuth"; // Custom hook for authentication context

export default function OtpVerify() {
  // Destructure 'login' function from context to authenticate the user
  const { login } = useAuth();
  const navigate = useNavigate(); // To navigate between pages
  const location = useLocation(); // To access the location state from the router
  const tempUserId = location.state?.tempUserId; // Retrieve tempUserId passed in the location state

  // State hooks to manage OTP input, error message, and loading state
  const [otp, setOtp] = useState(""); // Stores the OTP input value
  const [errMsg, setErrMsg] = useState(""); // Stores error messages
  const [loading, setLoading] = useState(false); // Tracks the loading state

  // Handle form submission and OTP verification
  const handleVerify = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading to true while verifying OTP
    setErrMsg(""); // Clear any previous error message

    try {
      // Send the OTP and tempUserId to the backend to verify
      const res = await api.post("/auth/verify-otp", {
        otp,
        tempUserId,
      });

      // If successful, authenticate the user and save the user info in context
      login(res.data.user, res.data.token); // Store user data and token in context

      // Navigate the user to the homepage (or any other route after successful verification)
      navigate("/");
    } catch (err) {
      // If error occurs, show the error message
      setErrMsg(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false); // Set loading to false after request is completed
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleVerify} // Trigger handleVerify on form submission
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600">
          Verify OTP
        </h2>

        {/* Display error message if exists */}
        {errMsg && <p className="text-red-500 text-sm text-center">{errMsg}</p>}

        {/* OTP input field */}
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={otp} // Controlled input
          onChange={(e) => setOtp(e.target.value)} // Update OTP value on change
          required
        />

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          disabled={loading} // Disable button if loading
        >
          {loading ? "Verifying..." : "Verify"} {/* Change text when loading */}
        </button>
      </form>
    </div>
  );
}
