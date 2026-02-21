# Architecture

```
[React + Apollo UI]
        |
        | GraphQL (Queries/Mutations)
        v
[Spring Boot + GraphQL API] -----> (publish ActivityEvent) -----> [Kafka Topic: bugtrail.activity.v1]
        |                                                         |
        | JPA                                                     | consume
        v                                                         v
   [Postgres] <------ persist ActivityFeed <------ [Kafka Consumer Service]
        |
        | GraphQL Query: activityFeed(projectId)
        v
[UI Activity Feed Panel]
```
