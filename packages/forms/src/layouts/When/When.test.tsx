import { act, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SubmitButton } from '#components/SubmitButton'
import { renderForm } from '#test/renderForm'
import { When, type WhenHidden } from './When'

interface Values {
  hasTeam: boolean
  team: string
  name: string
}
const defaults: Values = { hasTeam: false, team: 'Default FC', name: '' }
const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)

function setup(whenHidden?: WhenHidden) {
  const onSubmit = vi.fn()
  const view = renderForm(
    (f) => (
      <>
        <f.CheckboxField name="hasTeam" label="I play for a team" />
        <When form={f} is={(v) => v.hasTeam} whenHidden={whenHidden} fallback={<p>No team.</p>}>
          <f.TextField name="team" label="Team name" />
        </When>
        <SubmitButton>Save</SubmitButton>
      </>
    ),
    {
      defaultValues: defaults,
      onSubmit: ({ value }) => {
        onSubmit(value)
      },
      afterSubmit: 'keep',
    },
  )
  return { ...view, onSubmit }
}

async function typeTeamThenHide(user: ReturnType<typeof setup>['user']) {
  await user.click(screen.getByLabelText('I play for a team'))
  const team = screen.getByLabelText('Team name')
  await user.clear(team)
  await user.type(team, 'Harriers')
  await user.click(screen.getByLabelText('I play for a team'))
}

describe('When', () => {
  it('unmounts children while hidden and renders the fallback', async () => {
    const { user } = setup()
    expect(screen.queryByLabelText('Team name')).toBeNull()
    expect(screen.getByText('No team.')).toBeInTheDocument()
    await user.click(screen.getByLabelText('I play for a team'))
    expect(screen.getByLabelText('Team name')).toBeInTheDocument()
    expect(screen.queryByText('No team.')).toBeNull()
  })

  it("prune (default): submits the default while hidden; the user's input survives hide/show", async () => {
    const { user, onSubmit, form } = setup()
    await typeTeamThenHide(user)
    expect(form.state.values.team).toBe('Harriers')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ hasTeam: false, team: 'Default FC', name: '' })
    await user.click(screen.getByLabelText('I play for a team'))
    expect(screen.getByLabelText('Team name')).toHaveValue('Harriers')
  })

  it('keep: submits the current value while hidden', async () => {
    const { user, onSubmit } = setup('keep')
    await typeTeamThenHide(user)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ team: 'Harriers' })
  })

  it('reset: resets the value to its default as soon as it hides', async () => {
    const { user, onSubmit, form } = setup('reset')
    await typeTeamThenHide(user)
    expect(form.state.values.team).toBe('Default FC')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ team: 'Default FC' })
  })

  it('hidden fields do not validate or block submit, and their errors are cleared', async () => {
    const onSubmit = vi.fn()
    const { user, form } = renderForm(
      (f) => (
        <>
          <f.CheckboxField name="hasTeam" label="I play for a team" />
          <When form={f} is={(v) => v.hasTeam}>
            <f.TextField name="name" label="Captain" validators={{ onDynamic: required }} />
          </When>
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { ...defaults, hasTeam: true }, onSubmit },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Captain')).toHaveAttribute('aria-invalid', 'true'),
    )
    await user.click(screen.getByLabelText('I play for a team'))
    expect(form.getFieldMeta('name')?.errors ?? []).toEqual([])
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('names: governs paths that never mounted (edit mode with a hidden server value)', async () => {
    const onSubmit = vi.fn()
    const { user, form } = renderForm(
      (f) => (
        <>
          <When form={f} is={(v) => v.hasTeam} names={['team']}>
            <f.TextField name="team" label="Team name" />
          </When>
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      {
        defaultValues: defaults,
        onSubmit: ({ value }) => {
          onSubmit(value)
        },
      },
    )
    // a value the user never saw (loaded from the server while the field was hidden)
    act(() => {
      form.setFieldValue('team', 'Stale United')
    })
    expect(form.state.values.team).toBe('Stale United')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ team: 'Default FC' })
  })

  it('accepts a JSON condition (schema-mode Condition) instead of a predicate', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <f.CheckboxField name="hasTeam" label="I play for a team" />
          <When form={f} condition={{ field: 'hasTeam', op: 'truthy' }}>
            <f.TextField name="team" label="Team name" />
          </When>
        </>
      ),
      { defaultValues: defaults },
    )
    expect(screen.queryByLabelText('Team name')).toBeNull()
    await user.click(screen.getByLabelText('I play for a team'))
    expect(screen.getByLabelText('Team name')).toBeInTheDocument()
  })
})
