/**
 * resolvers.ts
 */

import { User } from './user';
import { Message } from './message';
import jsonwebtoken from 'jsonwebtoken';

export const resolvers = (userStore: Map<String, User>) => ({
  createUser: async ({ input }) => {
    const id = User.generateId();
    const passwordHash = await User.getPasswordHash(input.password);
    const user = new User({ id, passwordHash, email: input.email, phoneNumber: input.phoneNumber });
    userStore.set(id, user);

    return user;
  },

  login: async ({ input }) => {
    const { email, phoneNumber, password } = input;

    const user = await User.findByEmailOrPhoneNumber(userStore, email, phoneNumber)

    if (user == null) {
      throw new Error(`Could not find user given email and password`);
    }

    if (await user.hasPassword(password)) {
      return jsonwebtoken.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    } else {
      throw new Error(`Invalid password for user`);
    }
  },

  me: (_, context: any) => {
    if (!context.user) {
      throw new Error(`Invalid User Authorization`)
    }

    return userStore.get(context.user.id)
  },

  messages: (_, context: any) => {
    if (!context.user) {
      throw new Error(`Invalid User Authorization`)
    }

    const user = userStore.get(context.user.id)
    if (!user) {
      throw new Error(`Unable to locate user with id ${context.user.id}`)
    }

    return user.messages
  },

  createMessage: ({ body }, context: any) => {
    if (!context.user) {
      throw new Error(`Invalid User Authorization`)
    }

    const user = userStore.get(context.user.id);

    if (user === undefined) {
      throw new Error(`Invalid User`);
    }

    const id = Message.generateId();
    const message = new Message({ id, body });
    user.messages.push(message);

    return message;
  }
});
