<h1 align='center'>MobMarch</h1>
<h6 align='center'>MobX Module Architecture</h6>
<h6 align='center'>Create scalable, cross-platform ReactJS web apps using a modular architecture built on libraries such as MobX and TSyringe</h6>

### Motivation
I was a bit confused when my application theme control service started instantly and immediately requested the stored value from the local storage. This value didn't exist, so I had to set the default theme, but as soon as the storage was ready, I had to learn about it in the theme service. But how? **And I came up with a solution - MobMarch**.

### Installation in exiting React App

```bash
# Install mobmarch
yarn add mobmarch
# Install peer dependencies
yarn add tsyringe mobx mobx-react
```

### Wrapping app in `<MarchProvider>`

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MarchProvider>
      <App />
    </MarchProvider>
  </React.StrictMode>,
)
```

Done! You can use MobMarch.

## Counter example

Study MobMarch using the counter as an example.

### `services/Counter.service.ts`

```ts
import { action, makeObservable, observable } from 'mobx'
import { Module } from 'mobmarch'

@Module
export class CounterService {
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
}
```

You don't need to worry about creating an instance for your counter. It will be automatically created on demand.

### `components/Counter.tsx`

```tsx
import { FC } from 'react'
import { Observer, useModule } from 'mobmarch'
import { CounterService } from '../services/Counter.service'

// The `Observer` wrapper is needed so that
// mobx can update this component when the counter changes.
export const Counter: FC = Observer(() => {
  // Immediately require a counter module(service) in this component.
  const counter = useModule(CounterService)

  return (
    <div>
      <h1>Counter</h1>
      <p>{counter.value}</p>
      <button onClick={counter.increment}>+</button>
      <button onClick={counter.decrement}>-</button>
    </div>
  )
})
```

### `App.tsx`

However, we can't just go ahead and display the counter component. The thing is, the component immediately requires a
counter module, but by that time an instance of it won't have been created yet and you'll get an error saying that the
module isn't ready yet. To solve this, you need to schedule the component to be mounted until the counter module is
ready. Use the `Defer` wrapper for this.

```tsx
import { FC } from 'react'
import { Counter } from './components/Counter'
import { CounterService } from './services/Counter.service'
import { Defer } from 'mobmarch'

export const App: FC = () => {
  return (
    <div>
      {/* TIP: You can also specify an array of dependencies. */}
      <Defer
        depend={CounterService}
        fallback={<span>Please wait...</span>}
        errorFallback={<span>Something went wrong!</span>}
      >
        <Counter />
      </Defer>
    </div>
  )
}
```

The counter will now be displayed as soon as the module is constructed. It is worth clarifying that `Defer` immediately
forces `mobmarch` to create instances of all passed dependencies.

## Useful example

It is unlikely that you will use `mobmarch` just to create a counter. Let's look at a more useful example. I will omit
the imports so as not to make the example too large.

### `services/Todo.service.ts`

```tsx
@Module
export class TodoService {
  @observable todos: Todo[] = []

  constructor() {
    makeObservable(this)
  }

  @action.bound
  addTodo(todo: Todo) {
    this.todos.push(todo)
  }

  @action.bound
  removeTodo(todo: Todo) {
    this.todos.splice(this.todos.indexOf(todo), 1)
  }
}
```

### `services/TodoAPI.service.ts`
When creating an instance of `TodoAPI` all its dependencies will be resolved. However, the application world is not perfect and some dependencies cannot be resolved right away, for example the local storage needs time to read the file, the best solution for `TodoAPI` would be to wait until all its dependencies are ready. To use this behavior for `TodoAPI`, explicitly specify a list of dependencies in the `@Module` decorator.
```tsx
@Module([TodoService])
export class TodoAPI implements Initable {
  constructor(private readonly todo: TodoService) {}

  // If there will be any other modules that depend on `TodoAPI`,
  // they will have to wait until the request to the server will
  // not be resolved successfully or with an error.
  async init(): Promise<void> {
    try {
      this.todo.todos = await this.fetchTodos()
    } catch (e) {
      // Handle error
    }
  }

  async fetchTodos(): Todo[] {
    const todos = await fetch('/api/todos')
    return todos.json()
  }
}
```

### `components/Todo.tsx`

```tsx
export const Todo: FC<{ todo: Todo }> = () => {
  return <div>
    <h1>{todo.title}</h1>
    <button onClick={() => /*remove*/}>Remove</button>
  </div>
}

export const Todos: FC = Observer(() => {
  const todo = useModule(TodoService)
  return (
    <div>
      {todo.todos.map(todo => (
        <Todo todo={todo} />
      ))}
    </div>
  )
})
```

### `App.tsx`

```tsx
export const App: FC = () => {
  return (
    <div>
      <h1>Todos</h1>
      <Defer depend={[TodoService, TodoAPI]}>
        <Todos />
      </Defer>
    </div>
  )
}
```

## Testing
An example of testing your modules
```tsx
describe('Counter', () => {
  // Clearing all previously created modules to make testing predictable.
  beforeEach(() => container.clearInstances())

  it('should work', async () => {
    // Manually register the module under test.
    // Pattern: register([module1, ...dependencies], [module2, ...dependencies])
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
})
```

## License (MIT)

MIT License

Copyright (c) 2022 MobMarch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
