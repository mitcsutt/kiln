import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Form } from '#components/form/Form'
import { kit } from '#kit/defaultKit'
import { resetWarnings } from '#schema/render/warn'
import { dndKit } from '#stories/_kit/dndKit'
import { expectNoAxeViolations } from '#test/a11y'
import { must } from '#test/must'
import { renderForm } from '#test/renderForm'
import { Repeater, type RepeaterProps } from './Repeater'

interface Guest {
  name: string
  diet: string
}
interface Party {
  guests: Guest[]
}
const guest = (name: string, diet = ''): Guest => ({ name, diet })
const newGuest = { name: '', diet: '' }
const guestLabel = (i: number) => `Guest ${String(i + 1)}`
const party: Party = { guests: [guest('Ada'), guest('Grace'), guest('Hedy')] }
const required = ({ value }: { value: string }) => (value === '' ? 'Enter a name' : undefined)

/** What kiln-dnd's live region says. */
function dndAnnouncement(): string {
  const region = document.querySelector('[data-kiln-dnd-announcer]')
  return (region?.textContent ?? '').replace(/\u00A0/g, '').trim()
}

/** The repeater's own live region (add, remove, move by button). */
function repeaterStatus() {
  return screen.getAllByRole('status').find((element) => element.textContent !== '') ?? null
}

type Variant = RepeaterProps<never, never>['variant']

function renderGuests(
  options: {
    reorderable?: boolean | 'drag'
    variant?: Variant
    withDnd?: boolean
    defaultValues?: Party
    messages?: Parameters<typeof kit.useAppForm>[0]['messages']
  } = {},
) {
  const { reorderable = 'drag', variant, withDnd = true, defaultValues = party, messages } = options
  return renderForm<Party>(
    (f) => (
      <Repeater
        form={f}
        name="guests"
        label="Guests"
        newItem={newGuest}
        itemLabel={guestLabel}
        reorderable={reorderable}
        variant={variant}
        columns={[{ header: 'Name' }, { header: 'Diet' }]}
      >
        {(item) => (
          <>
            <item.fields.TextField name="name" label="Name" validators={{ onBlur: required }} />
            <item.fields.TextField name="diet" label="Diet" />
          </>
        )}
      </Repeater>
    ),
    { kit: withDnd ? dndKit : kit, defaultValues, messages },
  )
}

const handle = (name: string) => screen.getByRole('button', { name: `Drag ${name}` })
const names = (form: { state: { values: Party } }) => form.state.values.guests.map((g) => g.name)

describe('Repeater reorderable="drag"', () => {
  it('is opt-in: a kit with drag and drop adds no handle to other repeaters', () => {
    renderGuests({ reorderable: true })
    expect(screen.queryByRole('button', { name: /^Drag/ })).toBeNull()
    expect(document.querySelector('[data-kiln-dnd-announcer]')).toBeNull()
    expect(screen.getByRole('button', { name: 'Move Guest 1 down' })).toBeInTheDocument()
  })

  it('without the kit’s dragAndDrop, shows the move buttons and warns once', () => {
    resetWarnings()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    renderGuests({ withDnd: false })
    expect(screen.queryByRole('button', { name: /^Drag/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Move Guest 2 up' })).toBeInTheDocument()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toMatch(/@mitcsutt\/kiln-forms\/dnd/)
    warn.mockRestore()
  })

  it('gives every item a handle named after it, beside the move buttons', () => {
    renderGuests()
    for (const label of ['Guest 1', 'Guest 2', 'Guest 3']) {
      expect(handle(label)).toHaveAccessibleDescription(/To pick up, press Space or Enter/)
    }
    // A move never needs a drag: the buttons stay (WCAG 2.5.7).
    expect(screen.getByRole('button', { name: 'Move Guest 2 up' })).toBeInTheDocument()
  })

  it('moves an item by keyboard, announcing each step, and keeps focus on its handle', async () => {
    const { user, form } = renderGuests()
    handle('Guest 3').focus()
    await user.keyboard(' ')
    expect(dndAnnouncement()).toBe('Picked up Guest 3, position 3 of 3.')
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(dndAnnouncement()).toBe('Guest 3 moved to position 1 of 3.')
    // Nothing moves until the drop.
    expect(names(form)).toEqual(['Ada', 'Grace', 'Hedy'])
    await user.keyboard(' ')
    expect(dndAnnouncement()).toBe('Dropped Guest 3 at position 1 of 3.')
    expect(names(form)).toEqual(['Hedy', 'Ada', 'Grace'])
    expect(
      screen.getAllByRole('textbox', { name: /^Name/ }).map((input) => input.getAttribute('value')),
    ).toEqual(['Hedy', 'Ada', 'Grace'])
    await waitFor(() => expect(handle('Guest 1')).toHaveFocus())
    // kiln-dnd said where it went; the repeater doesn't say it again.
    expect(repeaterStatus()).toBeNull()
  })

  it('cancels with Escape and leaves the order as it was', async () => {
    const { user, form } = renderGuests()
    handle('Guest 1').focus()
    await user.keyboard(' {ArrowDown}{Escape}')
    expect(dndAnnouncement()).toBe('Move cancelled. Guest 1 is back at position 1 of 3.')
    expect(names(form)).toEqual(['Ada', 'Grace', 'Hedy'])
    expect(handle('Guest 1')).toHaveFocus()
  })

  it('moves the item’s errors and touched state with it', async () => {
    const { user, form } = renderGuests({
      defaultValues: { guests: [guest('Ada'), guest('Grace'), guest('')] },
    })
    const third = must(screen.getAllByRole('textbox', { name: /^Name/ })[2])
    await user.click(third)
    await user.tab()
    expect(third).toHaveAccessibleDescription('Enter a name')
    handle('Guest 3').focus()
    await user.keyboard(' {ArrowUp}{ArrowUp} ')
    expect(names(form)).toEqual(['', 'Ada', 'Grace'])
    const inputs = screen.getAllByRole('textbox', { name: /^Name/ })
    expect(inputs[0]).toHaveAccessibleDescription('Enter a name')
    expect(inputs[0]).toHaveAttribute('aria-invalid', 'true')
    expect(inputs[2]).not.toHaveAttribute('aria-invalid', 'true')
    expect(form.getFieldMeta('guests[0].name')?.errors).toEqual(['Enter a name'])
    expect(form.getFieldMeta('guests[0].name')?.isTouched).toBe(true)
    expect(form.getFieldMeta('guests[2].name')?.isTouched).toBe(false)
    expect(form.getFieldMeta('guests[2].name')?.errors ?? []).toEqual([])
  })

  it('shows no handle while there is only one item', async () => {
    const { user } = renderGuests({ defaultValues: { guests: [guest('Ada')] } })
    expect(screen.queryByRole('button', { name: /^Drag/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(handle('Guest 2')).toBeInTheDocument()
  })

  it('takes its words from the form’s messages', async () => {
    const { user } = renderGuests({
      messages: {
        drag: {
          instructions: 'Space lifts the guest, the arrows move them, Space puts them down.',
          handle: (item) => `Reorder ${item}`,
          lifted: (item, position, count) =>
            `${item} lifted from ${String(position)}/${String(count)}`,
          moved: (item, position) => `${item} now at ${String(position)}`,
          dropped: (item, position) => `${item} placed at ${String(position)}`,
          canceled: (item) => `${item} left where it was`,
        },
      },
    })
    const reorder = screen.getByRole('button', { name: 'Reorder Guest 2' })
    expect(reorder).toHaveAccessibleDescription(
      'Space lifts the guest, the arrows move them, Space puts them down.',
    )
    reorder.focus()
    await user.keyboard(' ')
    expect(dndAnnouncement()).toBe('Guest 2 lifted from 2/3')
    await user.keyboard('{ArrowDown}')
    expect(dndAnnouncement()).toBe('Guest 2 now at 3')
    await user.keyboard(' ')
    expect(dndAnnouncement()).toBe('Guest 2 placed at 3')
  })

  it.each(['table', 'cards'] as const)('works the same in the %s variant', async (variant) => {
    const { user, form } = renderGuests({ variant })
    handle('Guest 1').focus()
    await user.keyboard('{Enter}{ArrowDown}{Enter}')
    expect(names(form)).toEqual(['Grace', 'Ada', 'Hedy'])
    await waitFor(() => expect(handle('Guest 2')).toHaveFocus())
  })

  it('puts each table row’s handle in its actions cell', () => {
    renderGuests({ variant: 'table' })
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    // The header row, then one row per item.
    expect(rows).toHaveLength(4)
    expect(within(must(rows[1])).getByRole('button', { name: 'Drag Guest 1' })).toBeInTheDocument()
  })

  it('still moves by its buttons, announced by the repeater', async () => {
    const { user, form } = renderGuests()
    await user.click(screen.getByRole('button', { name: 'Move Guest 2 up' }))
    expect(names(form)).toEqual(['Grace', 'Ada', 'Hedy'])
    expect(repeaterStatus()).toHaveTextContent('Guest 2 moved to position 1')
  })

  it('renders no handles in view mode', () => {
    function View() {
      const form = dndKit.useAppForm<Party>({ defaultValues: party })
      return (
        <Form form={form} aria-label="Party" mode="view">
          <Repeater form={form} name="guests" label="Guests" newItem={newGuest} reorderable="drag">
            {(item) => <item.fields.TextField name="name" label="Name" />}
          </Repeater>
        </Form>
      )
    }
    render(<View />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Hedy')).toBeInTheDocument()
  })

  it('works in schema mode with the same kit', async () => {
    const schema = dndKit.defineFormSchema<Party>()({
      version: 1,
      root: {
        layout: 'repeater',
        name: 'guests',
        label: 'Guests',
        reorderable: 'drag',
        newItem: newGuest,
        item: [{ kind: 'text', name: 'name', label: 'Name' }],
      },
    })
    const holder: { values?: () => Party } = {}
    function Schema() {
      const form = dndKit.useAppForm<Party>({ defaultValues: party })
      holder.values = () => form.state.values
      return (
        <Form form={form} aria-label="Party">
          <dndKit.SchemaForm form={form} schema={schema} />
        </Form>
      )
    }
    const user = userEvent.setup()
    render(<Schema />)
    screen.getByRole('button', { name: 'Drag Item 1' }).focus()
    await user.keyboard(' {ArrowDown}{ArrowDown} ')
    expect(holder.values?.().guests.map((g) => g.name)).toEqual(['Grace', 'Hedy', 'Ada'])
    expect(dndAnnouncement()).toBe('Dropped Item 1 at position 3 of 3.')
  })

  it('has no axe violations', async () => {
    const { container } = renderGuests()
    await expectNoAxeViolations(container)
  })
})
