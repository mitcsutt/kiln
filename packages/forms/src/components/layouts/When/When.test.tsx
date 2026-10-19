import { act, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SubmitButton } from '#components/form/SubmitButton'
import { FieldPresentation } from '#components/fields/FieldPresentation'
import { must } from '#test/must'
import { renderForm } from '#test/renderForm'
import { When, type WhenHidden } from './When'

interface Values {
  hasCompany: boolean
  company: string
  name: string
}
const defaults: Values = { hasCompany: false, company: 'Northwind Studio', name: '' }
const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)

function setup(whenHidden?: WhenHidden) {
  const onSubmit = vi.fn()
  const view = renderForm(
    (f) => (
      <>
        <f.CheckboxField name="hasCompany" label="I work for a company" />
        <When
          form={f}
          is={(v) => v.hasCompany}
          whenHidden={whenHidden}
          fallback={<p>No company.</p>}
        >
          <f.TextField name="company" label="Company name" />
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

async function typeCompanyThenHide(user: ReturnType<typeof setup>['user']) {
  await user.click(screen.getByLabelText('I work for a company'))
  const company = screen.getByLabelText('Company name')
  await user.clear(company)
  await user.type(company, 'Brightline Labs')
  await user.click(screen.getByLabelText('I work for a company'))
}

describe('When', () => {
  it('unmounts children while hidden and renders the fallback', async () => {
    const { user } = setup()
    expect(screen.queryByLabelText('Company name')).toBeNull()
    expect(screen.getByText('No company.')).toBeInTheDocument()
    await user.click(screen.getByLabelText('I work for a company'))
    expect(screen.getByLabelText('Company name')).toBeInTheDocument()
    expect(screen.queryByText('No company.')).toBeNull()
  })

  it("prune (default): submits the default while hidden; the user's input survives hide/show", async () => {
    const { user, onSubmit, form } = setup()
    await typeCompanyThenHide(user)
    expect(form.state.values.company).toBe('Brightline Labs')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      hasCompany: false,
      company: 'Northwind Studio',
      name: '',
    })
    await user.click(screen.getByLabelText('I work for a company'))
    expect(screen.getByLabelText('Company name')).toHaveValue('Brightline Labs')
  })

  it('keep: submits the current value while hidden', async () => {
    const { user, onSubmit } = setup('keep')
    await typeCompanyThenHide(user)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ company: 'Brightline Labs' })
  })

  it('reset: resets the value to its default as soon as it hides', async () => {
    const { user, onSubmit, form } = setup('reset')
    await typeCompanyThenHide(user)
    expect(form.state.values.company).toBe('Northwind Studio')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ company: 'Northwind Studio' })
  })

  it('hidden fields do not validate or block submit, and their errors are cleared', async () => {
    const onSubmit = vi.fn()
    const { user, form } = renderForm(
      (f) => (
        <>
          <f.CheckboxField name="hasCompany" label="I work for a company" />
          <When form={f} is={(v) => v.hasCompany}>
            <f.TextField name="name" label="Job title" validators={{ onDynamic: required }} />
          </When>
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { ...defaults, hasCompany: true }, onSubmit },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Job title')).toHaveAttribute('aria-invalid', 'true'),
    )
    await user.click(screen.getByLabelText('I work for a company'))
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
          <When form={f} is={(v) => v.hasCompany} names={['company']}>
            <f.TextField name="company" label="Company name" />
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
      form.setFieldValue('company', 'Orchard & Co')
    })
    expect(form.state.values.company).toBe('Orchard & Co')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ company: 'Northwind Studio' })
  })

  it('accepts a JSON condition (schema-mode Condition) instead of a predicate', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <f.CheckboxField name="hasCompany" label="I work for a company" />
          <When form={f} condition={{ field: 'hasCompany', op: 'truthy' }}>
            <f.TextField name="company" label="Company name" />
          </When>
        </>
      ),
      { defaultValues: defaults },
    )
    expect(screen.queryByLabelText('Company name')).toBeNull()
    await user.click(screen.getByLabelText('I work for a company'))
    expect(screen.getByLabelText('Company name')).toBeInTheDocument()
  })

  describe('animate', () => {
    function animated(formProps?: { mode?: 'edit' | 'view' }) {
      const onSubmit = vi.fn()
      const view = renderForm(
        (f) => (
          <>
            <f.CheckboxField name="hasCompany" label="I work for a company" />
            <When form={f} is={(v) => v.hasCompany} animate fallback={<p>No company.</p>}>
              <f.TextField name="company" label="Company name" />
            </When>
            <SubmitButton>Save</SubmitButton>
          </>
        ),
        {
          defaultValues: { ...defaults, hasCompany: true },
          onSubmit: ({ value }) => {
            onSubmit(value)
          },
          afterSubmit: 'keep',
          ...(formProps ? { formProps } : {}),
        },
      )
      return { ...view, onSubmit }
    }

    it('wraps the children and the fallback in a Collapse that opens and closes with the condition', async () => {
      const { user } = animated()
      const company = screen.getByLabelText('Company name')
      expect(company.closest('div[data-state]')).toHaveAttribute('data-state', 'open')
      const fallbackCollapse = must(document.querySelector('div[data-state="closed"]'))
      expect(fallbackCollapse).not.toBeVisible()

      await user.click(screen.getByLabelText('I work for a company'))
      // jsdom has no transitions, so the close settles at once and the children unmount.
      await waitFor(() => {
        expect(screen.queryByLabelText('Company name')).toBeNull()
      })
      expect(screen.getByText('No company.').closest('div[data-state]')).toHaveAttribute(
        'data-state',
        'open',
      )

      await user.click(screen.getByLabelText('I work for a company'))
      expect(screen.getByLabelText('Company name')).toBeInTheDocument()
      await waitFor(() => {
        expect(screen.queryByText('No company.')).toBeNull()
      })
    })

    it('keeps the hiding policy: a hidden field is pruned from what is submitted', async () => {
      const { user, onSubmit } = animated()
      const company = screen.getByLabelText('Company name')
      await user.clear(company)
      await user.type(company, 'Brightline Labs')
      await user.click(screen.getByLabelText('I work for a company'))
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })
      expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ company: 'Northwind Studio' })
    })

    it('renders no Collapse in view mode', () => {
      animated({ mode: 'view' })
      expect(document.querySelector('div[data-state]')).toBeNull()
      expect(screen.getByText('Northwind Studio')).toBeInTheDocument()
    })

    it('renders no Collapse in an inline layout, where a block would break the line', () => {
      renderForm(
        (f) => (
          <FieldPresentation layout="inline">
            <When form={f} is={(v) => v.hasCompany} animate>
              <f.TextField name="company" label="Company name" />
            </When>
          </FieldPresentation>
        ),
        { defaultValues: { ...defaults, hasCompany: true } },
      )
      const company = screen.getByLabelText('Company name')
      expect(company.closest('div[data-state]')).toBeNull()
    })
  })
})
