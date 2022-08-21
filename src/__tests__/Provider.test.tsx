import { render, screen } from '@testing-library/react'
import { MarchProvider } from '../store'
import { register } from '../register'
import { FC } from 'react'
import { useModule } from '../hooks'
import { Defer } from '../components'
import { container } from 'tsyringe'
import { HardDependentC, IndependentService, ModuleD, SoftDependentA } from './mocks'

const DisplayIndependent: FC = () => {
  const module = useModule(IndependentService)
  return <span role={'textbox'}>{module.message}</span>
}

const DisplayHard: FC = () => {
  const c = useModule(HardDependentC)
  const d = useModule(ModuleD)
  const a = useModule(SoftDependentA)
  return (
    <span role={'textbox'}>
      {c.invokeD()}
      {d.methodD()}
      {a.invokeB()}
    </span>
  )
}

describe('MarchProvider', () => {
  beforeEach(() => container.clearInstances())

  it('should provide service', async () => {
    register([IndependentService])
    render(
      <MarchProvider>
        <Defer depend={IndependentService}>
          <DisplayIndependent />
        </Defer>
      </MarchProvider>,
    )
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(await screen.findByRole('textbox')).toHaveTextContent("Hello. I'm independent service.")
    // await waitFor(() => expect(screen.queryByText(/A/i)).toBeInTheDocument())
  })

  it('should provide hard dependent multiple', async () => {
    register([ModuleD], [HardDependentC, ModuleD], [SoftDependentA])
    render(
      <MarchProvider>
        <Defer depend={[HardDependentC, SoftDependentA]}>
          <DisplayHard />
        </Defer>
      </MarchProvider>,
    )
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(await screen.findByRole('textbox')).toHaveTextContent('DDB')
  })
})
