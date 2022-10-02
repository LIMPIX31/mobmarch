export class NotPersistentModuleException extends Error {
  constructor(name: string) {
    super(`Module ${name} is not persistent`)
  }
}
