export class NotAModuleException extends Error {
  constructor(name: string) {
    super(`Constructor ${name} is not a module. Please check if ${name} is decorated with @Module`)
  }
}
