# Personal Notes (BugTrail)

These notes are for quick interview recall: key decisions, tradeoffs, and “what I’d improve next”.

## 1) What the project is
BugTrail is a mini Jira-like ticketing system:
- Projects → Tickets
- Ticket actions: assign, change status, add comments
- An **Activity Feed** is generated in an event-driven way using **Kafka**

## 2) Core architecture
- UI (React + Apollo) calls GraphQL queries/mutations
- Backend (Spring Boot + GraphQL) handles business logic + persistence
- On every important mutation, backend publishes an `ActivityEvent` to Kafka topic:
  - `bugtrail.activity.v1`
- A Kafka consumer stores events into Postgres table `activity_feed`
- UI reads feed via `activityFeed(projectId)` (polling in Day 4)

Why it’s cool: the feed is **decoupled** from the write path—easy to scale and extend.

## 3) Why GraphQL (what to say)
- UI needs nested objects (ticket + assignee + timestamps, comments + author)
- GraphQL lets UI fetch **exactly** what it needs in one request
- Cleaner than multiple REST endpoints + joins on the client

## 4) Why Kafka (what to say)
- Separates “ticket updates” from “activity feed generation”
- Event stream is reusable for:
  - notifications (email/slack), audit logs, analytics
  - future consumers without changing core mutations
- Consumer group model supports scaling consumers horizontally

## 5) Tradeoffs / known limitations (say honestly)
- Polling for feed is simple; true real-time would use **GraphQL subscriptions / WebSockets**
- Activity feed consumer is not idempotent yet (duplicate events could be stored if reprocessed)
- No auth yet (should add JWT + role-based access later)

## 6) Failure handling (good answers)
- If Kafka is down: mutations can still succeed, but feed won’t update (depending on how strict we want to be)
- If consumer is down: Kafka retains messages; consumer catches up after restart (offsets)
- For production: add retries / DLQ topic for poison messages

## 7) What I’d improve next (nice “growth” list)
- Auth: JWT + RBAC (ADMIN/DEV/QA)
- Pagination + filtering (tickets, activity feed)
- Subscriptions (real-time feed)
- Search (title/description), tags/labels
- Observability: structured logging, metrics, tracing
- Deploy: managed Postgres + hosted Kafka (or replace with Redis Streams / SNS/SQS depending on stack)

## 8) 30-second walkthrough (practice)
“I built a ticketing system with Spring Boot + GraphQL. Projects have tickets; you can assign tickets, change status, and add comments.
Every mutation publishes an event to Kafka; a consumer stores it in Postgres as an activity feed.
The React + Apollo UI displays tickets and a near-real-time activity panel. It demonstrates backend-heavy design with event-driven architecture.”

## 9) Quick commands (local)
- Start infra: `docker compose up -d`
- Backend: `cd backend/bugtrail-backend && ./mvnw spring-boot:run`
- Frontend: `cd frontend/bugtrail-frontend && npm run dev`
