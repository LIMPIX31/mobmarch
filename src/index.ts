export { Module } from './Module'
export { register } from './register'
export { MarchProvider } from './store'
export { useModule, useDeferredModule } from './hooks'
export * from './exceptions'
export { Defer } from './components'
export type { DeferProps } from './components'
export { Observer } from './Observer'
export type { Dependency, ModuleConstructor } from './types'
export const BeforeResolve = Symbol('beforeResolve')
