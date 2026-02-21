import { Routes, Route, Link } from "react-router-dom";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectPage from "./pages/ProjectPage";
import TicketPage from "./pages/TicketPage";

export default function App() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <h2>BugTrail</h2>
        </Link>
      </header>

      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectPage />} />
        <Route
          path="/projects/:projectId/tickets/:ticketId"
          element={<TicketPage />}
        />
      </Routes>
    </div>
  );
}
