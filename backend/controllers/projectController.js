const Project = require('../models/Project');
const User = require('../models/User');
const createDOMPurify = require('dompurify');  // Import DOMPurify for sanitizing user input
const { JSDOM } = require('jsdom');            // Import JSDOM to create a browser-like window for DOMPurify
const window = new JSDOM('').window;           // Create a new JSDOM instance to simulate a window object
const DOMPurify = createDOMPurify(window);     // Initialize DOMPurify with the simulated window object

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, deadline, lead } = req.body;  // Get project details from the request body

    // Sanitize user input to prevent XSS (Cross-Site Scripting) attacks
    const sanitizedName = DOMPurify.sanitize(name);
    const sanitizedDescription = DOMPurify.sanitize(description);

    // Create a new project in the database
    const project = await Project.create({ 
      name: sanitizedName,        // Use sanitized project name
      description: sanitizedDescription,  // Use sanitized project description
      deadline,                   // Project deadline (no sanitization needed)
      lead                        // Project lead (user ID of the lead)
    });

    // Respond with the created project
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });  // Return server error message if something goes wrong
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    // Fetch all projects and populate the 'lead' and 'assignedDevelopers' fields with their names
    const projects = await Project.find()
      .populate('lead', 'name')  // Populate 'lead' with name only
      .populate('assignedDevelopers', 'name');  // Populate 'assignedDevelopers' with name only
    
    // Respond with the list of projects
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });  // Return server error message if something goes wrong
  }
};

// Get projects assigned to the current user (developer/lead)
exports.getMyProjects = async (req, res) => {
  try {
    const role = req.user.role;  // Get the user's role (developer/lead/admin)
    const userId = req.user.id;  // Get the user's ID
    let projects = [];  // Initialize an empty array to hold the projects

    // If the user is a developer, find projects where they are assigned
    if (role === 'developer') {
      projects = await Project.find({ 
          assignedDevelopers: userId,  // Filter by developer assignment
          status: "Active"             // Only active projects
        })
        .populate('assignedDevelopers', 'name')  // Populate assigned developers' names
        .populate('lead', 'name');  // Populate project lead's name

    // If the user is a lead, find projects where they are the lead
    } else if (role === 'lead') {
      projects = await Project.find({ lead: userId })  // Filter by project lead
        .populate('assignedDevelopers', 'name')  // Populate assigned developers' names
        .populate('lead', 'name');  // Populate project lead's name
    
    // If the user is an admin, fetch all projects
    } else {
      projects = await Project.find()
        .populate('assignedDevelopers', 'name')  // Populate assigned developers' names
        .populate('lead', 'name');  // Populate project lead's name
    }

    // Respond with the list of projects
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });  // Return server error message if something goes wrong
  }
};

// Mark a project as completed
exports.markAsCompleted = async (req, res) => {
  try {
    const { projectId } = req.params;  // Get the project ID from the URL parameters

    // Update the project's status to 'Completed'
    const project = await Project.findByIdAndUpdate(projectId, { status: 'Completed' }, { new: true });
    
    // Respond with the updated project
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });  // Return server error message if something goes wrong
  }
};

// Assign a developer to a project
exports.assignDeveloper = async (req, res) => {
  try {
    const { projectId, developerId } = req.body;  // Get project ID and developer ID from request body
    const currentUserId = req.user.id;  // Get the ID of the current user (the person making the request)

    // Fetch the project from the database
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if the current user is the project lead
    if (project.lead.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only project lead can assign developers" });
    }

    // If the developer is not already assigned, add them to the project
    if (!project.assignedDevelopers.includes(developerId)) {
      project.assignedDevelopers.push(developerId);
      await project.save();  // Save the updated project with the new developer
    }

    // Respond with success message and the updated project
    res.json({ message: "Developer assigned", project });
  } catch (err) {
    res.status(500).json({ message: err.message });  // Return server error message if something goes wrong
  }
};

// Get all leads (users with 'lead' role)
exports.getLeads = async (req, res) => {
  try {
    // Fetch all users with the role of 'lead' and return only their ID and name
    const leads = await User.find({ role: 'lead' }).select('_id name');
    
    // Respond with the list of leads
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching leads' });  // Return server error message if something goes wrong
  }
};

// Get all developers (users with 'developer' role)
exports.getAllDevelopers = async (req, res) => {
  try {
    // Fetch all users with the role of 'developer' and return their name and email
    const developers = await User.find({ role: "developer" }).select("name email");
    
    // Respond with the list of developers
    res.json(developers);
  } catch (err) {
    res.status(500).json({ message: err.message });  // Return server error message if something goes wrong
  }
};

// Update project details
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;  // Get the project ID from the URL parameters
    const { name, description, deadline, lead, status } = req.body;  // Get the updated project details from the request body

    // Sanitize the input fields to prevent XSS attacks
    const sanitizedName = name ? DOMPurify.sanitize(name) : undefined;
    const sanitizedDescription = description ? DOMPurify.sanitize(description) : undefined;

    // Build an object with only the fields that are being updated
    const updateFields = {};
    if (sanitizedName) updateFields.name = sanitizedName;
    if (sanitizedDescription) updateFields.description = sanitizedDescription;
    if (deadline) updateFields.deadline = deadline;
    if (lead) updateFields.lead = lead;
    if (status) updateFields.status = status;

    // Update the project with the new fields
    const updatedProject = await Project.findByIdAndUpdate(projectId, updateFields, { new: true });

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Respond with success message and the updated project
    res.json({ message: 'Project updated', project: updatedProject });
  } catch (err) {
    res.status(500).json({ message: err.message });  // Return server error message if something goes wrong
  }
};