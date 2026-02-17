package com.bugtrail.bugtrailbackend.graphql;

public record CommentGql(
        Long id,
        Long ticketId,
        UserGql author,
        String text,
        String createdAt
) {}
