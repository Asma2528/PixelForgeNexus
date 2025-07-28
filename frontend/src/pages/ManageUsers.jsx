import { useEffect, useState } from "react";
import api from "../api/axios"; // Import the custom axios instance to handle API requests

function ManageUsers() {
  // State for storing users data
  const [users, setUsers] = useState([]); // Holds the list of users
  const [editingUser, setEditingUser] = useState(null); // Holds the currently edited user
  const [userData, setUserData] = useState({
    name: "", 
    email: "",
    role: "", 
  });

  // useEffect hook to fetch all users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("auth/users"); // Fetch the list of users from the API
        setUsers(response.data); // Store the fetched users in state
      } catch (error) {
        console.error("Error fetching users", error); // Handle any errors
      }
    };
    fetchUsers(); // Call the function to fetch users
  }, []); // Empty dependency array ensures this runs once on component mount

  // Handle the edit button click
  const handleEdit = (user) => {
    setEditingUser(user); // Set the user to be edited
    setUserData({
      name: user.name, // Set the name, email, and role of the user to edit
      email: user.email,
      role: user.role,
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target; // Get name and value from the input
    setUserData((prevState) => ({
      ...prevState, // Copy the previous state
      [name]: value, // Update the corresponding field
    }));
  };

  // Save the changes after editing a user
  const handleSave = async () => {
    try {
      await api.put(`auth/users/${editingUser._id}`, userData); // Send PUT request to update user data
      alert("User updated successfully!"); // Show success message
      setEditingUser(null); // Clear the editing state
      setUserData({
        name: "", // Clear the userData state after saving
        email: "",
        role: "",
      });

      // Refetch users after successful update
      const response = await api.get("/auth/users");
      setUsers(response.data); // Update the users list with the new data
    } catch (error) {
      console.error("Error updating user", error); // Handle errors
      alert("Failed to update user."); // Show error message
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold text-blue-600 mb-6">Manage Users</h2>

      {/* Users Table */}
      <div className="overflow-x-auto shadow-xl border rounded-lg bg-white">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Loop through all users and display each one */}
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-100">
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  {/* Edit button for each user */}
                  <button
                    onClick={() => handleEdit(user)} // Trigger handleEdit on click
                    className="bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Form (only appears when editingUser is set) */}
      {editingUser && (
        <div className="mt-6 bg-white p-6 shadow-lg rounded-lg">
          <h3 className="text-2xl font-semibold text-blue-600 mb-4">Edit User</h3>
          <div className="space-y-4">
            {/* User Name Input */}
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={userData.name}
                onChange={handleChange} // Trigger handleChange on input change
                placeholder="Enter name"
                className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* User Email Input */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* User Role Select */}
            <div>
              <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={userData.role}
                onChange={handleChange} // Trigger handleChange on role change
                className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="lead">Lead</option>
                <option value="developer">Developer</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setEditingUser(null)} // Cancel editing
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave} // Save the updated user
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;