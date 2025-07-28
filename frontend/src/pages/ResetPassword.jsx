import React, { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const ResetPassword = () => {
  const { resetToken } = useParams(); // Retrieves the reset token from the URL params
  const [newPassword, setNewPassword] = useState(""); // State for new password input
  const [message, setMessage] = useState(""); // State for success or error messages
  const [loading, setLoading] = useState(false); // State to track the loading state

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default form behavior (page reload)
    setMessage(""); // Clears any previous message
    setLoading(true); // Sets loading state to true during the API call

    try {
      // Send request to reset the password using the reset token and new password
      await api.post("/auth/reset-password", { resetToken, newPassword });
      setMessage("Your password has been reset successfully.");
    } catch (error) {
      // Handle errors during the API call
      setMessage("Error resetting password. Please try again.");
      console.log(error);
    } finally {
      setLoading(false); // Turn off the loading state once the request finishes
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Reset Your Password
        </h2>

        {/* Display success or error message */}
        {message && (
          <p
            className={`text-center text-sm mb-4 ${message.includes("Error") ? "text-red-500" : "text-green-500"
              }`}
          >
            {message}
          </p>
        )}

        {/* Password reset form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Remembered your password?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Back to Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};


export default ResetPassword;
