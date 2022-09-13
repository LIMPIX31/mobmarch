import { container } from 'tsyringe'
import { ModuleConstructor, Dependency, ModuleWrapper } from './types'
import { UnknownModuleException } from './exceptions'
import { isModule, Module } from './Module'
import { NotAModuleException } from './exceptions'
import { UnreadyModuleException } from './exceptions'
import { ModuleDuplicationException } from './exceptions'

@Module(false)
export class MasterService {
  private modules: ModuleWrapper[] = []

  new<T>(module: ModuleConstructor<T>) {
    if (!isModule(module)) throw new NotAModuleException(module.name)
    if (this.modules.find(m => m.constructor === module)) throw new ModuleDuplicationException(module.name)
    const dependencies = Reflect.getMetadata('dependencies', module) as Dependency[]
    const unmet = this.checkDependencies(dependencies)
    unmet.forEach(this.new.bind(this))
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
        if (depWrapper.status === 'idle') await this.resolve(dep)
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
