import { Dependency } from './types'
import { container } from 'tsyringe'
import { MasterService } from './Master.service'

export const register = (...modules: Dependency[]) => {
  for (const module of modules) {
    try {
      const master = container.resolve(MasterService)
      master.new(module)
    } catch (e: any) {
      throw new Error(`Failed to register module ${module.name}. Reason: ${e.message}`)
    }
  }
}
