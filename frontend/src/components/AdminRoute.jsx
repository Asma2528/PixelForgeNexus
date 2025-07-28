import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user is an admin
  if (user?.role !== "admin") {
    return <Navigate to="/" />; // Redirect non-admins to the homepage
  }

  return children; // Render the children if user is admin
};

export default AdminRoute;
