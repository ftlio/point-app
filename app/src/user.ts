/**
 * user.ts
 */

import { parsePhoneNumber } from 'libphonenumber-js';
import * as EmailValidator from 'email-validator';
import * as bcrypt from 'bcrypt';
import { Message } from './message';

const PASSWORD_SALT_ROUNDS = 10;

export class User {
  public id: string;
  public email?: string;
  public phoneNumber?: string;
  public passwordHash: string;
  public messages: Array<Message>;
  constructor({
    id,
    email,
    phoneNumber,
    passwordHash,
    messages
  }: {
    id: string;
    email?: string;
    phoneNumber?: string;
    passwordHash: string;
    messages?: Array<Message>;
  }) {
    if (phoneNumber === undefined && email === undefined) {
      throw new Error(`A user must have at least a phone number or email address - it can also have both`);
    }

    if (phoneNumber !== undefined) {
      const parsedNumber = parsePhoneNumber(phoneNumber, 'US');
      if (parsedNumber === undefined || !parsedNumber.isValid()) {
        throw new Error(`${phoneNumber} is not a valid phone number`);
      }
    }

    if (email !== undefined && !EmailValidator.validate(email)) {
      throw new Error(`${email} is not a valid email`);
    }

    this.id = id;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.passwordHash = passwordHash;
    this.messages = messages || [];
  }

  async hasPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  static async getPasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  }

  isEquivalentPhoneNumber(phoneNumber: string): boolean {
    return this.phoneNumber === undefined
      ? false
      : parsePhoneNumber(this.phoneNumber, 'US').isEqual(parsePhoneNumber(phoneNumber, 'US')!);
  }

  isEquivalentEmail(email: string): boolean {
    return this.email === undefined ? false : this.email.toLowerCase() == email.toLowerCase();
  }

  static async findByEmailOrPhoneNumber(
    userStore: Map<String, User>,
    email?: string,
    phoneNumber?: string
  ): Promise<User | null> {
    let user: User | null;
    if (email !== undefined) {
      user = await User.findByEmail(userStore, email);
    } else if (phoneNumber !== undefined) {
      user = await User.findByPhoneNumber(userStore, phoneNumber);
    } else {
      user = null;
    }

    return user;
  }

  static async findByEmail(userStore: Map<String, User>, email: string): Promise<User | null> {
    for (let user of userStore.values()) {
      if (user.isEquivalentEmail(email)) {
        return user;
      }
    }

    return null;
  }

  static async findByPhoneNumber(userStore: Map<String, User>, phoneNumber: string): Promise<User | null> {
    for (let user of userStore.values()) {
      if (user.isEquivalentPhoneNumber(phoneNumber)) {
        return user;
      }
    }

    return null;
  }

  static generateId(): string {
    return require('crypto').randomBytes(16).toString('hex');
  }
}
