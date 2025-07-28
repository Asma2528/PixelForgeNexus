const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);  // Connect to MongoDB using the URI stored in environment variables
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Failed:', err.message);  // Log any connection errors
    process.exit(1);  // Exit the process with a failure status if the connection fails
  }
};

module.exports = connectDB;  // Export the function so it can be used in other parts of the application
