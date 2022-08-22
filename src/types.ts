export type Awaitable<T> = Promise<T> | T

export interface Initable {
  init(): Awaitable<any>
}

export interface ModuleConstructor<T> {
  new (...args: any[]): T
}

export interface ModuleWrapper {
  constructor: ModuleConstructor<any>
  status: 'idle' | 'active'
  dependencies: Dependency[]
}

export type Dependency = ModuleConstructor<any>
