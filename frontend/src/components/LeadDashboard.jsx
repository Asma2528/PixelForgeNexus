import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function LeadDashboard() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selected, setSelected] = useState({});
  const [projectDocuments, setProjectDocuments] = useState({});
  const [projectFiles, setProjectFiles] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const projRes = await api.get("projects/my");
    const devRes = await api.get("/projects/developers");

    const myProjects = projRes.data.filter((p) => p.lead?._id === user.id);
    setProjects(myProjects);
    setDevelopers(devRes.data);

    // Fetch documents for each project
    const docsMap = {};
    await Promise.all(
      myProjects.map(async (proj) => {
        try {
          const res = await api.get(`/documents/${proj._id}`);
          docsMap[proj._id] = res.data;
        } catch (err) {
          console.error(`Error fetching documents for ${proj._id}`, err);
          docsMap[proj._id] = [];
        }
      })
    );
    setProjectDocuments(docsMap);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assignDeveloper = async (projectId) => {
    try {
      const devId = selected[projectId];
      if (!devId) return alert("Select a developer first");
      await api.post(`/projects/assign`, {
        projectId,
        developerId: devId,
      });

      alert("Developer assigned!");
      fetchData();
    } catch (err) {
      alert("Failed to assign developer");
      console.error(err);
    }
  };

  const uploadDocuments = async (projectId) => {
    const files = projectFiles[projectId];
    if (!files || files.length === 0) {
      alert("No files selected");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      files.forEach((file) => formData.append("files", file)); // plural: files

      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Documents uploaded!");
      fetchData(); // refresh data
      setProjectFiles({ ...projectFiles, [projectId]: [] });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">My Projects</h2>

      {projects.map((project) => (
        <div key={project._id} className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-xl font-semibold text-blue-600">{project.name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Description: </strong>{project.description}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Deadline: </strong>{new Date(project.deadline).toLocaleDateString("en-IN")}
          </p>

          {/* File Upload Section */}
          <div className="mt-4">
            <label htmlFor={`fileUpload-${project._id}`} className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg">
              Choose Files
            </label>
            <input
              type="file"
              id={`fileUpload-${project._id}`}
              multiple
              accept=".pdf,.docx,.txt,.xlsx"
              onChange={(e) =>
                setProjectFiles({
                  ...projectFiles,
                  [project._id]: Array.from(e.target.files),
                })
              }
              className="hidden"
            />
            {projectFiles[project._id]?.length > 0 && (
              <p className="text-sm text-gray-600 m-2">
                Selected: {projectFiles[project._id].map(file => file.name).join(", ")}
              </p>
            )}
            <button
              onClick={() => uploadDocuments(project._id)}
              className="m-2 bg-blue-600 text-sm text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Upload
            </button>
          </div>

          {/* Developer Assignment Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Assign Developer:</label>
            <select
              className="w-full border p-2 mt-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selected[project._id] || ""}
              onChange={(e) =>
                setSelected({ ...selected, [project._id]: e.target.value })
              }
            >
              <option value="">Select Developer</option>
              {developers.map((dev) => (
                <option key={dev._id} value={dev._id}>
                  {dev.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => assignDeveloper(project._id)}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none transition"
            >
              Assign Developer
            </button>
          </div>

          {/* Project Documents Section */}
          <div className="mt-6">
            <strong className="text-blue-600">Documents:</strong>
            {projectDocuments[project._id]?.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-600">
                {projectDocuments[project._id].map((doc) => (
                  <li key={doc._id}>
                    <a
                      href={`${import.meta.env.VITE_BACKEND_URL}/${doc.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {doc.originalName} (v{doc.version})
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No documents uploaded yet.</p>
            )}
          </div>

          {/* Assigned Developers */}
          <div className="mt-4">
            <strong className="text-blue-600">Assigned Developers:</strong>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {project.assignedDevelopers.length > 0 ? (
                project.assignedDevelopers.map((dev) => (
                  <li key={dev._id}>{dev.name}</li>
                ))
              ) : (
                <li>No developers assigned yet</li>
              )}
            </ul>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            <strong>Status: </strong>{project.status}
          </p>
        </div>
      ))}
    </div>
  );
}
