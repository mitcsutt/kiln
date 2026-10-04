import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { SubmitButton } from '#components/SubmitButton'
import { ErrorSummary } from '#components/ErrorSummary'
import { getFormRuntime } from '#core/runtime/formRuntime'
import { kit } from '#kit'
import { FormReview } from '#layouts/FormReview'
import { FormSteps } from '#layouts/FormSteps'
import { When } from '#layouts/When'
import { renderForm } from '#test/renderForm'
import { Repeater } from './Repeater'
import { must } from '#test/must'

interface Guest {
  name: string
  diet: string
}
interface Party {
  host: string
  guests: Guest[]
}
const guest = (name: string): Guest => ({ name, diet: '' })
const newGuest = { name: '', diet: '' }
const guestLabel = (i: number) => `Guest ${String(i + 1)}`
const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)

interface FieldInfoEntry {
  instance: { options: { validators?: object } } | null
}
function fieldInstance(form: object, name: string) {
  return (
    (form as { fieldInfo: Record<string, FieldInfoEntry | undefined> }).fieldInfo[name]?.instance ??
    null
  )
}
const atLeastTwo = ({ value }: { value: readonly Guest[] }) =>
  value.length < 2 ? 'Add at least 2 guests' : undefined

function status() {
  return screen.getAllByRole('status').find((element) => element.textContent !== '') ?? null
}

describe('Repeater', () => {
  describe('pruning a hidden field inside an added row', () => {
    interface Rsvp {
      hasDiet: boolean
      guests: { name: string; diet: string }[]
    }
    const renderRsvp = (
      newItem: { name: string; diet?: string },
      options: { schema?: unknown } = {},
    ) => {
      const onSubmit = vi.fn()
      const view = renderForm<Rsvp>(
        (f) => (
          <>
            <f.CheckboxField name="hasDiet" label="Any dietary needs?" />
            <Repeater
              form={f}
              name="guests"
              label="Guests"
              newItem={newItem as Rsvp['guests'][number]}
              addLabel="Add guest"
            >
              {(item) => (
                <>
                  <item.fields.TextField name="name" label="Name" />
                  <When form={f} is={(v) => v.hasDiet}>
                    <item.fields.TextField name="diet" label="Diet" />
                  </When>
                </>
              )}
            </Repeater>
            <SubmitButton>Save</SubmitButton>
          </>
        ),
        {
          defaultValues: { hasDiet: true, guests: [] },
          onSubmit: ({ value }) => {
            onSubmit(value)
          },
          ...(options as object),
        },
      )
      return { ...view, onSubmit }
    }

    it('submits the row’s newItem value for the hidden field', async () => {
      const { user, onSubmit } = renderRsvp({ name: '', diet: 'none' })
      await user.click(screen.getByRole('button', { name: 'Add guest' }))
      await user.type(screen.getByLabelText('Name'), 'Ada')
      await user.type(screen.getByLabelText('Diet'), 'Vegan')
      await user.click(screen.getByLabelText('Any dietary needs?'))
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({
        hasDiet: false,
        guests: [{ name: 'Ada', diet: 'none' }],
      })
    })

    it('drops the key when newItem has no value for it — never `undefined`', async () => {
      const { user, onSubmit } = renderRsvp({ name: '' })
      await user.click(screen.getByRole('button', { name: 'Add guest' }))
      await user.type(screen.getByLabelText('Name'), 'Ada')
      await user.type(screen.getByLabelText('Diet'), 'Vegan')
      await user.click(screen.getByLabelText('Any dietary needs?'))
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })
      const guests = (onSubmit.mock.calls[0]?.[0] as Rsvp).guests
      expect(guests).toEqual([{ name: 'Ada' }])
      expect(Object.keys(guests[0] ?? {})).toEqual(['name'])
    })

    it('a form schema with `diet: z.string()` accepts the pruned row (the reviewer’s repro)', async () => {
      const schema = z.object({
        hasDiet: z.boolean(),
        guests: z.array(z.object({ name: z.string(), diet: z.string() })),
      })
      const { user, onSubmit } = renderRsvp({ name: '', diet: '' }, { schema })
      await user.click(screen.getByRole('button', { name: 'Add guest' }))
      await user.type(screen.getByLabelText('Name'), 'Ada')
      await user.type(screen.getByLabelText('Diet'), 'Vegan')
      await user.click(screen.getByLabelText('Any dietary needs?'))
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({
        hasDiet: false,
        guests: [{ name: 'Ada', diet: '' }],
      })
    })

    it('unregisters the row template on unmount', () => {
      const { form, unmount } = renderRsvp({ name: '' })
      expect(getFormRuntime(form).itemTemplates.has('guests')).toBe(true)
      unmount()
      expect(getFormRuntime(form).itemTemplates.has('guests')).toBe(false)
    })
  })

  it('renders a fieldset of item fieldsets with item-relative typed fields', async () => {
    const { user, form } = renderForm(
      (f) => (
        <Repeater form={f} name="guests" label="Guests" newItem={newGuest} itemLabel={guestLabel}>
          {(item) => (
            <>
              <item.fields.TextField name="name" label="Name" />
              <item.fields.TextField name="diet" label="Dietary needs" />
            </>
          )}
        </Repeater>
      ),
      { defaultValues: { host: '', guests: [guest('Ada'), guest('Grace')] } satisfies Party },
    )
    const group = screen.getByRole('group', { name: 'Guests' })
    const second = within(group).getByRole('group', { name: 'Guest 2' })
    const name = within(second).getByLabelText('Name')
    expect(name).toHaveValue('Grace')
    expect(name).toHaveAttribute('name', 'guests[1].name')
    await user.type(within(second).getByLabelText('Dietary needs'), 'Vegan')
    expect(form.state.values.guests[1]?.diet).toBe('Vegan')
  })

  it('Add appends newItem, focuses its first control and announces it', async () => {
    const { user, form } = renderForm(
      (f) => (
        <Repeater
          form={f}
          name="guests"
          label="Guests"
          newItem={() => ({ ...newGuest })}
          itemLabel={guestLabel}
          addLabel="Add a guest"
        >
          {(item) => <item.fields.TextField name="name" label="Name" />}
        </Repeater>
      ),
      { defaultValues: { host: '', guests: [guest('Ada')] } satisfies Party },
    )
    await user.click(screen.getByRole('button', { name: 'Add a guest' }))
    expect(form.state.values.guests).toHaveLength(2)
    const added = screen.getByRole('group', { name: 'Guest 2' })
    await waitFor(() => expect(within(added).getByLabelText('Name')).toHaveFocus())
    expect(status()).toHaveTextContent('Guest 2 added')
  })

  it('Remove focuses the item now at that index, else the previous, else Add', async () => {
    const { user, form } = renderForm(
      (f) => (
        <Repeater form={f} name="guests" label="Guests" newItem={newGuest} itemLabel={guestLabel}>
          {(item) => <item.fields.TextField name="name" label="Name" />}
        </Repeater>
      ),
      {
        defaultValues: {
          host: '',
          guests: [guest('Ada'), guest('Grace'), guest('Hedy')],
        } satisfies Party,
      },
    )
    await user.click(screen.getByRole('button', { name: 'Remove Guest 1' }))
    expect(form.state.values.guests.map((g) => g.name)).toEqual(['Grace', 'Hedy'])
    await waitFor(() =>
      expect(
        within(screen.getByRole('group', { name: 'Guest 1' })).getByLabelText('Name'),
      ).toHaveFocus(),
    )
    expect(screen.getByLabelText('Name', { selector: '[name="guests[0].name"]' })).toHaveValue(
      'Grace',
    )
    expect(status()).toHaveTextContent('Guest 1 removed')

    await user.click(screen.getByRole('button', { name: 'Remove Guest 2' }))
    await waitFor(() =>
      expect(
        within(screen.getByRole('group', { name: 'Guest 1' })).getByLabelText('Name'),
      ).toHaveFocus(),
    )

    await user.click(screen.getByRole('button', { name: 'Remove Guest 1' }))
    expect(form.state.values.guests).toEqual([])
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add' })).toHaveFocus())
  })

  it('Move keeps focus on the same Move button in its new position and announces the position', async () => {
    const { user, form } = renderForm(
      (f) => (
        <Repeater
          form={f}
          name="guests"
          label="Guests"
          newItem={newGuest}
          itemLabel={guestLabel}
          reorderable
        >
          {(item) => <item.fields.TextField name="name" label="Name" />}
        </Repeater>
      ),
      {
        defaultValues: {
          host: '',
          guests: [guest('Ada'), guest('Grace'), guest('Hedy')],
        } satisfies Party,
      },
    )
    expect(screen.queryByRole('button', { name: 'Move Guest 1 up' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Move Guest 2 up' }))
    expect(form.state.values.guests.map((g) => g.name)).toEqual(['Grace', 'Ada', 'Hedy'])
    // At the top there is no Move up, so focus falls back to Move down of the same item.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Move Guest 1 down' })).toHaveFocus(),
    )
    expect(status()).toHaveTextContent('Guest 2 moved to position 1')

    await user.click(screen.getByRole('button', { name: 'Move Guest 1 down' }))
    expect(form.state.values.guests.map((g) => g.name)).toEqual(['Ada', 'Grace', 'Hedy'])
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Move Guest 2 down' })).toHaveFocus(),
    )
  })

  it('hides Remove at min and makes Add aria-disabled (with the reason) at max', async () => {
    const { user, form } = renderForm(
      (f) => (
        <Repeater
          form={f}
          name="guests"
          label="Guests"
          newItem={newGuest}
          itemLabel={guestLabel}
          min={1}
          max={2}
        >
          {(item) => <item.fields.TextField name="name" label="Name" />}
        </Repeater>
      ),
      { defaultValues: { host: '', guests: [guest('Ada')] } satisfies Party },
    )
    expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getAllByRole('button', { name: /Remove/ })).toHaveLength(2)
    const add = screen.getByRole('button', { name: 'Add' })
    expect(add).toHaveAttribute('aria-disabled', 'true')
    expect(add).not.toBeDisabled()
    expect(add).toHaveAccessibleDescription('You can add up to 2')
    await user.click(add)
    expect(form.state.values.guests).toHaveLength(2)
  })

  it('renders `empty` with no items', () => {
    renderForm(
      (f) => (
        <Repeater
          form={f}
          name="guests"
          label="Guests"
          newItem={newGuest}
          empty={<p>No guests yet.</p>}
        >
          {(item) => <item.fields.TextField name="name" label="Name" />}
        </Repeater>
      ),
      { defaultValues: { host: '', guests: [] as Guest[] } satisfies Party },
    )
    expect(screen.getByText('No guests yet.')).toBeInTheDocument()
  })

  it('shows an array-level error as the group error, listed in the ErrorSummary', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <>
          <ErrorSummary />
          <Repeater
            form={f}
            name="guests"
            label="Guests"
            newItem={newGuest}
            validators={{
              onDynamic: ({ value }) => (value.length < 2 ? 'Add at least 2 guests' : undefined),
            }}
          >
            {(item) => <item.fields.TextField name="name" label="Name" />}
          </Repeater>
          <SubmitButton>Send invites</SubmitButton>
        </>
      ),
      { defaultValues: { host: '', guests: [guest('Ada')] } satisfies Party, onSubmit },
    )
    await user.click(screen.getByRole('button', { name: 'Send invites' }))
    const group = screen.getByRole('group', { name: 'Guests' })
    await waitFor(() => {
      expect(within(group).getAllByText('Add at least 2 guests').length).toBeGreaterThan(0)
    })
    expect(screen.getByRole('link', { name: 'Guests: Add at least 2 guests' })).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('table variant: column headers, one field per cell (labels kept for AT), errors in the cell', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <Repeater
            form={f}
            name="guests"
            label="Guests"
            variant="table"
            newItem={newGuest}
            itemLabel={guestLabel}
            columns={[{ header: 'Name' }, { header: 'Dietary needs', width: 'fill' }]}
          >
            {(item) => (
              <>
                <item.fields.TextField
                  name="name"
                  label="Name"
                  validators={{ onDynamic: required }}
                />
                <item.fields.TextField name="diet" label="Dietary needs" />
              </>
            )}
          </Repeater>
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { host: '', guests: [guest(''), guest('Grace')] } satisfies Party },
    )
    const table = screen.getByRole('table')
    const headers = within(table).getAllByRole('columnheader')
    // The trailing actions column has a (visually hidden) header from messages.actions.
    expect(headers.map((header) => header.textContent)).toEqual([
      'Name',
      'Dietary needs',
      'Actions',
    ])
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(2)
    const cells = within(must(rows[1])).getAllByRole('cell')
    expect(within(must(cells[0])).getByRole('textbox', { name: 'Name' })).toHaveValue('Grace')
    expect(
      within(must(cells[1])).getByRole('textbox', { name: 'Dietary needs' }),
    ).toBeInTheDocument()
    expect(
      within(must(cells[2])).getByRole('button', { name: 'Remove Guest 2' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    const firstCells = within(must(rows[0])).getAllByRole('cell')
    await waitFor(() =>
      expect(within(must(firstCells[0])).getByText('Enter a value')).toBeInTheDocument(),
    )
  })

  it('cards variant renders each item as a titled card group', () => {
    renderForm(
      (f) => (
        <Repeater
          form={f}
          name="guests"
          label="Guests"
          variant="cards"
          newItem={newGuest}
          itemLabel={guestLabel}
        >
          {(item) => <item.fields.TextField name="name" label="Name" />}
        </Repeater>
      ),
      { defaultValues: { host: '', guests: [guest('Ada')] } satisfies Party },
    )
    expect(
      within(screen.getByRole('group', { name: 'Guest 1' })).getByLabelText('Name'),
    ).toHaveValue('Ada')
  })
  it("item fields are the kit's bound components (the registry lives on the form runtime)", () => {
    const { form } = renderForm(
      (f) => (
        <Repeater form={f} name="guests" label="Guests" newItem={newGuest} itemLabel={guestLabel}>
          {(item) => <item.fields.TextField name="name" label="Name" />}
        </Repeater>
      ),
      { defaultValues: { host: '', guests: [guest('Ada')] } satisfies Party },
    )
    expect(getFormRuntime(form).registry).toBe(kit.registries.fields)
    expect(screen.getByLabelText('Name')).toHaveAttribute('name', 'guests[0].name')
  })

  it.each(['list', 'cards', 'table'] as const)(
    'view mode (%s) renders the items read-only and creates no array field',
    (variant) => {
      const { form } = renderForm(
        (f) => (
          <Repeater
            form={f}
            name="guests"
            label="Guests"
            variant={variant}
            newItem={newGuest}
            itemLabel={guestLabel}
            reorderable
            columns={[{ header: 'Name' }, { header: 'Dietary needs' }]}
            validators={{ onDynamic: atLeastTwo }}
          >
            {(item) => (
              <>
                <item.fields.TextField name="name" label="Name" />
                <item.fields.TextField name="diet" label="Dietary needs" />
              </>
            )}
          </Repeater>
        ),
        {
          defaultValues: {
            host: '',
            guests: [guest('Ada'), { name: 'Grace', diet: 'Vegan' }],
          } satisfies Party,
          formProps: { mode: 'view' },
        },
      )
      expect(screen.queryByRole('textbox')).toBeNull()
      expect(screen.queryByRole('button')).toBeNull()
      expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual([
        'Ada',
        'Not provided',
        'Grace',
        'Vegan',
      ])
      if (variant === 'table') {
        // eslint-disable-next-line vitest/no-conditional-expect -- the test runs once per variant
        expect(within(screen.getByRole('table')).getAllByRole('columnheader')).toHaveLength(2)
      } else {
        // eslint-disable-next-line vitest/no-conditional-expect -- the test runs once per variant
        expect(screen.getByRole('group', { name: 'Guest 2' })).toBeInTheDocument()
      }
      expect(fieldInstance(form, 'guests')).toBeNull()
      expect(fieldInstance(form, 'guests[0].name')).toBeNull()
      expect(getFormRuntime(form).fields.has('guests')).toBe(false)
    },
  )

  it('view mode follows structural changes through a selector on the array path', () => {
    const { form } = renderForm(
      (f) => (
        <Repeater
          form={f}
          name="guests"
          label="Guests"
          newItem={newGuest}
          itemLabel={guestLabel}
          empty={<p>No guests yet.</p>}
        >
          {(item) => <item.fields.TextField name="name" label="Name" />}
        </Repeater>
      ),
      {
        defaultValues: { host: '', guests: [guest('Ada')] } satisfies Party,
        formProps: { mode: 'view' },
      },
    )
    expect(screen.getAllByRole('definition')).toHaveLength(1)
    act(() => {
      form.setFieldValue('guests', [guest('Ada'), guest('Hedy')])
    })
    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual([
      'Ada',
      'Hedy',
    ])
    act(() => {
      form.setFieldValue('guests', [])
    })
    expect(screen.getByText('No guests yet.')).toBeInTheDocument()
  })

  it('inside a FormReview step: the real array keeps its validators, blocks submit and keeps its error after the review unmounts', async () => {
    const onSubmit = vi.fn()
    const { user, form } = renderForm(
      (f) => (
        <FormSteps label="Party steps" linear={false}>
          <FormSteps.Step value="guests" title="Guests">
            <Repeater
              form={f}
              name="guests"
              label="Guests"
              newItem={newGuest}
              itemLabel={guestLabel}
              validators={{ onDynamic: atLeastTwo }}
            >
              {(item) => <item.fields.TextField name="name" label="Name" />}
            </Repeater>
          </FormSteps.Step>
          <When form={f} is={(v) => v.host === ''}>
            <FormSteps.Step value="review" title="Review">
              <FormReview title="Check your guests">
                <Repeater
                  form={f}
                  name="guests"
                  label="Guests"
                  newItem={newGuest}
                  itemLabel={guestLabel}
                >
                  {(item) => <item.fields.TextField name="name" label="Name" />}
                </Repeater>
              </FormReview>
            </FormSteps.Step>
          </When>
        </FormSteps>
      ),
      { defaultValues: { host: '', guests: [guest('Ada')] } satisfies Party, onSubmit },
    )
    // The view copy created no instance: the registered one is the real array field, with its validators.
    expect(fieldInstance(form, 'guests')?.options.validators).toHaveProperty('onDynamic')
    await user.click(
      within(screen.getByRole('list', { name: 'Party steps' })).getByRole('button', {
        name: /Review/,
      }),
    )
    const review = screen.getByRole('region', { name: 'Review' })
    expect(within(review).queryByRole('textbox')).toBeNull()
    expect(within(review).getByRole('definition')).toHaveTextContent('Ada')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    // Blocked by the real array's validator: its step is revealed and shows the group error.
    const step = must(screen.getByText('Guests', { selector: 'h3' }).closest('section'))
    await waitFor(() => expect(step).not.toHaveAttribute('hidden'))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(within(step).getAllByText('Add at least 2 guests').length).toBeGreaterThan(0)
    expect(fieldInstance(form, 'guests')?.options.validators).toHaveProperty('onDynamic')
    // Unmounting the review keeps the real array's instance, registration and error.
    act(() => {
      form.setFieldValue('host', 'Ada')
    })
    expect(screen.queryByRole('region', { name: 'Review' })).toBeNull()
    expect(fieldInstance(form, 'guests')?.options.validators).toHaveProperty('onDynamic')
    expect(getFormRuntime(form).fields.has('guests')).toBe(true)
    expect(form.getFieldMeta('guests')?.errors).toContain('Add at least 2 guests')
    expect(within(step).getAllByText('Add at least 2 guests').length).toBeGreaterThan(0)
  })
})
