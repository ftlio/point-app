/**
 * schema.ts
 */

import { buildSchema } from 'graphql';

export const schema = buildSchema(`
type User {
  id: ID!
  email: String
  phoneNumber: String
  messages: [Message]
}

type Message {
  id: ID!
  body: String
}

type Query {
  me: User
  messages: [Message]
}

input UserInput {
  email: String
  phoneNumber: String
  password: String!
}

type Mutation {
  createUser(input: UserInput): User
  createMessage(body: String!): Message
  login(input: UserInput): String
}
`)
