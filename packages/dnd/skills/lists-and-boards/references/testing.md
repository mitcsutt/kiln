<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Testing

> Test kiln-dnd components with Testing Library in jsdom by keyboard, and pointer drags in a real browser.

Source: https://kiln.mitchellsutton.com/docs/drag-and-drop/getting-started/testing

Keyboard dragging moves in data space (an index, a column, a cell), so it works in jsdom: focus a handle and press keys with Testing Library's `user-event`, then check the result and the live region.

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('moves a task down the list', async () => {
  const user = userEvent.setup()
  render(<Checklist />)
  screen.getByText('Write the release notes').focus()
  await user.keyboard(' {ArrowDown}{Enter}')
  expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Write the release notes')
})
```

jsdom lacks a few browser APIs the drag engine calls as it starts. Stub them once in your setup file:

```ts
// vitest.setup.ts
import { stubDndBrowserApis } from '@mitcsutt/kiln-dnd/testing'

stubDndBrowserApis()
```

```ts
declare function stubDndBrowserApis(): void
```

Stubs the browser APIs the drag engine calls and jsdom doesn't implement
(`ResizeObserver`, `matchMedia`, the Popover API, `getAnimations`,
`elementFromPoint`), so components from `@mitcsutt/kiln-dnd` render and respond to the
keyboard in a jsdom test. Call it once in your test setup file.

jsdom has no layout, so pointer drags (which measure where things are) still need a
real browser; keyboard dragging works in jsdom because it moves in data space.

Pointer drags measure where things are on screen, and jsdom has no layout, so test those in a real browser: Playwright, or Storybook interaction tests run through Vitest's browser mode.
