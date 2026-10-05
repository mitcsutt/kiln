import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from '@mitcsutt/kiln-ui'
import { StatesGrid } from '#stories/_kit'
import { useAutosave } from '#hooks'
import { Form } from '#components/form/Form'
import { kit } from '#kit/defaultKit'
import { FormStatus } from './FormStatus'

const meta = {
  title: 'Forms/Layouts/FormStatus',
  component: FormStatus,
} satisfies Meta<typeof FormStatus>

export default meta
type Story = StoryObj<typeof meta>

interface NameForm {
  setFieldValue: (name: 'name', value: string) => void
}

/** Edits the field once on mount, so a demo form is reliably dirty without a scripted interaction. */
function EditOnMount({ form }: { form: NameForm }) {
  useEffect(() => {
    form.setFieldValue('name', 'Ada Lovelace (edited)')
  }, [form])
  return null
}

/** Pairs with `useAutosave`: edits itself once on mount, then moves dirty → saving → saved. */
function WithAutosave() {
  const form = kit.useAppForm({ defaultValues: { name: 'Ada Lovelace' } })
  useAutosave(form, async () => new Promise((resolve) => setTimeout(resolve, 600)), {
    debounceMs: 0,
  })
  return (
    <Form form={form} aria-label="Account">
      <form.TextField name="name" label="Full name" autoComplete="name" />
      <FormStatus />
      <EditOnMount form={form} />
    </Form>
  )
}

export const Playground: Story = {
  render: () => <WithAutosave />,
}

function DirtyDemo() {
  const form = kit.useAppForm({ defaultValues: { name: 'Ada Lovelace' } })
  return (
    <Form form={form} aria-label="Dirty">
      <form.TextField name="name" label="Full name" />
      <FormStatus />
      <EditOnMount form={form} />
    </Form>
  )
}

function SavingDemo() {
  const form = kit.useAppForm({ defaultValues: { name: 'Ada Lovelace' } })
  useAutosave(form, () => new Promise(() => undefined), { debounceMs: 0 })
  return (
    <Form form={form} aria-label="Saving">
      <form.TextField name="name" label="Full name" />
      <FormStatus />
      <EditOnMount form={form} />
    </Form>
  )
}

function SavedDemo() {
  const form = kit.useAppForm({ defaultValues: { name: 'Ada Lovelace' } })
  useAutosave(form, () => Promise.resolve(), { debounceMs: 0 })
  return (
    <Form form={form} aria-label="Saved">
      <form.TextField name="name" label="Full name" />
      <FormStatus />
      <EditOnMount form={form} />
    </Form>
  )
}

function ErrorDemo() {
  const form = kit.useAppForm({ defaultValues: { name: 'Ada Lovelace' } })
  useAutosave(form, () => Promise.reject(new Error('network error')), { debounceMs: 0 })
  return (
    <Form form={form} aria-label="Save failed">
      <form.TextField name="name" label="Full name" />
      <FormStatus />
      <EditOnMount form={form} />
    </Form>
  )
}

/** The four states `FormStatus` reports, each on its own form (normally only one shows at once). */
export const States: Story = {
  render: () => (
    <StatesGrid
      cells={[
        { title: 'Dirty', children: <DirtyDemo /> },
        { title: 'Saving', children: <SavingDemo /> },
        { title: 'Saved', children: <SavedDemo /> },
        { title: 'Save failed', children: <ErrorDemo /> },
      ]}
    />
  ),
}

function ScopedDemo() {
  const form = kit.useAppForm({ defaultValues: { name: 'Ada Lovelace' } })
  return (
    <Form form={form} aria-label="Scoped">
      <form.TextField name="name" label="Full name" />
      <Text size="sm" tone="muted">
        {"show={['saved', 'error']}"} — editing the field never shows "Unsaved changes" here.
      </Text>
      <FormStatus show={['saved', 'error']} />
      <EditOnMount form={form} />
    </Form>
  )
}

/** `show` narrows which states an instance reports — useful when "dirty" is shown elsewhere
 * (a header bar) and this one should only ever say "Saved" or "Couldn't save". */
export const Scoped: Story = {
  name: 'Scoped to one state',
  render: () => <ScopedDemo />,
}
