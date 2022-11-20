import { container } from 'tsyringe'
import { ModuleConstructor, Dependency, ModuleWrapper } from './types'
import { UnknownModuleException } from './exceptions'
import { isModule, isPersistentModule, MasterModule } from './Module'
import { NotAModuleException } from './exceptions'
import { UnreadyModuleException } from './exceptions'
import { BeforeResolve } from './index'
import { load } from './persistent'

@MasterModule
export class MasterService {
  private modules: ModuleWrapper[] = []

  new<T>(module: ModuleConstructor<T>) {
    if (!isModule(module)) throw new NotAModuleException(module.name)
    if (this.modules.find(m => m.constructor === module)) return
    const dependencies = Reflect.getMetadata('mobmarch:dependencies', module) as Dependency[]
    dependencies.forEach(this.new.bind(this))
    this.modules.push({ constructor: module, status: 'idle', dependencies })
    return this
  }

  private getWrapped(dependency: Dependency) {
    const wrapper = this.modules.find(module => module.constructor === dependency)
    if (!wrapper) throw new TypeError(`External dependency ${dependency.name} has no wrapper in master service.`)
    return wrapper
  }

  private async initialize(dependency: Dependency): Promise<void> {
    const wrapper = this.getWrapped(dependency)
    if (wrapper.status === 'active') return
    await Promise.all(wrapper.dependencies.map(this.resolve.bind(this)))
    const instance = container.resolve(dependency)
    wrapper.status = 'active'
    if (isPersistentModule(dependency)) await load(dependency)
    if (instance[BeforeResolve]) await instance[BeforeResolve]()
  }

  async resolve<T>(module: ModuleConstructor<T>): Promise<T> {
    const wrapper = this.getWrapped(module)
    if (!wrapper) throw new UnknownModuleException(module.name)
    if (wrapper.status === 'idle') {
      if (!wrapper.resolution) wrapper.resolution = this.initialize(module)
      await wrapper.resolution
    }
    return container.resolve(module)
  }

  resolveImmediately<T>(module: ModuleConstructor<T>): T {
    const wrapper = this.getWrapped(module)
    if (!wrapper) throw new UnknownModuleException(module.name)
    if (wrapper.status === 'idle') throw new UnreadyModuleException(module.name)
    return container.resolve(module)
  }
}
