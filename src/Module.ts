import { container, singleton } from 'tsyringe'
import { Dependency, ModuleConstructor } from './types'
import { MasterService } from './Master.service'
import { isStrategy, LocalStorageStrategy, Strategy } from './persistent'

export function Module<T>(target: ModuleConstructor<T>): void
export function Module(dependencies: Dependency[]): ClassDecorator
export function Module<T>(object: ModuleConstructor<T> | Dependency[]) {
  const decorate = (target: any, deps: Dependency[]) => {
    Reflect.defineMetadata('mobmarch:module', true, target)
    Reflect.defineMetadata('mobmarch:dependencies', deps, target)
    singleton()(target)
    container.resolve(MasterService).new(target)
  }
  if (Array.isArray(object)) return (target: T) => decorate(target, object)
  else decorate(object, [])
}

export function MasterModule<T>(target: ModuleConstructor<T>): any {
  Reflect.defineMetadata('mobmarch:module', true, target)
  Reflect.defineMetadata('mobmarch:dependencies', [], target)
  singleton()(target)
}

export function PersistentModule<T>(target: ModuleConstructor<T>): void
export function PersistentModule(dependencies: Dependency[], strategy?: Strategy): ClassDecorator
export function PersistentModule(strategy: Strategy, dependencies?: Dependency[]): ClassDecorator
export function PersistentModule<T>(a1: ModuleConstructor<T> | Dependency[] | Strategy, a2?: Strategy | Dependency[]) {
  const wrap = (target: any, strategy: Strategy = LocalStorageStrategy, deps: Dependency[] = []) => {
    Reflect.defineMetadata('mobmarch:persistent', true, target)
    Reflect.defineMetadata('mobmarch:strategy', strategy, target)
    Module(deps)(target)
  }
  if (Array.isArray(a1)) return (target: T) => wrap(target, a2 as Strategy, a1 as Dependency[])
  else if (isStrategy(a1)) return (target: T) => wrap(target, a1, a2 as Dependency[])
  else wrap(a1, LocalStorageStrategy, [])
}

export const isModule = (target: object): boolean => Reflect.hasMetadata('mobmarch:module', target)

export const isPersistentModule = (target: object): boolean => Reflect.hasMetadata('mobmarch:persistent', target)
