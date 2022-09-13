import { FC, ReactNode, useEffect } from 'react'
import { Dependency } from './types'
import { useAwaitAll } from './hooks'

export interface DeferProps {
  errorFallback?: ReactNode
  fallback?: ReactNode
  depend: Dependency[] | Dependency
  children: ReactNode
}

export const Defer: FC<DeferProps> = ({ depend, children, fallback, errorFallback }) => {
  const [loading, error] = useAwaitAll(Array.isArray(depend) ? depend : [depend])
  useEffect(() => {
    if (error) console.error(error)
  }, [error])
  return <>{error ? errorFallback : loading ? fallback : children}</>
}
