import { container } from 'tsyringe'
import { ModuleConstructor, Dependency, ModuleWrapper } from './types'
import { NotMetDependenciesException } from './exceptions'
import { UnknownModuleException } from './exceptions'
import { isModule, Module } from './Module'
import { NotAModuleException } from './exceptions'
import { UnreadyModuleException } from './exceptions'
import { ModuleDuplicationException } from './exceptions'

@Module(false)
export class MasterService {
  private modules: ModuleWrapper[] = []

  new<T>(module: ModuleConstructor<T>, dependencies: Dependency[]) {
    if (!isModule(module)) throw new NotAModuleException(module.name)
    if (this.modules.find(m => m.constructor === module)) throw new ModuleDuplicationException(module.name)
    const unmet = this.checkDependencies(dependencies)
    if (unmet.length !== 0) throw new NotMetDependenciesException(unmet)
    this.modules.push({ constructor: module, status: 'idle', dependencies })
  }

  private checkDependencies(dependencies: Dependency[]) {
    return dependencies.filter(dependency => !this.modules.find(service => service.constructor === dependency))
  }

  private getWrapped(dependency: Dependency) {
    const wrapper = this.modules.find(module => module.constructor === dependency)
    if (!wrapper) throw new TypeError(`External dependency ${dependency.name} has no wrapper in master service.`)
    return wrapper
  }

  private async satisfy(dependency: Dependency): Promise<void> {
    const instance = container.resolve(dependency)
    if (instance.init) await instance.init()
  }

  async resolve<T>(module: ModuleConstructor<T>): Promise<T> {
    const wrapper = this.getWrapped(module)
    if (!wrapper) throw new UnknownModuleException(module.name)
    if (wrapper.status === 'idle') {
      for (const dep of wrapper.dependencies) {
        const depWrapper = this.getWrapped(dep)
        if (depWrapper.status === 'idle') await this.satisfy(dep).then(() => (depWrapper.status = 'active'))
      }
      await this.satisfy(module)
      wrapper.status = 'active'
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
