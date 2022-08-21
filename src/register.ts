import { Dependency } from './types'
import { container } from 'tsyringe'
import { MasterService } from './Master.service'

export const register = (...modules: Array<[module: Dependency, ...dependencies: Dependency[]]>) => {
  for (const [module, ...deps] of modules) {
    try {
      const master = container.resolve(MasterService)
      master.new(module, deps)
    } catch (e: any) {
      throw new Error(`Failed to register module ${module.name}. Reason: ${e.message}`)
    }
  }
}
