const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

dotenv.config();  // Load environment variables from .env file
const app = express();

app.use(express.json());  // Middleware to parse JSON requests

// Middleware to sanitize body and params to prevent NoSQL injection
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);  // Sanitize body
  if (req.params) req.params = mongoSanitize.sanitize(req.params);  // Sanitize params
  next();
});

app.use(helmet());  // Set HTTP headers for security (e.g., XSS protection)

app.use(cors({
  origin: 'http://localhost:5173',  // Allow requests from this frontend URL
  credentials: true  // Allow cookies to be sent with requests
}));

app.use('/uploads', express.static('uploads'));  // Serve static files from 'uploads' directory

// Route handling
app.use('/api/auth', require('./routes/authRoutes'));  // Authentication routes
app.use('/api/projects', require('./routes/projectRoutes'));  // Project-related routes
app.use('/api/documents', require('./routes/documentRoutes'));  // Document-related routes

const PORT = process.env.PORT || 5000;  // Set the port to use (default to 5000)

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  // Start the server if MongoDB connects
  })
  .catch(err => console.error(err));  // Log MongoDB connection errors
