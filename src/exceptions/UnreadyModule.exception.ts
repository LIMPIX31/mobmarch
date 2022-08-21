export class UnreadyModuleException extends Error {
  constructor(name: string) {
    super(`Module ${name} requested, but not ready.`)
  }
}
