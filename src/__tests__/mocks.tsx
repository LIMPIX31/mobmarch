import { Initable } from 'types'
import { Module } from 'Module'
import { injectable } from 'tsyringe'
import { action, computed, makeObservable, observable } from 'mobx'

// independent
@Module(false)
export class IndependentService implements Initable {
  init(): void {
    console.log('Init')
  }

  get message() {
    return "Hello. I'm independent service."
  }
}

// soft dependent
@injectable()
class B {
  methodB() {
    return 'B'
  }
}

@Module(false)
export class SoftDependentA implements Initable {
  init(): void {
    console.log('Init A')
  }

  constructor(private serviceB: B) {}

  invokeB() {
    return this.serviceB.methodB()
  }

  methodA() {
    return 'A'
  }
}

// hard dependent
@Module(false)
export class ModuleD implements Initable {
  init(): Promise<void> {
    return Promise.resolve().then(() => console.log('Init D'))
  }

  methodD() {
    return 'D'
  }
}

@Module(false, [ModuleD])
export class HardDependentC implements Initable {
  init(): void {
    console.log('Init C')
    console.log(`Accessing to ModuleD: ${this.moduleD.methodD()}`)
  }

  constructor(private moduleD: ModuleD) {
    console.log(`Use ModuleD in constructor: ${this.moduleD.methodD()}`)
  }

  methodC() {
    return 'C'
  }

  invokeD() {
    return this.moduleD.methodD()
  }
}

@Module(false)
export class UnmeetE implements Initable {
  init(): void {
    console.log('Init E')
  }

  constructor(private moduleD: ModuleD) {}

  methodE() {
    return 'E'
  }

  invokeD() {
    return this.moduleD.methodD()
  }
}

@Module
export class CounterModule {
  @observable value = 0

  constructor() {
    makeObservable(this)
  }

  @action.bound
  increment() {
    this.value++
  }

  @action.bound
  decrement() {
    this.value--
  }

  @computed
  get square() {
    return this.value * this.value
  }
}
