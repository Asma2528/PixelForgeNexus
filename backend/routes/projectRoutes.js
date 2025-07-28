const express = require('express');
const router = express.Router();
const {
  createProject,
  getAllProjects,
  updateProject,
  assignDeveloper,
  getMyProjects,
  markAsCompleted,
  getLeads,
  getAllDevelopers
} = require('../controllers/projectController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Admin can create project
router.post('/', verifyToken, authorizeRoles('admin'), createProject);

// Admin can mark as complete
router.put('/complete/:projectId', verifyToken, authorizeRoles('admin'), markAsCompleted);

// Admin can update project
router.put('/:projectId', verifyToken, authorizeRoles('admin'), updateProject);

// Project Lead only
router.post('/assign', verifyToken, authorizeRoles('lead'), assignDeveloper);

// All users (filtered based on role)
router.get('/my', verifyToken, getMyProjects);

// Admin view
router.get('/', verifyToken, authorizeRoles('admin'), getAllProjects);

// To get all developers
router.get('/developers', verifyToken, getAllDevelopers);

// Only admin can view leads
router.get('/leads', verifyToken, authorizeRoles('admin'), getLeads);

module.exports = router;
