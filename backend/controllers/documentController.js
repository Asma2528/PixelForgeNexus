const Document = require('../models/Document');
const Project = require('../models/Project');
const path = require('path');  // Import path module for file path manipulation

// Upload a document to a project
exports.uploadDocument = async (req, res) => {
  try {
    const { projectId } = req.body;   // Extract the project ID from the request body
    const files = req.files;          // Extract uploaded files from the request

    // Check if any files were uploaded
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Authorization: Check if the user has permission to upload to this project
    if (
      req.user.role !== 'admin' && // Admin has access to all projects
      !(req.user.role === 'lead' && String(project.lead) === req.user.id)  // Leads can upload if they are the project lead
    ) {
      return res.status(403).json({ message: 'Not authorized to upload to this project' });
    }

    const uploadedDocs = []; // Array to store the documents uploaded

    // Loop through each uploaded file
    for (const file of files) {
      const originalName = file.originalname; // Get the original file name

      // Check if this document already exists in the project and fetch the latest version
      const lastVersion = await Document.findOne({ project: projectId, originalName })
        .sort({ version: -1 }); // Sort documents by version in descending order

      // Determine the version number for the new document (incrementing from the last version)
      const newVersion = (lastVersion?.version || 0) + 1;

      // Get the relative file path of the uploaded document (to store in the database)
      const relativeFilePath = path
        .relative(path.join(__dirname, '..'), file.path)
        .replace(/\\/g, '/');  // Normalize the path to handle OS-specific file separators

      // Create a new document entry in the database
      const doc = await Document.create({
        project: projectId,           // The project this document belongs to
        uploadedBy: req.user.id,      // The user who uploaded the document
        filePath: relativeFilePath,   // The relative path to the file
        originalName,                 // The original file name
        version: newVersion,          // The new version number
        previousVersionId: lastVersion?._id || null // Link to the previous version if it exists
      });

      uploadedDocs.push(doc);  // Add the newly uploaded document to the array
    }

    // Respond with a success message and the uploaded documents
    res.status(201).json({ message: 'Files uploaded with versioning', documents: uploadedDocs });
  } catch (err) {
    console.error(err);  // Log the error
    res.status(500).json({ message: err.message });  // Respond with a server error message
  }
};

// Get all documents for a specific project
exports.getDocumentsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;  // Get the project ID from the URL parameters

    // Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Authorization check: only the assigned developers, lead, and admin can access the documents
    const isAssignedDev = project.assignedDevelopers.includes(req.user.id);  // Check if the user is assigned as a developer
    const isLead = String(project.lead) === req.user.id;  // Check if the user is the lead for the project

    // Check if the user has the correct permissions (admin, assigned developer, or lead)
    if (
      req.user.role !== 'admin' &&  // Admin can access all documents
      (req.user.role === 'developer' && !isAssignedDev) ||  // Developers can only access if they are assigned to the project
      (req.user.role === 'lead' && !isLead)  // Leads can only access if they are the lead for the project
    ) {
      return res.status(403).json({ message: 'Not authorized to access documents' });
    }

    // Fetch all documents for the project and sort them by name and version
    const allDocs = await Document.find({ project: projectId }).sort({ originalName: 1, version: -1 });

    // Map to store the latest version of each document by original name
    const latestDocsMap = {};
    for (const doc of allDocs) {
      if (!latestDocsMap[doc.originalName]) {  // If the document's original name is not already in the map
        latestDocsMap[doc.originalName] = doc;  // Store the latest version
      }
    }

    // Get all the latest versions (values from the map)
    const latestDocs = Object.values(latestDocsMap);

    // Respond with the latest versions of the documents
    res.json(latestDocs);
  } catch (err) {
    res.status(500).json({ message: err.message });  // Respond with an error message if something goes wrong
  }
};

// Get all versions of a specific document in a project
exports.getAllVersions = async (req, res) => {
  try {
    const { projectId, originalName } = req.params;  // Get the project ID and document original name from the URL parameters

    // Fetch all versions of the document for the project, sorted by version in descending order
    const docs = await Document.find({ project: projectId, originalName }).sort({ version: -1 });

    // Respond with all versions of the document
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });  // Respond with an error message if something goes wrong
  }
};