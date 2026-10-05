import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Tabs } from './Tabs'

function ProjectTabs(props: {
  variant?: 'underline' | 'pill'
  onValueChange?: (v: string) => void
}) {
  return (
    <Tabs defaultValue="tasks" variant={props.variant} onValueChange={props.onValueChange}>
      <Tabs.List aria-label="Atlas redesign">
        <Tabs.Trigger value="tasks">Tasks</Tabs.Trigger>
        <Tabs.Trigger value="people">People</Tabs.Trigger>
        <Tabs.Trigger value="history">History</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tasks">14 open tasks · Due 28 November</Tabs.Content>
      <Tabs.Content value="people">Priya Nair · design lead</Tabs.Content>
      <Tabs.Content value="history">Started March, beta September</Tabs.Content>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('wires tablist, tabs and panels', () => {
    render(<ProjectTabs />)
    expect(screen.getByRole('tablist', { name: 'Atlas redesign' })).toBeInTheDocument()
    const tasks = screen.getByRole('tab', { name: 'Tasks' })
    expect(tasks).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('14 open tasks · Due 28 November')
  })

  it('moves between tabs with arrow keys, looping, and activates on focus', async () => {
    const onValueChange = vi.fn()
    render(<ProjectTabs onValueChange={onValueChange} />)
    await userEvent.tab()
    expect(screen.getByRole('tab', { name: 'Tasks' })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'People' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'People' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Priya Nair')
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'History' })).toHaveFocus()
    expect(onValueChange).toHaveBeenLastCalledWith('history')
    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Tasks' })).toHaveFocus()
  })

  it('passes the variant down as a data attribute and forwards refs', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Tabs ref={ref} defaultValue="a" variant="pill">
        <Tabs.List aria-label="View">
          <Tabs.Trigger value="a">Month</Tabs.Trigger>
        </Tabs.List>
      </Tabs>,
    )
    expect(ref.current).toHaveAttribute('data-variant', 'pill')
    expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'pill')
    expect(screen.getByRole('tab')).toHaveAttribute('data-variant', 'pill')
  })
})
