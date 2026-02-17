package com.bugtrail.bugtrailbackend.graphql;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;


@ControllerAdvice
public class GraphqlExceptionAdvice {

    @GraphQlExceptionHandler(IllegalArgumentException.class)
    public GraphQLError handle(IllegalArgumentException ex) {
        return GraphqlErrorBuilder.newError()
                .message(ex.getMessage())
                .build();
    }
}
