import { useEffect, useState } from "react";
import api from "../api/axios";

export default function DeveloperDashboard() {
  const [projects, setProjects] = useState([]);
  const [projectDocuments, setProjectDocuments] = useState({});

  useEffect(() => {
    api.get("/projects/my")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchProjectDocuments(projects);
    }
  }, [projects]);

  const fetchProjectDocuments = async (projectList) => {
    try {
      const docsMap = {};

      await Promise.all(
        projectList.map(async (proj) => {
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
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">My Assigned Projects</h2>

      {projects.map((project) => (
        <div
          key={project._id}
          className="bg-white border border-gray-300 rounded-lg shadow-lg mb-6 p-6 hover:shadow-xl transition-all"
        >
          <h3 className="text-xl font-semibold text-blue-600 mb-2">{project.name}</h3>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Description:</strong> {project.description}
          </p>
          <p className="text-sm text-gray-700 mb-4">
            <strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString("en-IN")}
          </p>

          {/* Documents Section */}
          <div className="mt-4">
            <strong className="text-blue-600">Documents:</strong>
            {projectDocuments[project._id]?.length > 0 ? (
              <ul className="list-disc list-inside mt-2">
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

          {/* Status Section */}
          <div className="mt-4">
            <strong className="text-blue-600">Status:</strong>
            <span
              className={`ml-2 inline-block py-1 px-3 rounded-full text-white ${project.status === "In Progress"
                  ? "bg-blue-500"
                  : project.status === "Completed"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
            >
              {project.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
