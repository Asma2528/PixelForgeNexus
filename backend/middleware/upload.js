const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project'); 

// Configure dynamic storage for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const { projectId } = req.body;  // Get the project ID from request body
      if (!projectId) return cb(new Error('Project ID is required'));

      const project = await Project.findById(projectId);  // Fetch project details
      if (!project) return cb(new Error('Project not found'));

      // Sanitize project name to be safe for folder names
      const safeProjectName = project.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

      // Define the upload path based on the project name
      const uploadPath = path.join(__dirname, '..', 'uploads', safeProjectName);

      // Ensure the directory exists or create it
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Set the upload directory
      cb(null, uploadPath);
    } catch (err) {
      cb(err);  // Pass errors to the callback
    }
  },

  filename: function (req, file, cb) {
    // Sanitize the file name to avoid unsafe characters
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const baseName = path.basename(sanitizedFileName);
    
    // Generate a unique file name using the current timestamp
    cb(null, `${Date.now()}-${baseName}`);
  }
});

// File filter for accepting only specific types of files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.docx', '.txt', '.xlsx'];  // Allowed extensions for document files

  // Reject file if its extension is not in the allowed list
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only document files are allowed (.pdf, .docx, .txt, .xlsx)'));
  }
  cb(null, true);  // Accept the file
};

// Multer upload instance with configuration for storage, file filter, and size limits
const upload = multer({
  storage,  // Storage configuration defined above
  fileFilter,  // File filter to restrict file types
  limits: {
    fileSize: 10 * 1024 * 1024 // Max file size: 10 MB
  }
});

module.exports = upload;  
