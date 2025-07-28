import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

export default function AdminDashboard() {
  const backendBaseURL = import.meta.env.VITE_BACKEND_URL;
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);  // Store the list of projects
  const [leads, setLeads] = useState([]);  // Store the available leads for assignment
  const [newProject, setNewProject] = useState({ name: "", description: "", deadline: "", lead: "" });  // Data for creating a new project
  const [projectFile, setProjectFile] = useState(null);  // Store selected files for the new project
  const [projectDocuments, setProjectDocuments] = useState({});  // Store documents related to each project
  const [versionHistory, setVersionHistory] = useState([]);  // Store version history of a document
  const [showModal, setShowModal] = useState(false);  // Control visibility of the document versions modal


  // For editing modal:
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectData, setEditProjectData] = useState({
    name: "",
    description: "",
    deadline: "",
    lead: "",
  });
  const [editProjectFile, setEditProjectFile] = useState(null);

  const fetchVersions = async (projectId, originalName) => {
    try {
      const res = await api.get(`/documents/versions/${projectId}/${originalName}`);
      setVersionHistory(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching versions", err);
    }
  };

  const fetchDocumentsForProjects = async (projects) => {
    try {
      const docsMap = {};
      await Promise.all(
        projects.map(async (proj) => {
          const res = await api.get(`/documents/${proj._id}`);
          docsMap[proj._id] = res.data;
        })
      );
      setProjectDocuments(docsMap);
    } catch (err) {
      console.error("Error fetching project documents", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await api.get("/projects/leads");
      setLeads(res.data);
    } catch (err) {
      console.error("Error fetching leads", err);
      setLeads([
        { _id: "lead1", name: "Lead User 1" },
        { _id: "lead2", name: "Lead User 2" },
      ]);
    }
  };

  useEffect(() => {
    if (projects.length > 0) {
      fetchDocumentsForProjects(projects);
    }
  }, [projects]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProjects();
      fetchLeads();
    }
  }, [user]);

  // Add project submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!newProject.deadline || !newProject.name || !newProject.lead) {
        alert("Please fill all required fields.");
        return;
      }

      const projectRes = await api.post("/projects", {
        name: newProject.name,
        description: newProject.description,
        deadline: newProject.deadline,
        lead: newProject.lead,
      });

      const savedProject = projectRes.data.project || projectRes.data;

      if (projectFile && projectFile.length > 0) {
        const formData = new FormData();
        formData.append("projectId", savedProject._id);
        projectFile.forEach((file) => formData.append("files", file));

        await api.post("/documents/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setNewProject({ name: "", description: "", deadline: "", lead: "" });
      setProjectFile(null);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Add project failed");
      console.error(err);
    }
  };

  // Mark complete
  const markComplete = async (id) => {
    try {
      await api.put(`/projects/complete/${id}`);
      fetchProjects();
    } catch (err) {
      alert("Error marking project complete");
      console.error(err);
    }
  };

  // Open edit modal and preload data
  const openEditModal = (proj) => {
    setEditingProject(proj);
    setEditProjectData({
      name: proj.name,
      description: proj.description || "",
      deadline: proj.deadline.split("T")[0],
      lead: proj.lead?._id || "",
    });
    setEditProjectFile(null);
    setIsEditModalOpen(true);
  };

  // Edit modal submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!editProjectData.deadline || !editProjectData.name || !editProjectData.lead) {
        alert("Please fill all required fields.");
        return;
      }

      // Update project info
      const projectRes = await api.put(`/projects/${editingProject._id}`, {
        name: editProjectData.name,
        description: editProjectData.description,
        deadline: editProjectData.deadline,
        lead: editProjectData.lead,
      });

      const savedProject = projectRes.data.project || projectRes.data;

      // Upload files if any
      if (editProjectFile && editProjectFile.length > 0) {
        const formData = new FormData();
        formData.append("projectId", savedProject._id);
        editProjectFile.forEach((file) => formData.append("files", file));

        await api.post("/documents/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Close modal & refresh
      setIsEditModalOpen(false);
      setEditingProject(null);
      setEditProjectFile(null);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
      console.error(err);
    }
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-center text-blue-600">Project Management</h1>

      {/* Add Project Form */}
      <form
        onSubmit={handleAddSubmit}
        className="space-y-6 bg-white p-6 rounded-xl shadow-lg"
      >
        <input
          type="text"
          placeholder="Project Name"
          value={newProject.name}
          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          required
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Project Description"
          value={newProject.description}
          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div>
          <label className="block text-sm font-medium">Deadline</label>
          <input
            type="date"
            min={getTodayDate()}
            value={newProject.deadline}
            onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Lead</label>
          <select
            value={newProject.lead}
            onChange={(e) => setNewProject({ ...newProject, lead: e.target.value })}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Lead</option>
            {leads.map((lead) => (
              <option key={lead._id} value={lead._id}>
                {lead.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Upload Documents</label>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.xlsx"
            onChange={(e) => setProjectFile(Array.from(e.target.files))}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {projectFile?.length > 0 && (
            <p className="text-sm mt-2 text-gray-600">
              Selected: {projectFile.map((file) => file.name).join(", ")}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Project
        </button>
      </form>

      {/* Project List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">All Projects</h2>
        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white p-6 rounded-lg shadow-lg mb-6 hover:shadow-xl transition duration-300"
            >
              <p className="text-lg font-semibold text-blue-600">{proj.name}</p>
              <p className="text-sm text-gray-600">{proj.description}</p>
              <p className="text-sm text-gray-500">
                Deadline: {new Date(proj.deadline).toLocaleDateString("en-IN")}
              </p>
              <p className="text-sm text-gray-700">Lead: {proj.lead?.name || "Not assigned"}</p>
              <p className="text-sm text-green-700">Status: {proj.status || "Active"}</p>

              <div className="mt-4">
                <h3 className="font-semibold">Documents:</h3>
                {projectDocuments[proj._id]?.length > 0 ? (
                  projectDocuments[proj._id].map((doc) => (
                    <li key={doc._id}>
                      <a
                        href={`${backendBaseURL}/${doc.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {doc.originalName}
                      </a>
                      <button
                        onClick={() => fetchVersions(proj._id, doc.originalName)}
                        className="text-sm text-blue-500 hover:underline ml-2"
                      >
                        View Versions
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                )}
              </div>

              {showModal && (
                <div className="fixed inset-0 bg-gray-100 bg-opacity-50 z-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-xl">
                    <h2 className="text-xl font-semibold mb-4">Document Versions</h2>
                    <ul className="space-y-2">
                      {versionHistory.map((ver) => (
                        <li key={ver._id}>
                          <a
                            href={`${backendBaseURL}/${ver.filePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            v{ver.version} - {new Date(ver.createdAt).toLocaleString()}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {proj.status !== "Completed" && (
                <>
                  <button
                    onClick={() => openEditModal(proj)}
                    className="py-2 px-4 mt-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => markComplete(proj._id)}
                    className="ml-2 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Mark Complete
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Edit Project</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Project Name"
                value={editProjectData.name}
                onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Project Description"
                value={editProjectData.description}
                onChange={(e) =>
                  setEditProjectData({ ...editProjectData, description: e.target.value })
                }
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div>
                <label className="block text-sm font-medium">Deadline</label>
                <input
                  type="date"
                  min={getTodayDate()}
                  value={editProjectData.deadline}
                  onChange={(e) =>
                    setEditProjectData({ ...editProjectData, deadline: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Lead</label>
                <select
                  value={editProjectData.lead}
                  onChange={(e) =>
                    setEditProjectData({ ...editProjectData, lead: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Lead</option>
                  {leads.map((lead) => (
                    <option key={lead._id} value={lead._id}>
                      {lead.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Upload Documents</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.xlsx"
                  onChange={(e) => setEditProjectFile(Array.from(e.target.files))}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editProjectFile?.length > 0 && (
                  <p className="text-sm mt-2 text-gray-600">
                    Selected: {editProjectFile.map((file) => file.name).join(", ")}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
