import { ModuleConstructor } from '../types'

export class NotMetDependenciesException extends Error {
  constructor(public readonly unmets: Array<ModuleConstructor<any>>) {
    super(`Dependencies [${unmets.map(v => v.name).join(', ')}] are not met.`)
  }
}
