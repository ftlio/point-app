/**
 * server.ts
 */
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import jwt from 'express-jwt';

import { User } from './user';
import { schema } from './schema';
import { resolvers } from './resolvers'

const users = new Map<String, User>();

const auth = jwt({
  secret: process.env.JWT_SECRET!,
  credentialsRequired: false,
  algorithms: ['HS256']
});

const app = express();
app.use(
  '/graphql',
  auth,
  graphqlHTTP((req: any) => ({
    schema: schema,
    rootValue: resolvers(users),
    context: {
      user: req.user
    },
    graphiql: true
  }))
);
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
