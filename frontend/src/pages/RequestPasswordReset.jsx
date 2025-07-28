import { useState } from "react";
import api from "../api/axios";

const RequestPasswordReset = () => {
  const [email, setEmail] = useState(""); // State for storing the email input
  const [message, setMessage] = useState(""); // State for success or error messages
  const [loading, setLoading] = useState(false); // State to handle loading state (when waiting for API response)

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default form behavior (page reload)
    setMessage(""); // Clears previous messages
    setLoading(true); // Sets loading state to true while the API request is being processed

    try {
      // Sending POST request to backend to request a password reset
      await api.post("/auth/request-password-reset", { email });
      setMessage("Password reset link has been sent to your email.");
    } catch (error) {
      // Handling any error that occurs during the request
      setMessage("Error sending reset link. Please try again.");
      console.log(error); // Optionally log the error for debugging
    } finally {
      setLoading(false); // Turns off the loading state once the request finishes
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600">
          Forgot Password?
        </h2>

        {/* Message for success or error */}
        {message && (
          <p
            className={`text-center text-sm ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}
          >
            {message}
          </p>
        )}

        {/* Email input field */}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update email on change
          required // Ensures the field is filled before submission
        />

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          disabled={loading} // Disable the button while loading
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {/* Link to go back to login page */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mt-4">
            Remembered your password?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Back to Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RequestPasswordReset;