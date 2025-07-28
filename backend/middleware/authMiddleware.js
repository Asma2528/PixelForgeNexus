const jwt = require('jsonwebtoken');

// Middleware to verify the JWT token
exports.verifyToken = (req, res, next) => {
  // Extract token from the 'Authorization' header (Bearer <token>)
  const token = req.headers.authorization?.split(' ')[1];

  // If no token provided, return a 403 error
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    // Verify token using the secret key from the environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add the decoded user information (e.g., user id, role) to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // If the token is invalid or expired, return a 401 error
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to authorize users based on their roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // If the user's role is not in the allowed roles list, deny access
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If the user is authorized, proceed to the next middleware or route handler
    next();
  };
};
