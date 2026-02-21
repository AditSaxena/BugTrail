import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { HttpLink } from "@apollo/client/link/http";

const link = new HttpLink({
  uri: "http://localhost:8080/graphql",
});

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
