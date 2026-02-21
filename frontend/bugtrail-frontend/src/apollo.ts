import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { HttpLink } from "@apollo/client/link/http";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/graphql";

const link = new HttpLink({
  uri: API_URL,
});

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
