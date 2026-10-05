/**
 * §12 re-render isolation, per component (`recordCommits`, React's commit hook).
 *
 * `perf.test.tsx` counts fields with `<Profiler>`, which can't tell a layout's own render from
 * its fields'. These tests name every component that rendered, so a layout, a badge, the submit
 * button or the summary re-rendering for nothing fails them. Counts are of our components only;
 * kiln-ui's internals are free to render as they need.
 */
import { memo } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from '#components/form/Form'
import { ErrorSummary } from '#components/form/ErrorSummary'
import { FormStatus } from '#components/form/FormStatus'
import { SubmitButton } from '#components/form/SubmitButton'
import { useAutosave } from '#hooks/useAutosave'
import { useFieldValue } from '#hooks/useFieldValue'
import { useFormStatus } from '#hooks/useFormStatus'
import { useServerValues } from '#hooks/useServerValues'
import { getFormRuntime } from '#runtime/formRuntime'
import { kit } from '#kit/defaultKit'
import { FormGrid } from '#components/layouts/FormGrid'
import { FormSection } from '#components/layouts/FormSection'
import { FormSteps } from '#components/layouts/FormSteps'
import { FormTabs } from '#components/layouts/FormTabs'
import { Repeater } from '#components/layouts/Repeater'
import { When } from '#components/layouts/When'
import { recordCommits, type CommitLog } from '#test/renders'
import { renderForm } from '#test/renderForm'

interface Values {
  first: string
  last: string
  email: string
  city: string
  zip: string
  t1a: string
  t1b: string
  t2a: string
  t2b: string
  extra: boolean
  extraNote: string
  rows: { label: string }[]
}

const defaults: Values = {
  first: 'Ada',
  last: 'Lovelace',
  email: '',
  city: 'London',
  zip: 'N1 9GU',
  t1a: '',
  t1b: 'Kings Cross',
  t2a: 'Islington',
  t2b: 'Angel',
  extra: false,
  extraNote: '',
  rows: [{ label: 'Tea' }, { label: 'Coffee' }, { label: 'Water' }],
}

const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)

type F = ReturnType<typeof kit.useAppForm<Values>>

/** Re-renders when `useFormStatus` changes (isDirty, hasErrors, isSubmitting…). */
function StatusProbe() {
  const status = useFormStatus()
  return <output aria-label="Dirty">{String(status.isDirty)}</output>
}

function CityProbe({ form }: { form: F }) {
  return <output aria-label="City preview">{useFieldValue(form, 'city')}</output>
}

const Body = memo(function Body({ form }: { form: F }) {
  return (
    <>
      <ErrorSummary />
      <FormSection title="Name">
        <form.TextField name="first" label="First" />
        <form.TextField name="last" label="Last" />
        <form.TextField name="email" label="Email" validators={{ onDynamic: required }} />
      </FormSection>
      <FormGrid columns={2}>
        <form.TextField name="city" label="City" />
        <form.TextField name="zip" label="Zip" />
      </FormGrid>
      <FormTabs label="Sections">
        <FormTabs.Tab value="one" label="One">
          <form.TextField name="t1a" label="T1a" validators={{ onDynamic: required }} />
          <form.TextField name="t1b" label="T1b" />
        </FormTabs.Tab>
        <FormTabs.Tab value="two" label="Two">
          <form.TextField name="t2a" label="T2a" />
          <form.TextField name="t2b" label="T2b" />
        </FormTabs.Tab>
      </FormTabs>
      <form.CheckboxField name="extra" label="Extra" />
      <When form={form} is={(v) => v.extra}>
        <form.TextField name="extraNote" label="Extra note" />
      </When>
      <Repeater form={form} name="rows" label="Rows" newItem={{ label: '' }}>
        {(item) => <item.fields.TextField name="label" label={`Row ${String(item.index + 1)}`} />}
      </Repeater>
      <StatusProbe />
      <CityProbe form={form} />
      <FormStatus />
      <SubmitButton>Save</SubmitButton>
    </>
  )
})

function Host({ data }: { data?: Values }) {
  const form = kit.useAppForm<Values>({ defaultValues: defaults })
  useServerValues(form, data)
  return (
    <Form form={form} aria-label="Profile">
      <Body form={form} />
    </Form>
  )
}

/** Our layouts, their parts, and the form-level components. */
const CHROME = new Set([
  'Form',
  'ErrorSummary',
  'SubmitButton',
  'FormStatus',
  'StatusProbe',
  'CityProbe',
  'FormSection',
  'FormSectionInner',
  'FormGridRoot',
  'FormGridRootInner',
  'FormTabsRoot',
  'FormTabsRootInner',
  'FormTab',
  'TabPanel',
  'TabTrigger',
  'ErrorBadge',
  'When',
  'FieldScope',
  'Repeater',
  'RepeaterEdit',
  'RepeaterBody',
  'FormStepsRoot',
  'FormStepsRootInner',
  'FormStep',
  'StepPanel',
])
const FIELDS = new Set(['FormTextField', 'FormCheckboxField'])

/** Renders of each chrome component. */
function chrome(tracker: CommitLog): Record<string, number> {
  return tracker.summary((name) => CHROME.has(name))
}

/** Renders of each field, by label. */
function fields(tracker: CommitLog): Record<string, number> {
  const out: Record<string, number> = {}
  for (const component of FIELDS) {
    for (const label of new Set(
      Array.from({ length: 20 }, (_, i) => `Row ${String(i + 1)}`).concat(
        'First Last Email City Zip T1a T1b T2a T2b Extra'.split(' '),
        'Extra note',
      ),
    )) {
      const n = tracker.count(component, (props) => props.label === label)
      if (n > 0) out[label] = n
    }
  }
  return out
}

async function submit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Save' }))
  await act(() => Promise.resolve())
}

describe('re-render isolation (§12), per component', () => {
  it('typing re-renders only that field (plus the one isDirty flip)', async () => {
    const user = userEvent.setup()
    render(<Host />)
    const tracker = recordCommits()
    await user.type(screen.getByLabelText('First'), 'xyz')
    expect(fields(tracker)).toEqual({ First: 3 })
    expect(chrome(tracker)).toEqual({ StatusProbe: 1, FormStatus: 1 })
  })

  it('typing in a tab, a When or a Repeater row re-renders only that field', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.type(screen.getByLabelText('First'), 'x')
    await user.click(screen.getByLabelText('Extra'))
    const tracker = recordCommits()
    await user.type(screen.getByLabelText('T1b'), 'ab')
    await user.type(screen.getByLabelText('Extra note'), 'ab')
    await user.type(screen.getByLabelText('Row 2'), 'ab')
    // Two keystrokes each, plus one render as each field is left (it becomes blurred).
    expect(fields(tracker)).toEqual({ Extra: 1, T1b: 3, 'Extra note': 3, 'Row 2': 2 })
    expect(chrome(tracker)).toEqual({})
  })

  it('a field watched by useFieldValue re-renders the field and that one reader', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.type(screen.getByLabelText('First'), 'x')
    await user.click(screen.getByLabelText('City'))
    const tracker = recordCommits()
    await user.type(screen.getByLabelText('City'), 'ab')
    expect(fields(tracker)).toEqual({ City: 2 })
    expect(chrome(tracker)).toEqual({ CityProbe: 2 })
  })

  it('an error appearing on blur re-renders that field, and only its own tab badge', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.click(screen.getByLabelText('T1a'))
    const tracker = recordCommits()
    await user.tab()
    expect(Object.keys(fields(tracker))).toEqual(['T1a'])
    expect(fields(tracker).T1a).toBeLessThanOrEqual(2)
    // The tab's count goes 0 → 1; `hasErrors` flips once.
    expect(chrome(tracker)).toEqual({ ErrorBadge: 1, StatusProbe: 1 })
  })

  it('typing into a field that shows an error re-renders no layout or badge until it clears', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.click(screen.getByLabelText('Email'))
    await user.tab()
    await user.click(screen.getByLabelText('Email'))
    const tracker = recordCommits()
    await user.type(screen.getByLabelText('Email'), 'a@b')
    expect(Object.keys(fields(tracker))).toEqual(['Email'])
    // The form's first change: isDirty and hasErrors flip once each.
    expect(Object.keys(chrome(tracker)).sort()).toEqual(['FormStatus', 'StatusProbe'])
  })

  it('the first submit re-renders no layout, and only the badge whose count changed', async () => {
    const user = userEvent.setup()
    render(<Host />)
    const tracker = recordCommits()
    await submit(user)
    const counts = chrome(tracker)
    for (const layout of [
      'FormSection',
      'FormSectionInner',
      'FormGridRootInner',
      'FormTabsRootInner',
      'TabTrigger',
      'TabPanel',
      'When',
    ])
      expect(counts[layout], layout).toBeUndefined()
    expect(counts.ErrorBadge).toBe(1)
    expect(counts.ErrorSummary).toBeGreaterThan(0)
    // TanStack marks every untouched field touched on submit, and `useField` subscribes to
    // `isTouched`, so each field renders once (twice where its error appears) — see A.10.
    for (const [label, n] of Object.entries(fields(tracker)))
      expect(n, label).toBeLessThanOrEqual(label === 'Email' || label === 'T1a' ? 2 : 1)
  })

  it('a second submit re-renders no field, layout or badge', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await submit(user)
    const tracker = recordCommits()
    await submit(user)
    expect(fields(tracker)).toEqual({})
    expect(Object.keys(chrome(tracker)).sort()).toEqual(
      ['ErrorSummary', 'Form', 'StatusProbe', 'SubmitButton'].filter(
        (name) => tracker.count(name) > 0,
      ),
    )
  })

  it('showing and hiding a When re-renders no badge, submit button or status', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.type(screen.getByLabelText('First'), 'x')
    await user.click(screen.getByLabelText('Extra'))
    const tracker = recordCommits()
    await user.click(screen.getByLabelText('Extra'))
    await user.click(screen.getByLabelText('Extra'))
    // The checkbox twice; the note unmounts, then mounts again.
    expect(fields(tracker)).toEqual({ Extra: 2, 'Extra note': 1 })
    const counts = chrome(tracker)
    expect(counts.ErrorBadge).toBeUndefined()
    expect(counts.SubmitButton).toBeUndefined()
    expect(counts.FormStatus).toBeUndefined()
    expect(counts.ErrorSummary).toBeUndefined()
  })

  it('adding a Repeater row renders the new row and leaves the existing rows alone', async () => {
    const user = userEvent.setup()
    render(<Host />)
    const tracker = recordCommits()
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(fields(tracker)).toEqual({ 'Row 4': 1 })
    expect(chrome(tracker).RepeaterBody).toBe(1)
  })

  it('a server refresh renders each field at most once and no layout', () => {
    const { rerender } = render(<Host data={defaults} />)
    const tracker = recordCommits()
    rerender(<Host data={{ ...defaults, zip: 'N1 7AA' }} />)
    expect(screen.getByLabelText('Zip')).toHaveValue('N1 7AA')
    for (const [label, n] of Object.entries(fields(tracker))) expect(n, label).toBe(1)
    const counts = chrome(tracker)
    for (const layout of ['FormSectionInner', 'FormGridRootInner', 'FormTabsRootInner', 'When'])
      expect(counts[layout], layout).toBeUndefined()
  })

  it('typing never re-registers the field (focus registry, scopes)', async () => {
    const { form, user } = renderForm<Values>((f) => <Body form={f} />, { defaultValues: defaults })
    const registrations = vi.spyOn(getFormRuntime(form).fields, 'set')
    await user.type(screen.getByLabelText('T1b'), 'abc')
    expect(registrations).not.toHaveBeenCalled()
  })
})

describe('re-render isolation (§12): the host', () => {
  it("an autosave's status changes re-render no unchanged inline field", async () => {
    let finish: () => void = () => undefined
    function Settings() {
      const form = kit.useAppForm({
        defaultValues: { name: 'Ines Varga', email: 'ines@example.com', digest: true },
      })
      useAutosave(
        form,
        () =>
          new Promise<void>((resolve) => {
            finish = resolve
          }),
        { debounceMs: 0, onlyWhenValid: false },
      )
      return (
        <Form form={form} aria-label="Settings">
          <form.TextField name="name" label="Name" />
          <form.TextField name="email" label="Email" />
          <form.SwitchField name="digest" label="Weekly summary" />
          <FormStatus />
        </Form>
      )
    }
    const user = userEvent.setup()
    render(<Settings />)
    const tracker = recordCommits()
    await user.type(screen.getByLabelText('Name'), 's')
    await act(() => new Promise((resolve) => setTimeout(resolve, 5)))
    expect(screen.getByRole('status')).toHaveTextContent('Saving')
    await act(async () => {
      finish()
      await Promise.resolve()
    })
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
    expect(tracker.count('FormTextField', (props) => props.label === 'Email')).toBe(0)
    expect(tracker.count('FormSwitchField')).toBe(0)
    // The typed field: one keystroke, and nothing for the two status changes.
    expect(tracker.count('FormTextField', (props) => props.label === 'Name')).toBe(1)
  })
})

describe('re-render isolation (§12): steps', () => {
  it('typing in a step re-renders only that field: no step panel, stepper or nav', async () => {
    function Wizard() {
      const form = kit.useAppForm({
        defaultValues: { name: '', street: '', town: '' },
      })
      return (
        <Form form={form} aria-label="Wizard">
          <FormSteps label="Progress">
            <FormSteps.Step value="you" title="You">
              <form.TextField name="name" label="Name" validators={{ onDynamic: required }} />
            </FormSteps.Step>
            <FormSteps.Step value="address" title="Address">
              <form.TextField name="street" label="Street" />
              <form.TextField name="town" label="Town" />
            </FormSteps.Step>
          </FormSteps>
        </Form>
      )
    }
    const user = userEvent.setup()
    render(<Wizard />)
    const tracker = recordCommits()
    await user.type(screen.getByLabelText('Name'), 'Ines')
    expect(tracker.count('FormTextField', (props) => props.label === 'Name')).toBe(4)
    expect(tracker.count('FormTextField')).toBe(4)
    expect(chrome(tracker)).toEqual({})
    expect(tracker.count('Stepper')).toBe(0)
  })
})
