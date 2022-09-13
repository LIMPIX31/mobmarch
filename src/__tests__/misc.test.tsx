import { container } from 'tsyringe'
import { register } from '../register'
import { Level1, LongTimeModule } from './mocks'
import { render, screen } from '@testing-library/react'
import { MarchProvider } from '../store'
import { Defer } from '../components'
import { FC } from 'react'
import { useModule } from '../hooks'

const Level: FC = () => {
  const l1 = useModule(Level1)
  const ltm = useModule(LongTimeModule)
  return (
    <div>
      {l1.l2.l3.target()}
      {ltm.method()}
    </div>
  )
}

describe('Misc', () => {
  beforeEach(() => container.clearInstances())

  it('should resolve deep dependent', async () => {
    register(Level1, LongTimeModule)

    render(
      <MarchProvider>
        <Defer depend={[Level1, LongTimeModule]}>
          <Level />
        </Defer>
      </MarchProvider>,
    )

    expect(await screen.findByText('targetLongTimeModule')).toBeInTheDocument()
  })
})
