import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa'; 

const NotFound = () => {
  const navigate = useNavigate(); // Hook to navigate to different routes programmatically

  const handleGoHome = () => {
    navigate('/'); // Navigate to the homepage when this function is called
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="text-center">
        <FaExclamationTriangle className="text-6xl text-yellow-500 mb-4" /> {/* Displaying the icon */}
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">404 - Page Not Found</h1> {/* 404 title */}
        <p className="text-lg text-gray-600 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={handleGoHome}  // Calling handleGoHome function on button click
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
