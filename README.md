# BugTrail (Backend-heavy Ticketing + Kafka Activity Feed)

BugTrail is a mini Jira-like ticketing system built to showcase **Spring Boot + GraphQL + Postgres + Kafka**.
Every important user action emits an event to Kafka, a consumer persists it, and the UI shows a live Activity Feed.

## Features

- Projects → Tickets → Ticket details
- Comments on tickets
- Assign tickets to users
- Change ticket status (OPEN / IN_PROGRESS / DONE)
- **Kafka-powered Activity Feed** persisted to Postgres and displayed in UI

## Tech Stack

**Backend**

- Java + Spring Boot
- Spring for GraphQL (GraphiQL for testing)
- Spring Data JPA + Postgres
- Spring Kafka (Producer/Consumer)
- Docker Compose for local infra (Postgres + Kafka)

**Frontend**

- React + TypeScript + Vite
- Apollo Client (GraphQL)
- React Router

## Architecture (High Level)

1. UI calls GraphQL mutations (create ticket / assign / change status / add comment)
2. Backend publishes `ActivityEvent` to Kafka topic `bugtrail.activity.v1`
3. Kafka consumer stores into `activity_feed` table
4. UI polls `activityFeed(projectId)` to show near-real-time updates

## Local Setup

### 1) Start infra

From repo root:

```bash
docker compose up -d
```

### 2) Run backend

```bash
cd backend/bugtrail-backend
./mvnw spring-boot:run
```

GraphiQL: http://localhost:8080/graphiql

### 3) Run frontend

```bash
cd frontend/bugtrail-frontend
npm install
npm run dev
```

UI: http://localhost:5173

## Demo Script (2 minutes)

1. Create a project
2. Create a ticket
3. Open ticket → assign user + change status + add comment
4. Go back to project → Activity Feed shows all events (Kafka → DB → UI)

## Why GraphQL here?

GraphQL simplifies fetching exactly what UI needs for ticket lists, ticket details, comments, users, and activity feed—without overfetching or extra REST endpoints.
