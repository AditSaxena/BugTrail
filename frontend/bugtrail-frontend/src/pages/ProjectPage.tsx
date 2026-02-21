import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  CREATE_TICKET,
  GET_ACTIVITY_FEED,
  GET_TICKETS,
} from "../graphql/queries";

type Ticket = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  assignee?: { id: string; name: string; role: string } | null;
};

type ActivityItem = {
  id: string;
  type: string;
  message: string;
  ticketId: string;
  createdAt: string;
};

type GetTicketsData = { tickets: Ticket[] };
type GetTicketsVars = { projectId: string };

type GetFeedData = { activityFeed: ActivityItem[] };
type GetFeedVars = { projectId: string };

type CreateTicketData = {
  createTicket: {
    id: string;
    projectId: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
};
type CreateTicketVars = {
  projectId: string;
  title: string;
  description?: string | null;
};

export default function ProjectPage() {
  const { projectId } = useParams();
  console.log("projectId param =", projectId);
  const pid = projectId ?? "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const ticketsQ = useQuery<GetTicketsData, GetTicketsVars>(GET_TICKETS, {
    variables: { projectId: pid },
    skip: !pid,
  });

  const feedQ = useQuery<GetFeedData, GetFeedVars>(GET_ACTIVITY_FEED, {
    variables: { projectId: pid },
    skip: !pid,
    pollInterval: 2000,
  });

  const [createTicket, { loading: creating }] = useMutation<
    CreateTicketData,
    CreateTicketVars
  >(CREATE_TICKET, {
    refetchQueries: [
      { query: GET_TICKETS, variables: { projectId: pid } },
      { query: GET_ACTIVITY_FEED, variables: { projectId: pid } },
    ],
  });

  const tickets = useMemo(() => ticketsQ.data?.tickets ?? [], [ticketsQ.data]);
  const feed = useMemo(() => feedQ.data?.activityFeed ?? [], [feedQ.data]);

  async function onCreateTicket() {
    const t = title.trim();
    if (!t || !pid) return;

    await createTicket({
      variables: {
        projectId: pid,
        title: t,
        description: description.trim() ? description.trim() : null,
      },
    });

    setTitle("");
    setDescription("");
  }

  if (!pid) return <p>Missing projectId in URL.</p>;
  if (ticketsQ.loading) return <p>Loading tickets...</p>;
  if (ticketsQ.error) return <p>Error: {ticketsQ.error.message}</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div>
        <h3>Tickets</h3>
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <strong>Create ticket</strong>
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              style={{ padding: 8 }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              style={{ padding: 8, minHeight: 70 }}
            />
            <button
              onClick={onCreateTicket}
              disabled={creating}
              style={{ padding: "8px 12px" }}
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {tickets.map((t) => (
            <div
              key={t.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <strong>{t.title}</strong>
                <span>{t.status}</span>
              </div>
              <small>
                Updated: {new Date(t.updatedAt).toLocaleString()}
                {t.assignee?.name ? ` • Assignee: ${t.assignee.name}` : ""}
              </small>
            </div>
          ))}
          {tickets.length === 0 && <small>No tickets yet.</small>}
        </div>
      </div>

      <aside
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 12,
          height: "fit-content",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>Activity Feed</strong>
          <small>{feedQ.loading ? "Loading..." : ""}</small>
        </div>

        {feedQ.error ? (
          <p>Error: {feedQ.error.message}</p>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {feed.map((a) => (
              <div
                key={a.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <small>{a.type}</small>
                  <small>{new Date(a.createdAt).toLocaleTimeString()}</small>
                </div>
                <div style={{ marginTop: 6 }}>{a.message}</div>
                <small>Ticket #{a.ticketId}</small>
              </div>
            ))}
            {feed.length === 0 && <small>No activity yet.</small>}
          </div>
        )}
      </aside>
    </div>
  );
}
