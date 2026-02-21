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

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      role
    }
  }
`;

export const GET_COMMENTS = gql`
  query GetComments($ticketId: ID!) {
    comments(ticketId: $ticketId) {
      id
      text
      createdAt
      author {
        id
        name
        role
      }
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($ticketId: ID!, $authorId: ID!, $text: String!) {
    addComment(ticketId: $ticketId, authorId: $authorId, text: $text) {
      id
      text
      createdAt
      author {
        id
        name
      }
    }
  }
`;

export const CHANGE_STATUS = gql`
  mutation ChangeStatus($ticketId: ID!, $status: TicketStatus!) {
    changeStatus(ticketId: $ticketId, status: $status) {
      id
      status
      updatedAt
      assignee {
        id
        name
      }
    }
  }
`;

export const ASSIGN_TICKET = gql`
  mutation AssignTicket($ticketId: ID!, $userId: ID!) {
    assignTicket(ticketId: $ticketId, userId: $userId) {
      id
      updatedAt
      assignee {
        id
        name
      }
    }
  }
`;
