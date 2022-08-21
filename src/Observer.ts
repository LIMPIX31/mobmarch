import { observer } from 'mobx-react'
import { FC } from 'react'

export const Observer = <T>(component: FC<T>) => observer(component)
