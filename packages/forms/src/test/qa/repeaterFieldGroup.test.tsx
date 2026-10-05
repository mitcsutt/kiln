/**
 * Repeater inside a `withFieldGroup` form, edit and view mode. A field group's store values are
 * group-relative, so the Repeater's `name` ("guests") is relative to the group ("party.guests" on
 * the form).
 */
import type { ComponentType } from 'react'
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { kit } from '#kit/defaultKit'
import { Repeater } from '#components/layouts/Repeater'
import { renderForm } from '#test/renderForm'

interface Guest {
  name: string
  diet: string
}
const Party = kit.withFieldGroup({
  defaultValues: { host: '', guests: [] as Guest[] },
  render: function Party({ group }) {
    return (
      <Repeater
        form={group}
        name="guests"
        label="Guests"
        newItem={{ name: '', diet: '' }}
        itemLabel={(i) => `Guest ${String(i + 1)}`}
      >
        {(item) => {
          // This file checks the runtime binding only; the typed `item.fields` shorthand for a
          // field-group Repeater is covered by repeaterFieldGroup.test-d.tsx, so a loose cast is
          // enough here.
          const fields = item.fields as unknown as {
            TextField: ComponentType<{ name: string; label: string }>
          }
          return (
            <>
              <fields.TextField name="name" label="Name" />
              <fields.TextField name="diet" label="Dietary needs" />
            </>
          )
        }}
      </Repeater>
    )
  },
})

const defaults = {
  party: {
    host: 'Ada',
    guests: [
      { name: 'Grace', diet: 'Vegan' },
      { name: 'Alan', diet: '' },
    ],
  },
}

describe('Repeater in a field-group form', () => {
  it('edit mode: items bind to group-relative paths and write to the form path', async () => {
    const { form, user } = renderForm((f) => <Party form={f} fields="party" />, {
      defaultValues: defaults,
    })
    const second = within(screen.getByRole('group', { name: 'Guests' })).getByRole('group', {
      name: 'Guest 2',
    })
    const name = within(second).getByLabelText('Name')
    expect(name).toHaveValue('Alan')
    expect(name).toHaveAttribute('name', 'party.guests[1].name')
    await user.type(within(second).getByLabelText('Dietary needs'), 'None')
    expect(form.state.values.party.guests[1]?.diet).toBe('None')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(form.state.values.party.guests).toHaveLength(3)
  })

  it('view mode: renders every item read-only from the group-relative values, no controls', () => {
    renderForm((f) => <Party form={f} fields="party" />, {
      defaultValues: defaults,
      formProps: { mode: 'view' },
    })
    expect(screen.queryByRole('textbox')).toBeNull()
    const group = screen.getByRole('group', { name: 'Guests' })
    expect(within(group).getByRole('group', { name: 'Guest 1' })).toBeInTheDocument()
    expect(within(group).getByRole('group', { name: 'Guest 2' })).toBeInTheDocument()
    expect(within(group).getByText('Grace')).toBeInTheDocument()
    expect(within(group).getByText('Vegan')).toBeInTheDocument()
    expect(within(group).getByText('Alan')).toBeInTheDocument()
  })
})
