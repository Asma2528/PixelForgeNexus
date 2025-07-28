const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken ,authorizeRoles} = require('../middleware/authMiddleware');
const {
  uploadDocument,
  getAllVersions,
  getDocumentsForProject
} = require('../controllers/documentController');

// Upload document (Admin or Project Lead)
router.post('/upload', verifyToken,authorizeRoles('admin','lead'),upload.array('files'), uploadDocument);

// Get all documents for a project
router.get('/:projectId', verifyToken, getDocumentsForProject);

// get all versions for a project's document
router.get('/versions/:projectId/:originalName', verifyToken,getAllVersions);

module.exports = router;
