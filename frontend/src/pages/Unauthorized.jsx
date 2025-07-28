import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa'; // Lock Icon for 403

const Unauthorized = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page when 'Go Back' is clicked
  };

  const handleLogin = () => {
    navigate('/login'); // Navigate to the login page when 'Login' is clicked
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="text-center">
        <FaLock className="text-6xl text-red-600 mb-4" /> {/* Displaying lock icon */}
        <h1 className="text-5xl font-extrabold text-red-600 mb-4">403 - Unauthorized</h1> {/* 403 title */}
        <p className="text-lg text-gray-600 mb-6">
          You do not have permission to view this page.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={handleGoBack}  // Calls handleGoBack when the button is clicked
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Go Back
          </button>
          <button
            onClick={handleLogin}  // Calls handleLogin to navigate to the login page
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};


export default Unauthorized;
