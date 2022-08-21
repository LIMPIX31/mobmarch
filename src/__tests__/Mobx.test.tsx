import { container } from 'tsyringe'
import { register } from 'register'
import { screen, render } from '@testing-library/react'
import { MarchProvider } from 'store'
import { FC } from 'react'
import { useModule } from 'hooks'
import { Defer } from 'components'
import userEvent from '@testing-library/user-event'
import { CounterModule } from '__tests__/mocks'
import { Observer } from 'Observer'

const Counter: FC = Observer(() => {
  const module = useModule(CounterModule)
  return (
    <div>
      <button onClick={module.increment}>+</button>
      <button onClick={module.decrement}>-</button>
      <span role={'textbox'}>{module.square}</span>
    </div>
  )
})

const AffectTest: FC<{ rerender: () => void }> = Observer(({ rerender }) => {
  rerender()
  return (
    <div>
      <Counter />
    </div>
  )
})

describe('MobX', () => {
  beforeEach(() => container.clearInstances())

  it('should work (counter)', async () => {
    register([CounterModule])
    render(
      <MarchProvider>
        <Defer depend={CounterModule}>
          <Counter />
        </Defer>
      </MarchProvider>,
    )
    expect(await screen.findByRole('textbox')).toHaveTextContent('0')
    await userEvent.click(screen.getByText('+'))
    expect(await screen.findByRole('textbox')).toHaveTextContent('1')
    await userEvent.click(screen.getByText('-'))
    expect(await screen.findByRole('textbox')).toHaveTextContent('0')
  })

  it('should not affect other components', async () => {
    register([CounterModule])
    const rerender = jest.fn()
    render(
      <MarchProvider>
        <Defer depend={CounterModule}>
          <AffectTest rerender={rerender} />
        </Defer>
      </MarchProvider>,
    )
    expect(await screen.findByRole('textbox')).toHaveTextContent('0')
    await userEvent.click(screen.getByText('+'))
    await userEvent.click(screen.getByText('+'))
    expect(await screen.findByRole('textbox')).toHaveTextContent('4')
    expect(rerender).toHaveBeenCalledTimes(1)
  })
})
