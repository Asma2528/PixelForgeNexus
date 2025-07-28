**PixelForge Nexus**

Secure Project Management System
A secure project collaboration system tailored for a game development company, designed with a focus on role-based access, document control, and defense-in-depth security.



**Development Tools & Stack:**

Frontend - React.js, Tailwind CSS, Axios, React Router 

Backend - Node.js, Express.js, MongoDB, JWT (jsonwebtoken), Bcrypt.js 

Testing - ThunderClient for API testing 

Security Libraries - Helmet, Express Rate Limit, Express Mongo Sanitize, Crypto, Dotenv, CORS 

Email/OTP - Nodemailer, Crypto 

Sanitization - DOMPurify, jsdom (server-side XSS protection for rich inputs) File Uploads - Multer (configured with file type and size validations)


**Core Features:** 

Project Management - Admins can add/updaye projects, and mark them as completed. All users can view active projects.

Team Assignment - Project Leads can assign developers to specific projects. Developers can view the projects they are assigned to.

Document & Resource Management - Admins/Leads can upload project documents (e.g., design docs, meeting notes). Assigned users can view project documents.

Role-Based Access Control - Admin: Full control over projects, users, and documents. 

Project Lead: Can manage team assignments and documents. 

Developer: Can only view projects and documents assigned to them.


**Secure Design Principles:** 

Least Privilege - Users can only access features permitted by their roles

Fail-Safe Defaults - All sensitive endpoints are protected with authentication and role checks

Secure by Design - Security was a foundational goal, not an afterthought

Separation of Concerns - Frontend, backend, DB, and auth are separated for modularity

Defense in Depth - Input validation, JWT, sanitization, rate limiting, and secure file uploads layered

