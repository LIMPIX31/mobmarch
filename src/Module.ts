import { container, singleton } from 'tsyringe'
import { Dependency, ModuleConstructor } from 'types'
import { MasterService } from 'Master.service'

export function Module<T>(target: ModuleConstructor<T>): void
export function Module<T>(dependencies: Dependency[]): (target: ModuleConstructor<T>) => void
export function Module<T>(autoStart: boolean): (target: ModuleConstructor<T>) => void
export function Module<T>(autoStart: boolean, dependencies: Dependency[]): (target: ModuleConstructor<T>) => void
export function Module<T>(object: ModuleConstructor<T> | Dependency[] | boolean, dependencies: Dependency[] = []) {
  const decorate = (target: any, deps: Dependency[], autoStart = true) => {
    Reflect.defineMetadata('module', true, target)
    singleton()(target)
    if (autoStart) (async () => container.resolve(MasterService).new(target, deps))()
  }
  if (Array.isArray(object)) return (target: T) => decorate(target, object)
  else if (typeof object === 'boolean') return (target: T) => decorate(target, dependencies, object)
  else decorate(object, [])
}

export const isModule = <T>(target: T): boolean => {
  return Reflect.hasMetadata('module', target)
}

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
