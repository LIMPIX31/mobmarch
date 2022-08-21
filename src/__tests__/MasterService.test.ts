import { MasterService } from 'Master.service'
import { SoftDependentA, IndependentService, HardDependentC, ModuleD } from '__tests__/mocks'
import { NotMetDependenciesException } from 'exceptions'
import { UnreadyModuleException } from 'exceptions'
import { ModuleDuplicationException } from 'exceptions'
import { container } from 'tsyringe'

describe('MasterService', () => {
  const newMaster = () => new MasterService()

  beforeEach(() => container.clearInstances())

  it('should resolve independent service', async () => {
    const master = newMaster()
    await master.new(IndependentService, [])
    const service = await master.resolve(IndependentService)
    expect(service.message).toBe("Hello. I'm independent service.")
  })

  it('should resolve soft dependent service', async () => {
    const master = newMaster()
    await master.new(SoftDependentA, [])
    const service = await master.resolve(SoftDependentA)
    expect(service.invokeB()).toBe('B')
    expect(service.methodA()).toBe('A')
  })

  it('should resolve hard dependent service', async () => {
    const master = newMaster()
    await master.new(ModuleD, [])
    await master.new(HardDependentC, [ModuleD])
    const moduleD = await master.resolve(ModuleD)
    const moduleC = await master.resolve(HardDependentC)
    expect(moduleD.methodD()).toBe('D')
    expect(moduleC.invokeD()).toBe('D')
  })

  it('should throw error on unmet dependency', async () => {
    const master = newMaster()
    let err
    try {
      await master.new(HardDependentC, [ModuleD])
    } catch (e) {
      err = e
    }
    expect(err).toBeInstanceOf(NotMetDependenciesException)
  })

  it('should throw if requested unready module', async () => {
    const master = newMaster()
    await master.new(ModuleD, [])
    await master.new(HardDependentC, [ModuleD])
    let err
    try {
      await master.resolveImmediately(HardDependentC)
    } catch (e) {
      err = e
    }
    expect(err).toBeInstanceOf(UnreadyModuleException)
  })

  it('should throw duplication error', () => {
    const master = newMaster()
    let err
    try {
      master.new(IndependentService, [])
      master.new(IndependentService, [])
    } catch (e) {
      err = e
    }
    expect(err).toBeInstanceOf(ModuleDuplicationException)
  })
})
