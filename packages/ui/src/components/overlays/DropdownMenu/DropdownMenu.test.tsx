import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { DropdownMenu } from './DropdownMenu'

function OwnerActions({ onSelect }: { onSelect?: (value: string) => void }) {
  const [sort, setSort] = useState('points')
  const [live, setLive] = useState(true)
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>Noor’s options</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Noor</DropdownMenu.Label>
        <DropdownMenu.Item shortcut="⌘E" onSelect={() => onSelect?.('rename')}>
          Rename member
        </DropdownMenu.Item>
        <DropdownMenu.CheckboxItem checked={live} onCheckedChange={setLive}>
          Live updates
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenu.RadioItem value="points">Sort by points</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="goals">Sort by goals</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
        <DropdownMenu.Separator />
        <DropdownMenu.Item tone="critical" onSelect={() => onSelect?.('remove')}>
          Remove from team
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

describe('DropdownMenu', () => {
  it('opens a labelled menu of items from the trigger', async () => {
    render(<OwnerActions />)
    await userEvent.click(screen.getByRole('button', { name: 'Noor’s options' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Rename member/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Live updates' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('menuitemradio', { name: 'Sort by points' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('selects with the keyboard and marks tone for theming', async () => {
    const onSelect = vi.fn()
    render(<OwnerActions onSelect={onSelect} />)
    screen.getByRole('button', { name: 'Noor’s options' }).focus()
    await userEvent.keyboard('{Enter}')
    const remove = screen.getByRole('menuitem', { name: 'Remove from team' })
    expect(remove).toHaveAttribute('data-tone', 'critical')
    await userEvent.keyboard('{End}')
    expect(remove).toHaveAttribute('data-highlighted')
    await userEvent.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('remove')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('shows the shortcut hint and toggles checkbox and radio items', async () => {
    render(<OwnerActions />)
    const trigger = screen.getByRole('button', { name: 'Noor’s options' })
    await userEvent.click(trigger)
    expect(screen.getByText('⌘E').tagName).toBe('KBD')
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Live updates' }))
    await userEvent.click(trigger)
    expect(screen.getByRole('menuitemcheckbox', { name: 'Live updates' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Sort by goals' }))
    await userEvent.click(trigger)
    expect(screen.getByRole('menuitemradio', { name: 'Sort by goals' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<OwnerActions />)
    const trigger = screen.getByRole('button', { name: 'Noor’s options' })
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('opens a submenu with the arrow key', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>More</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Move to project</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Aisha</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )
    const sub = screen.getByRole('menuitem', { name: 'Move to project' })
    act(() => {
      sub.focus()
    })
    await userEvent.keyboard('{ArrowRight}')
    expect(await screen.findByRole('menuitem', { name: 'Aisha' })).toBeInTheDocument()
  })

  it('carries the trigger scope theme onto the portalled menu', async () => {
    render(
      <div data-theme="fiesta" data-mode="light">
        <OwnerActions />
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Noor’s options' }))
    expect(screen.getByRole('menu')).toHaveAttribute('data-theme', 'fiesta')
    expect(screen.getByRole('menu')).toHaveAttribute('data-mode', 'light')
  })
})
