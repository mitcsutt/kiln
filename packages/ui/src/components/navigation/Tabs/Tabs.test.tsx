import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Tabs } from './Tabs'

function ClubTabs(props: { variant?: 'underline' | 'pill'; onValueChange?: (v: string) => void }) {
  return (
    <Tabs defaultValue="matches" variant={props.variant} onValueChange={props.onValueChange}>
      <Tabs.List aria-label="Harbour Hawks">
        <Tabs.Trigger value="matches">Matches</Tabs.Trigger>
        <Tabs.Trigger value="players">Players</Tabs.Trigger>
        <Tabs.Trigger value="history">History</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="matches">Harbour Hawks 3 – 0 Millpond FC</Tabs.Content>
      <Tabs.Content value="players">Sione Taufa · 2 goals</Tabs.Content>
      <Tabs.Content value="history">Champions 2019, 2022, 2024</Tabs.Content>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('wires tablist, tabs and panels', () => {
    render(<ClubTabs />)
    expect(screen.getByRole('tablist', { name: 'Harbour Hawks' })).toBeInTheDocument()
    const matches = screen.getByRole('tab', { name: 'Matches' })
    expect(matches).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Harbour Hawks 3 – 0 Millpond FC')
  })

  it('moves between tabs with arrow keys, looping, and activates on focus', async () => {
    const onValueChange = vi.fn()
    render(<ClubTabs onValueChange={onValueChange} />)
    await userEvent.tab()
    expect(screen.getByRole('tab', { name: 'Matches' })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Players' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Players' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Sione Taufa')
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'History' })).toHaveFocus()
    expect(onValueChange).toHaveBeenLastCalledWith('history')
    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Matches' })).toHaveFocus()
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
