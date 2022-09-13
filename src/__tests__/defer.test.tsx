import { render, screen } from '@testing-library/react'
import { MarchProvider } from '../store'
import { FC } from 'react'
import { useDeferredModule } from '../hooks'
import { LongTimeModule } from './mocks'
import { container } from 'tsyringe'
import { register } from '../register'

const DeferredUse: FC = () => {
  const [loading, module, error] = useDeferredModule(LongTimeModule)
  return (
    <>
      <span>{loading ? 'loading' : module?.method()}</span>
      {error && <span data-testid={'error'}>{error?.message}</span>}
    </>
  )
}

describe('useDeferredModule', () => {
  beforeEach(() => container.clearInstances())

  it('should resolve', async () => {
    register(LongTimeModule)
    render(
      <MarchProvider>
        <DeferredUse />
      </MarchProvider>,
    )
    expect(screen.getByText('loading')).toBeInTheDocument()
    expect(await screen.findByText('LongTimeModule')).toBeInTheDocument()
  })
})
