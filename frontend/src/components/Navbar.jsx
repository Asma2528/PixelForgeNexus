import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-blue-900 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Branding */}
        <Link to="/" className="text-white text-2xl font-semibold hover:text-gray-300">
          Pixel Forge Nexus
        </Link>

        {/* Navigation Links */}
        <div className="space-x-6 flex items-center text-white">
          {/* Dashboard Link */}
          {isAuthenticated && (
            <Link to="/" className="hover:text-gray-300 text-lg transition duration-200 ease-in-out">
              Dashboard
            </Link>
          )}

          {/* Admin-Only Link: Manage Users */}
          {isAuthenticated && user?.role === "admin" && (
            <Link to="/manage-users" className="hover:text-gray-300 text-lg transition duration-200 ease-in-out">
              Manage Users
            </Link>
          )}

          {/* Conditionally Render Register Link for Admins */}
          {isAuthenticated && user?.role === "admin" && (
            <Link to="/register" className="hover:text-gray-300 text-lg transition duration-200 ease-in-out">
              Register User
            </Link>
          )}

          {/* Update Password Link */}
          <Link to="/request-reset-password" className="hover:text-gray-300 text-lg transition duration-200 ease-in-out">
            Update Password
          </Link>

          {/* User Avatar and Logout */}
          {isAuthenticated && (
            <div className="relative">
              <div className="relative">
                <button className="flex items-center space-x-2 text-white hover:text-gray-300">
                  <FaUserCircle className="text-xl" />
                  <span className="hidden lg:block">{user.name}</span>
                </button>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white text-black text-sm z-10 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="p-2">
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-red-100 text-red-500"
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
