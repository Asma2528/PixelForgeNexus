import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";  // Library to decode JWT token

export const AuthContext = createContext();  // Create context for sharing auth data

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // Store the logged-in user's data
  const [token, setToken] = useState(localStorage.getItem("token") || "");  // Store JWT token

  // On mount, decode token to set user if token exists
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);  // Decode JWT to extract user information

        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {  // Decode token expiry timestamp (exp) and check against current time
          throw new Error("Token expired");
        }

        // If the token is valid, set user information in state
        setUser({ id: decoded.id, role: decoded.role, name: decoded.name || "" });
      } catch (err) {
        console.error("Invalid token:", err);  // Log error if token is invalid or expired
        setUser(null);  // Clear user data if token is invalid
        setToken("");  // Clear token in state
        localStorage.removeItem("token");  // Remove token from localStorage
      }
    }
  }, [token]);  // Run the effect when the token changes

  // Login function
  const login = (userData, jwtToken) => {
    setUser(userData);  // Set user data in state
    setToken(jwtToken);  // Set token in state
    localStorage.setItem("token", jwtToken);  // Store the JWT token in localStorage
  };

  // Logout function
  const logout = () => {
    setUser(null);  // Clear user data in state
    setToken("");  // Clear token in state
    localStorage.removeItem("token");  // Remove the JWT token from localStorage
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;  // Check if both user data and token exist

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
