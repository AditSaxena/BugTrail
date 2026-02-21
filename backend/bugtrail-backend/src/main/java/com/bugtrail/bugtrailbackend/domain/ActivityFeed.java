package com.bugtrail.bugtrailbackend.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "activity_feed")
public class ActivityFeed {

    public enum Type {
        TICKET_CREATED,
        STATUS_CHANGED,
        ASSIGNED,
        COMMENT_ADDED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private Long ticketId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Type type;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ActivityFeed() {}

    public ActivityFeed(Long projectId, Long ticketId, Type type, String message) {
        this.projectId = projectId;
        this.ticketId = ticketId;
        this.type = type;
        this.message = message;
    }

    public Long getId() { return id; }
    public Long getProjectId() { return projectId; }
    public Long getTicketId() { return ticketId; }
    public Type getType() { return type; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
}