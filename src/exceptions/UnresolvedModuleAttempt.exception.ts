export class UnresolvedModuleAttemptException extends Error {
  constructor(name: string, action: string) {
    super(`The action "${action}" cannot be performed on module "${name}" because that module is not yet ready`)
  }
}
