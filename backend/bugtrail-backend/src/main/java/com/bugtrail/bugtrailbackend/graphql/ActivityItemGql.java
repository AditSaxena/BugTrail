package com.bugtrail.bugtrailbackend.graphql;

public record ActivityItemGql(
        Long id,
        Long projectId,
        Long ticketId,
        String type,
        String message,
        String createdAt
) {}