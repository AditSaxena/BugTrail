import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ADD_COMMENT,
  ASSIGN_TICKET,
  CHANGE_STATUS,
  GET_ACTIVITY_FEED,
  GET_COMMENTS,
  GET_TICKETS,
  GET_USERS,
} from "../graphql/queries";

type User = { id: string; name: string; role: string };
type Comment = { id: string; text: string; createdAt: string; author: User };
type Ticket = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  assignee?: { id: string; name: string } | null;
};

type GetUsersData = { users: User[] };

type GetCommentsData = { comments: Comment[] };
type GetCommentsVars = { ticketId: string };

type GetTicketsData = { tickets: Ticket[] };
type GetTicketsVars = { projectId: string };

type AddCommentData = { addComment: { id: string } };
type AddCommentVars = { ticketId: string; authorId: string; text: string };

type ChangeStatusData = { changeStatus: { id: string; status: string } };
type ChangeStatusVars = {
  ticketId: string;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
};

type AssignTicketData = { assignTicket: { id: string } };
type AssignTicketVars = { ticketId: string; userId: string };

type FeedItem = {
  id: string;
  type: string;
  message: string;
  ticketId: string;
  createdAt: string;
};
type GetFeedData = { activityFeed: FeedItem[] };
type GetFeedVars = { projectId: string };

export default function TicketPage() {
  const { projectId, ticketId } = useParams();
  const pid = projectId ?? "";
  const tid = ticketId ?? "";

  const [commentText, setCommentText] = useState("");
  const [authorId, setAuthorId] = useState<string>("");

  const usersQ = useQuery<GetUsersData>(GET_USERS);
  const ticketsQ = useQuery<GetTicketsData, GetTicketsVars>(GET_TICKETS, {
    variables: { projectId: pid },
    skip: !pid,
  });
  const commentsQ = useQuery<GetCommentsData, GetCommentsVars>(GET_COMMENTS, {
    variables: { ticketId: tid },
    skip: !tid,
    fetchPolicy: "network-only",
  });

  const feedQ = useQuery<GetFeedData, GetFeedVars>(GET_ACTIVITY_FEED, {
    variables: { projectId: pid },
    skip: !pid,
    pollInterval: 2000,
  });

  const users = useMemo(() => usersQ.data?.users ?? [], [usersQ.data]);
  const comments = useMemo(
    () => commentsQ.data?.comments ?? [],
    [commentsQ.data],
  );

  const ticket: Ticket | undefined = useMemo(() => {
    const list = ticketsQ.data?.tickets ?? [];
    return list.find((t) => t.id === tid);
  }, [ticketsQ.data, tid]);

  useMemo(() => {
    if (!authorId && users.length > 0) setAuthorId(users[0].id);
  }, [users, authorId]);

  const [addComment, { loading: adding }] = useMutation<
    AddCommentData,
    AddCommentVars
  >(ADD_COMMENT, {
    refetchQueries: [
      { query: GET_COMMENTS, variables: { ticketId: tid } },
      { query: GET_ACTIVITY_FEED, variables: { projectId: pid } },
    ],
  });

  const [changeStatus, { loading: changing }] = useMutation<
    ChangeStatusData,
    ChangeStatusVars
  >(CHANGE_STATUS, {
    refetchQueries: [
      { query: GET_TICKETS, variables: { projectId: pid } },
      { query: GET_ACTIVITY_FEED, variables: { projectId: pid } },
    ],
  });

  const [assignTicket, { loading: assigning }] = useMutation<
    AssignTicketData,
    AssignTicketVars
  >(ASSIGN_TICKET, {
    refetchQueries: [
      { query: GET_TICKETS, variables: { projectId: pid } },
      { query: GET_ACTIVITY_FEED, variables: { projectId: pid } },
    ],
  });

  async function onAddComment() {
    const text = commentText.trim();
    if (!text || !tid || !authorId) return;
    await addComment({ variables: { ticketId: tid, authorId, text } });
    setCommentText("");
  }

  async function onChangeStatus(next: "OPEN" | "IN_PROGRESS" | "DONE") {
    if (!tid) return;
    await changeStatus({ variables: { ticketId: tid, status: next } });
  }

  async function onAssign(userId: string) {
    if (!tid || !userId) return;
    await assignTicket({ variables: { ticketId: tid, userId } });
  }

  if (!pid || !tid) return <p>Missing projectId/ticketId in URL.</p>;
  if (ticketsQ.loading) return <p>Loading ticket...</p>;
  if (ticketsQ.error) return <p>Error: {ticketsQ.error.message}</p>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link to={`/projects/${pid}`} style={{ textDecoration: "none" }}>
          ← Back to project
        </Link>
        <small style={{ opacity: 0.7 }}>
          Project: {pid} • Ticket: {tid}
        </small>
      </div>

      <h3 style={{ marginTop: 12 }}>{ticket?.title ?? "Ticket"}</h3>
      <small>
        Status: <b>{ticket?.status ?? "-"}</b>
        {ticket?.assignee?.name ? ` • Assignee: ${ticket.assignee.name}` : ""}
      </small>

      {/* Actions */}
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}
      >
        <div
          style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}
        >
          <strong>Change status</strong>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button disabled={changing} onClick={() => onChangeStatus("OPEN")}>
              OPEN
            </button>
            <button
              disabled={changing}
              onClick={() => onChangeStatus("IN_PROGRESS")}
            >
              IN_PROGRESS
            </button>
            <button disabled={changing} onClick={() => onChangeStatus("DONE")}>
              DONE
            </button>
          </div>
        </div>

        <div
          style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}
        >
          <strong>Assign</strong>
          <div style={{ marginTop: 8 }}>
            <select
              defaultValue=""
              onChange={(e) => onAssign(e.target.value)}
              style={{ padding: 6, minWidth: 220 }}
              disabled={assigning || usersQ.loading || users.length === 0}
            >
              <option value="" disabled>
                Select user
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginTop: 16,
        }}
      >
        <div
          style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}
        >
          <strong>Comments</strong>

          {commentsQ.loading ? <p>Loading comments...</p> : null}
          {commentsQ.error ? <p>Error: {commentsQ.error.message}</p> : null}

          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <small>
                    <b>{c.author.name}</b> • {c.author.role}
                  </small>
                  <small>{new Date(c.createdAt).toLocaleString()}</small>
                </div>
                <div style={{ marginTop: 6 }}>{c.text}</div>
              </div>
            ))}
            {!commentsQ.loading && comments.length === 0 && (
              <small>No comments yet.</small>
            )}
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <small>Author:</small>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                style={{ padding: 6 }}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              style={{ padding: 8, minHeight: 70 }}
            />
            <button onClick={onAddComment} disabled={adding}>
              {adding ? "Adding..." : "Add comment"}
            </button>
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
          <strong>Recent Activity</strong>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {(feedQ.data?.activityFeed ?? [])
              .filter((a) => a.ticketId === tid)
              .slice(0, 20)
              .map((a) => (
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
                </div>
              ))}
            {feedQ.loading ? <small>Loading...</small> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
