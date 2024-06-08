export class InvalidJsonOutputError extends Error {
  constructor() {
    super('The Output is not valid JSON.');
  }
}
