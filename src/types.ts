export interface ModuleConstructor<T> {
  new (...args: any[]): T
}

export interface ModuleWrapper {
  constructor: ModuleConstructor<any>
  status: 'idle' | 'active'
  dependencies: Dependency[]
  resolution?: Promise<any>
}

export type Dependency = ModuleConstructor<any>

export type Awaitable<T> = Promise<T> | T
