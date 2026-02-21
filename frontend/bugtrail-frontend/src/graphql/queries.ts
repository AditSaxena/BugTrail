import { gql } from "@apollo/client/core";

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      createdAt
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!) {
    createProject(name: $name) {
      id
      name
      createdAt
    }
  }
`;

export const GET_TICKETS = gql`
  query GetTickets($projectId: ID!) {
    tickets(projectId: $projectId) {
      id
      title
      status
      updatedAt
      assignee {
        id
        name
      }
    }
  }
`;

export const CREATE_TICKET = gql`
  mutation CreateTicket(
    $projectId: ID!
    $title: String!
    $description: String
  ) {
    createTicket(
      projectId: $projectId
      title: $title
      description: $description
    ) {
      id
      title
      status
      createdAt
    }
  }
`;

export const GET_ACTIVITY_FEED = gql`
  query GetActivityFeed($projectId: ID!) {
    activityFeed(projectId: $projectId) {
      id
      type
      message
      ticketId
      createdAt
    }
  }
`;
