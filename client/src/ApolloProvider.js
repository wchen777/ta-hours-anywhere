import React from 'react'
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider as Provider, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

// straight from apollo client (react) documentation 

// sets up apollo client provider to connect to server

let httpLink = createHttpLink({
  uri: 'http://localhost:4000',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// combine both http link and auth link
httpLink = authLink.concat(httpLink)

const wsLink = new WebSocketLink({
    uri: `ws://localhost:4000/graphql`,
    options: {
      reconnect: true,
      connectionParams: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
    }
  });

// if query or mutation: use http link, if subscription: use socket link
const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});


export default function ApolloProvider(props) {
    return <Provider client={client} {...props} />
}

