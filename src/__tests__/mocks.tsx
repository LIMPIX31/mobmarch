import { Module } from '../Module'
import { injectable } from 'tsyringe'
import { action, computed, makeObservable, observable } from 'mobx'
import { BeforeResolve } from '../index'

// independent
@Module(false)
export class IndependentService {
  [BeforeResolve](): void {
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
export class SoftDependentA {
  [BeforeResolve](): void {
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
export class ModuleD {
  [BeforeResolve](): Promise<void> {
    return Promise.resolve().then(() => console.log('Init D'))
  }

  methodD() {
    return 'D'
  }
}

@Module(false, [ModuleD])
export class HardDependentC {
  [BeforeResolve](): void {
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
export class UnmeetE {
  [BeforeResolve](): void {
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

@Module(false)
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

@Module(false)
export class PossiblyAffected {
  @observable string = ''

  constructor() {
    makeObservable(this)
  }

  @action.bound
  push(value: string) {
    this.string += value
  }
}

@Module(false)
export class LongTimeModule {
  [BeforeResolve](): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 50))
  }

  method() {
    return 'LongTimeModule'
  }
}

@Module(false, [LongTimeModule])
export class Level3 {
  [BeforeResolve]() {
    return Promise.resolve()
  }

  constructor(private readonly ltm: LongTimeModule) {}

  target() {
    return 'target'
  }
}

@Module(false, [Level3])
export class Level2 {
  [BeforeResolve]() {
    return Promise.resolve()
  }

  constructor(public readonly l3: Level3) {}
}

@Module(false, [Level2])
export class Level1 {
  [BeforeResolve]() {
    return Promise.resolve()
  }

  constructor(public readonly l2: Level2) {}
}
