import { useContext } from "react"; 
import { AuthContext } from "../context/AuthContext"; 
import LeadDashboard from "../components/LeadDashboard"; 
import DeveloperDashboard from "../components/DeveloperDashboard"; 
import AdminDashboard from "../components/AdminDashboard"; 
import Unauthorized from "./Unauthorized"; 

export default function DashboardRouter() {
  const { user } = useContext(AuthContext); // Access the current user data from the AuthContext

  if (!user) return <div>Loading...</div>; // If user data is not available yet (still loading), show loading state

  // Depending on the user role, render the appropriate dashboard component
  if (user.role === "admin") return <AdminDashboard />; 
  if (user.role === "lead") return <LeadDashboard />;
  if (user.role === "developer") return <DeveloperDashboard />; 

  // If the user role doesn't match any of the predefined roles, show Unauthorized component
  return <Unauthorized />;
}
