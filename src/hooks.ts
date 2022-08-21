import { Dependency, ModuleConstructor } from './types'
import { useContext, useEffect, useState } from 'react'
import { MarchContext } from './store'

const useStore = () => {
  const store = useContext(MarchContext)
  if (!store) throw new Error('mobmarch must be used within a MarchProvider.')
  return store
}

export const useModule = <T>(module: ModuleConstructor<T>): T => {
  return useStore().master.resolveImmediately(module)
}

export const useDeferredModule = <T>(module: ModuleConstructor<T>): [loading: boolean, module?: T, error?: Error] => {
  const store = useStore()
  const [loading, setLoading] = useState(true)
  const [instance, setInstance] = useState<T>()
  const [error, setError] = useState<Error>()
  useEffect(() => {
    store.master
      .resolve(module)
      .then(instance => setInstance(instance))
      .catch(error => setError(error))
      .finally(() => setLoading(false))
  }, [])
  return [loading, instance, error]
}

export const useAwaitAll = (dependencies: Dependency[]): [loading: boolean, error?: Error] => {
  const store = useStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  useEffect(() => {
    Promise.all(dependencies.map(dependency => store.master.resolve(dependency)))
      .then(() => setLoading(false))
      .catch(error => setError(error))
      .finally(() => setLoading(false))
  }, [])
  return [loading, error]
}
