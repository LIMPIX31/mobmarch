import { Awaitable, Dependency, ModuleConstructor } from './types'
import { ClassTransformOptions, instanceToPlain, plainToInstance } from 'class-transformer'
import { isModule, isPersistentModule } from './Module'
import { NotAModuleException, NotPersistentModuleException } from './exceptions'
import { container } from 'tsyringe'
import { UnresolvedModuleAttemptException } from './exceptions/UnresolvedModuleAttempt.exception'

export type Trait<T extends object> = T | ModuleConstructor<T>

export const unwrapTrait = <T extends object>(trait: Trait<T>): ModuleConstructor<T> => {
  if (trait instanceof Function) return trait
  else return trait.constructor as ModuleConstructor<T>
}

export interface Strategy {
  serialize(instance: object): Awaitable<Record<string, any>>

  deserialize(constructor: Dependency, json: Record<string, any>): Awaitable<object>

  load(key: string): Awaitable<object | null | undefined>

  save(key: string, payload: object): Awaitable<void>

  clear(key: string): Awaitable<void>
}

export const isStrategy = (o: object): o is Strategy =>
  'serialize' in o && 'deserialize' in o && 'load' in o && 'save' in o && 'clear' in o

const i2pOptions: ClassTransformOptions = {
  excludeExtraneousValues: true,
}

export const LocalStorageStrategy: Strategy = {
  serialize: instance => instanceToPlain(instance, i2pOptions),
  deserialize: (constructor, json) => plainToInstance(constructor, json),
  load: key => {
    const value = localStorage.getItem(key)
    if (value) return JSON.parse(value)
    else return value
  },
  save: (key, payload) => localStorage.setItem(key, JSON.stringify(payload)),
  clear: localStorage.removeItem,
}

const getStrategy = <T>(target: ModuleConstructor<T>): Strategy => Reflect.getMetadata('mobmarch:strategy', target)

const getPersistentController = <T extends object>(trait: Trait<T>, action: string) => {
  const module = unwrapTrait(trait)
  if (!isModule(module)) throw new NotAModuleException(module.name)
  if (!isPersistentModule(module)) throw new NotPersistentModuleException(module.name)
  let instance
  try {
    instance = container.resolve(module)
  } catch (e: any) {
    throw new UnresolvedModuleAttemptException(module.name, action)
  }
  const strategy = getStrategy(module)
  return [module, instance, strategy] as [ModuleConstructor<any>, any, Strategy]
}

const copy = <T extends object>(from: T, to: T) => {
  for (const [key, value] of Object.entries(from)) to[key as keyof T] = value
}

export const save = async <T extends object>(trait: Trait<T>) => {
  const [module, instance, startegy] = getPersistentController(trait, 'save')
  const key = `mmarch:${module.name}`
  await startegy.save(key, await startegy.serialize(instance))
}

export const load = async <T extends object>(trait: Trait<T>) => {
  const [module, instance, startegy] = getPersistentController(trait, 'save')
  const key = `mmarch:${module.name}`
  const rawData = await startegy.load(key)
  if (!rawData) return
  const deserialized = await startegy.deserialize(module, rawData)
  copy(deserialized, instance)
}
