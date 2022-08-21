export class ModuleDuplicationException extends Error {
  constructor(name: string) {
    super(`Module ${name} is already registered in mobmarch.`)
  }
}
