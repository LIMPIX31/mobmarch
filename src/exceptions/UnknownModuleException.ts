export class UnknownModuleException extends Error {
  constructor(name: string) {
    super(
      `Module ${name} is not registered in mobmarch. Check if ${name} has been registered using 'register()' or '<Defer>'`,
    )
  }
}
