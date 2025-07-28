import React from 'react'; // Import React for JSX syntax and components
import ReactDOM from 'react-dom/client'; // Import ReactDOM for rendering the app to the DOM
import App from './App.jsx'; 
import './index.css'; 
import { BrowserRouter } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext.jsx'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode> {/* Wrap the app in StrictMode for development, helps catch potential issues */}
    <BrowserRouter> {/* BrowserRouter enables routing in the app */}
      <AuthProvider> 
        <App /> 
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
