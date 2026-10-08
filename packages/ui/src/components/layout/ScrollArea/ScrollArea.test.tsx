import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { ScrollArea } from './ScrollArea'

describe('ScrollArea', () => {
  it('is a named, focusable region when labelled, and forwards its ref', async () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <ScrollArea ref={ref} label="Knockout bracket">
        Quarter-finals
      </ScrollArea>,
    )
    const region = screen.getByRole('region', { name: 'Knockout bracket' })
    expect(ref.current).toBe(region)
    expect(region).toHaveAttribute('data-axis', 'x')
    await userEvent.tab()
    expect(region).toHaveFocus()
  })

  it('takes its name from aria-labelledby too', () => {
    render(
      <>
        <h2 id="rounds">Rounds</h2>
        <ScrollArea aria-labelledby="rounds" axis="both" />
      </>,
    )
    const region = screen.getByRole('region', { name: 'Rounds' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toHaveAttribute('data-axis', 'both')
  })

  it('adds no anonymous region or tab stop when unnamed', () => {
    const { container } = render(<ScrollArea>Quarter-finals</ScrollArea>)
    const area = container.firstElementChild
    expect(area).not.toHaveAttribute('role')
    expect(area).not.toHaveAttribute('tabindex')
  })
})
