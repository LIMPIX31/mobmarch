export interface ModuleConstructor<T> {
  new (...args: any[]): T
}

export interface ModuleWrapper {
  constructor: ModuleConstructor<any>
  status: 'idle' | 'active'
  dependencies: Dependency[]
}

export type Dependency = ModuleConstructor<any>

export const BeforeResolve = Symbol('beforeResolve')
