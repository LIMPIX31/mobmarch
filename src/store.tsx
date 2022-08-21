import { createContext, FC, ReactNode } from 'react'
import { MasterService } from 'Master.service'
import { container } from 'tsyringe'

interface MarchStoreType {
  master: MasterService
}

export const createStore = (): MarchStoreType => ({
  master: container.resolve(MasterService),
})

export const MarchContext = createContext<MarchStoreType | null>(null)

export const MarchProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <MarchContext.Provider value={createStore()}>{children}</MarchContext.Provider>
)
