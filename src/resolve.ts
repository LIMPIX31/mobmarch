import { ModuleConstructor } from './types'
import { container } from 'tsyringe'
import { MasterService } from './Master.service'

export const resolve = async <T>(module: ModuleConstructor<T>): Promise<T> => {
  return container.resolve(MasterService).resolve(module)
}
