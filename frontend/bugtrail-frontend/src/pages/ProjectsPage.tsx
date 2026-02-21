import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Link } from "react-router-dom";
import { CREATE_PROJECT, GET_PROJECTS } from "../graphql/queries";

type Project = { id: string; name: string; createdAt: string };
type GetProjectsData = { projects: Project[] };

export default function ProjectsPage() {
  const { data, loading, error } = useQuery<GetProjectsData>(GET_PROJECTS);
  const [name, setName] = useState("");
  const [createProject, { loading: creating }] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }],
  });

  const projects: Project[] = useMemo(() => data?.projects ?? [], [data]);

  async function onCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createProject({ variables: { name: trimmed } });
    setName("");
  }

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h3>Projects</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          style={{ flex: 1, padding: 8 }}
        />
        <button
          onClick={onCreate}
          disabled={creating}
          style={{ padding: "8px 12px" }}
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            style={{
              display: "block",
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{p.name}</strong>
              <small>{new Date(p.createdAt).toLocaleString()}</small>
            </div>
            <small>Open project</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
