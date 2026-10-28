import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field, Input, Stack, Text, TextField, useFieldControl } from '@mitcsutt/kiln-ui'
import { Button } from '#components/actions/Button'
import { Inline } from '#components/layout/Inline'
import { CheckboxField } from '#components/inputs/CheckboxField'
import { Fieldset } from '#components/inputs/Fieldset'
import { RadioGroup } from '#components/inputs/RadioGroup'
import { SelectField } from '#components/inputs/SelectField'
import { Switch } from '#components/inputs/Switch'
import { TextareaField } from '#components/inputs/TextareaField'
import { taskCategories, countryGroups } from '#components/inputs/internal/storyData'

const meta = {
  title: 'UI/Inputs/Field',
  component: Field,
  args: {
    label: 'Client',
    description: 'As it appears on the invoice',
    error: '',
    required: false,
    optional: false,
    labelHidden: false,
    disabled: false,
    children: <Input placeholder="Northwind Studio" />,
  },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

const formWidth = { maxInlineSize: '28rem' }

export const Playground: Story = {
  render: (args) => (
    <Stack style={formWidth}>
      <Field {...args} />
    </Stack>
  ),
}

/** An invoice line form. One solid button; amount in the theme's figures. */
export const AddLineItem: Story = {
  render: () => (
    <Stack
      as="form"
      gap={5}
      style={formWidth}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <TextField
        label="Amount"
        description="Include GST"
        numeric
        leading="$"
        trailing="AUD"
        defaultValue="86.40"
        required
      />
      <SelectField label="Category" groups={taskCategories} defaultValue="research" required />
      <TextField label="Date" type="date" defaultValue="2026-09-26" required />
      <TextareaField
        label="Notes"
        optional
        autoResize
        rows={2}
        placeholder="Covers the September discovery workshop"
      />
      <Switch label="Repeats every month" />
      <Inline gap={3}>
        <Button type="submit">Add line item</Button>
        <Button variant="ghost" tone="neutral">
          Cancel
        </Button>
      </Inline>
    </Stack>
  ),
}

/** A workspace sign-up: text, a grouped select, a radio group and a consent box. */
export const CreateAWorkspace: Story = {
  render: () => (
    <Stack
      as="form"
      gap={5}
      style={formWidth}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <TextField label="Your name" placeholder="Kofi Taylor" autoComplete="name" required />
      <TextField
        label="Email"
        type="email"
        description="We send your magic link here and nothing else."
        placeholder="kofi@example.com"
        autoComplete="email"
        required
      />
      <SelectField
        label="Country"
        description="Where your company is registered."
        groups={countryGroups}
        placeholder="Choose a country"
        optional
      />
      <Fieldset legend="Plan" description="Billed monthly. Change or cancel any time.">
        <RadioGroup defaultValue="20" orientation="horizontal">
          <RadioGroup.Item value="10" label="$10" />
          <RadioGroup.Item value="20" label="$20" />
          <RadioGroup.Item value="50" label="$50" />
        </RadioGroup>
      </Fieldset>
      <CheckboxField
        label="I've read the workspace guidelines"
        description="Guests can view shared projects but can't edit tasks or invite anyone else."
        required
      />
      <Inline gap={3}>
        <Button type="submit">Create workspace</Button>
      </Inline>
    </Stack>
  ),
}

/** Only validation tints a control, and only its border. Focus stays the neutral ring. */
export const Validation: Story = {
  render: () => (
    <Stack gap={5} style={formWidth}>
      <TextField
        label="Amount"
        numeric
        leading="$"
        trailing="AUD"
        defaultValue="0.00"
        error="Enter an amount above $0.00"
        required
      />
      <TextField
        label="Email"
        type="email"
        defaultValue="kofi.example.com"
        error="That email is missing an @"
      />
      <SelectField
        label="Category"
        groups={taskCategories}
        placeholder="Choose a category"
        error="Choose a category"
      />
      <TextareaField
        label="Notes"
        defaultValue="Design work for September and October"
        error="Split this into two line items, one per month"
      />
      <Fieldset legend="Plan" error="Choose a plan">
        <RadioGroup orientation="horizontal" invalid>
          <RadioGroup.Item value="10" label="$10" />
          <RadioGroup.Item value="20" label="$20" />
          <RadioGroup.Item value="50" label="$50" />
        </RadioGroup>
      </Fieldset>
      <CheckboxField
        label="I've read the workspace guidelines"
        error="Tick this to join the workspace"
      />
    </Stack>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Stack gap={5} style={formWidth}>
      <TextField
        label="Workspace ID"
        defaultValue="northwind-studio"
        disabled
        description="Workspace IDs can't be changed here."
      />
      <SelectField label="Category" groups={taskCategories} defaultValue="backend" disabled />
      <TextareaField label="Notes" defaultValue="Imported from the time tracker" disabled />
      <CheckboxField label="Include in monthly report" defaultChecked disabled />
      <Switch label="Repeats every month" defaultChecked disabled />
    </Stack>
  ),
}

/** Non-blocking advice — caution tone, never `role="alert"`. Hidden once an error shows. */
export const Warning: Story = {
  render: () => (
    <Stack gap={5} style={formWidth}>
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        defaultValue="password1"
        warning="This password appears in a data breach list"
      />
      <TextField
        label="Monthly retainer"
        numeric
        leading="$"
        defaultValue="8500"
        warning="That's well above this client's usual retainer"
        error="Enter an amount below $10,000"
      />
    </Stack>
  ),
}

/** A spinner after the label; the control gets `aria-busy` while its own check runs. */
export const Validating: Story = {
  render: () => (
    <Stack gap={5} style={formWidth}>
      <TextField label="Workspace name" defaultValue="Northwind Studio" validating />
      <SelectField label="Category" groups={taskCategories} placeholder="Looking up…" validating />
    </Stack>
  ),
}

/** Label/description in one column, the control in another. Collapses to a stack below `sm`. */
export const HorizontalLayout: Story = {
  render: () => (
    <Stack gap={5} style={{ maxInlineSize: '36rem' }}>
      <TextField
        label="Full name"
        description="As it appears on your ID"
        placeholder="Kofi Taylor"
        layout="horizontal"
      />
      <TextField
        label="Email"
        type="email"
        placeholder="kofi@example.com"
        layout="horizontal"
        required
      />
      <SelectField
        label="Category"
        groups={taskCategories}
        placeholder="Choose a category"
        layout="horizontal"
      />
    </Stack>
  ),
}

/** Focusable, announced as read-only, and not editable — the value still gets submitted. */
export const ReadOnly: Story = {
  render: () => (
    <Stack gap={5} style={formWidth}>
      <TextField
        label="Workspace ID"
        defaultValue="northwind-studio"
        readOnly
        description="Workspace IDs can't be changed here."
      />
      <SelectField label="Category" groups={taskCategories} defaultValue="backend" readOnly />
      <CheckboxField label="Include in monthly report" defaultChecked readOnly />
    </Stack>
  ),
}

/** Any control can sit in a Field. A render function gives you the wiring to spread. */
export const RenderFunction: Story = {
  render: () => (
    <Stack gap={5} style={formWidth}>
      <Field label="Hourly rate" description="In whole dollars" required>
        {(props) => <Input {...props} numeric leading="$" defaultValue="150" />}
      </Field>
      <Field label="Search invoices" labelHidden>
        <Input type="search" placeholder="Search invoices" />
      </Field>
    </Stack>
  ),
}

/**
 * The label is wired to the control (`htmlFor`), the description and messages to
 * `aria-describedby`, and an error sets `aria-invalid` on the control. Kiln's controls read this
 * wiring from the `Field` around them, so you never pass ids by hand.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={5}>
        <Field label="Fare" description="Before any railcard discount">
          <Input numeric leading="£" placeholder="0.00" />
        </Field>
        <Field label="Booking reference" error="That reference doesn't match a booking" required>
          <Input defaultValue="BAY-40Q" />
        </Field>
        <Field label="Username" warning="Usernames are case-sensitive">
          <Input defaultValue="InesV" />
        </Field>
      </Stack>
    )
  },
}

/**
 * `layout="stack"` (the default) puts the label above the control. `horizontal` gives the label
 * and the control their own columns, stacking below `sm`. `inline` hides the label visually so the
 * control can sit in a sentence. The group fields (checkbox and radio groups, chips, choice cards,
 * date range) take the same `layout`.
 */
export const Layouts: Story = {
  name: 'Layout',
  tags: ['docs'],
  render: function Layouts() {
    return (
      <Stack gap={6}>
        <TextField label="Stack (default)" description="Label above the control" />
        <TextField
          layout="horizontal"
          label="Horizontal"
          description="Label and control in columns"
        />
        <Text>
          Leave at{' '}
          <TextField layout="inline" label="Departure time" defaultValue="07:10" htmlSize={6} />{' '}
          from Harbour Square.
        </Text>
      </Stack>
    )
  },
}

function SeatPicker() {
  // The surrounding Field's id, description ids and state, for your own control.
  const field = useFieldControl()
  return (
    <select
      id={field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid ? true : undefined}
      disabled={field?.disabled}
    >
      <option>Window</option>
      <option>Aisle</option>
    </select>
  )
}

/**
 * `useFieldControl()` returns the surrounding `Field`'s wiring (`id`, `describedBy`, `invalid`,
 * `disabled`, and so on), or `null` outside one. Kiln's controls call it themselves; call it from
 * your own control to make it Field-aware.
 */
export const CustomControl: Story = {
  name: 'Your own control',
  tags: ['docs'],
  render: function CustomControl() {
    return (
      <Field label="Seat" description="Your own control, wired by the Field">
        <SeatPicker />
      </Field>
    )
  },
}
