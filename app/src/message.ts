/**
 * message.ts
 */

export class Message {
  public id: String
  public body: String
  constructor({ id, body }: { id: String, body: String }) {
    this.id = id;
    this.body = body;
  }

  static generateId(): string {
    return require('crypto').randomBytes(16).toString('hex');
  }
}
