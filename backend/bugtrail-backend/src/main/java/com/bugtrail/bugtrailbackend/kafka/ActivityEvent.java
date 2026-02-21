package com.bugtrail.bugtrailbackend.kafka;

public record ActivityEvent(
        Long projectId,
        Long ticketId,
        String type,
        String message,
        String createdAt
) {}