import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import OtpVerify from "./pages/OtpVerify";
import Register from "./pages/Register";
import DashboardRouter from "./pages/DashboardRouter";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/useAuth";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ManageUsers from "./pages/ManageUsers";
import ResetPassword from "./pages/ResetPassword";
import RequestPasswordReset from "./pages/RequestPasswordReset";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider> {/* Provide authentication context to the entire app */}
      <Navbar />
      <Routes> {/* Define the routing structure */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        <Route path="/request-reset-password" element={<RequestPasswordReset />} />
        <Route path="/" element={<RedirectToLogin />} /> {/* Redirect user based on authentication status */}
        {/* Admin-only route guard */}
        <Route
          path="/register"
          element={
            <AdminRoute>
              <Register />
            </AdminRoute>
          }
        />
        <Route
          path="/manage-users"
          element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          }
        />
        {/* Protected routes (requires authentication) */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        {/* Fallback route for unrecognized URLs */}
        <Route
          path="/*"
          element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

// RedirectToLogin component to handle redirection based on user authentication
function RedirectToLogin() {
  const { isAuthenticated } = useAuth(); // Get authentication status from context
  
  // If user is authenticated, redirect to dashboard. Otherwise, redirect to login
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  } else {
    return <Navigate to="/login" />;
  }
}

export default App;
