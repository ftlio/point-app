# Point App

## Running
### Docker + Make
If you have Docker installed, you only need to run `make` to build and run the
server.  It will bind on port 4000 on your machine (same port as the node
service)

### Node + NPM
With node 14+
```
npm install
npm run build
npm run start
```

## API / GraphQL
We use graphql to
- Create a user
- Login

without requiring an `Authorization: Bearer <JWT>` header.

After retrieving a JWT with a `login` query, you can make subsequent requests to:

- Create a message
- Retrieve a user (and their messages)
- Retrieve a user's messages (maybe a bit redundant)

The only endpoint is `/graphql`, and a `/graphql/graphiql` endpoint is
available for the graphiql client.

The entire graphql SDL is here:
```
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
```

Some useful graphQL to test things out
```
mutation createUser{
  createUser(input:{
    email: "blah@example.com",
    phoneNumber: "951-444-8850"
    password:"asdf1234"
  }) {
    id
  }
}

mutation loginEmail {
  login(input: {
    email: "andrewlen@gmail.com",
    password: "asdf1234"
  })
}

mutation loginPhoneNumber {
  login(input: {
    phoneNumber: "9514448850",
    password: "asdf1234"
  })
}

mutation createMessage1 {
  createMessage(body: "message 1") {
    id
  }
}

mutation createMessage2 {
  createMessage(body: "message 2") {
    id
  }
}

query me {
  me {
    id,
    email,
    phoneNumber
    messages {
      id,
      body
    }
  }
}

query messages {
  messages {
    id,
    body
  }
}

```

## Considerations
This is my first time working with GraphQL, so I haven't fully grokked the data
model.

### API / Authentication / Authorization
- Using JWTs because they're fairly simple to implement for this exercise.
- Not using a separate `/signup` or `/login` endpoint, which has the pro of
allowing everything to be queried with graphQL, but the con of having to
push a user-aware context to every resolver.  Thinking out loud, this might be
necessary to deal with something like role-based or relationshio-based access.
The alternative strategy considered was having the separate endpoints and
effectively mounting them separately in the express app, so that the auth
middleware could be blanket-applied to the graphql endpoint.

### Persistence
I went with a fairly naive "Store" concept for storing users based on a
randomly generated ID.  There isn't any deduplication of a user signing up
with the same email / phone number :(

I immediately ran into that the "Store" isn't indexed by an email or
phone number, so had to iterate through the map.  I could have created
separate maps to index this, but that would have been pretty complicated
for something only meant to temporarily stand-in for a database with
proper indexing.  The User model goes a little bit beyond the letter of the
specification, allowing you to create a user with an email AND a phone number
and authenticate with either the email or phone number and correct password.

Bcrypt was used to store the passwords.

Right now persistance is handled by a User map, and the User model is doing
all the heavy lifting with some static methods that are passed that map for
lookup.

### Build + TypeScript
The build and typescript are a little heavy-handed.  I like to ship things with
one-liner build and run, which Docker helps, and I like typescript, but they
definitely weren't necessary here!
