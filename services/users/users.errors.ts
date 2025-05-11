export class DuplicateUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateUserError";
    Object.setPrototypeOf(this, DuplicateUserError.prototype);
  }
}
