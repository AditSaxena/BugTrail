package com.bugtrail.bugtrailbackend.graphql;

public record TicketGql(
        Long id,
        Long projectId,
        String title,
        String description,
        String status,
        UserGql assignee,
        String createdAt,
        String updatedAt
) {}
