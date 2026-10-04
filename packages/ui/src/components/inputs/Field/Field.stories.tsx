import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { CheckboxField } from '#components/inputs/CheckboxField'
import { Fieldset } from '#components/inputs/Fieldset'
import { Input } from '#components/inputs/Input'
import { RadioGroup } from '#components/inputs/RadioGroup'
import { SelectField } from '#components/inputs/SelectField'
import { Switch } from '#components/inputs/Switch'
import { TextareaField } from '#components/inputs/TextareaField'
import { TextField } from '#components/inputs/TextField'
import { expenseCategories, countryGroups } from '#components/inputs/internal/storyData'
import { Field } from './Field'

const meta = {
  title: 'UI/Inputs/Field',
  component: Field,
  args: {
    label: 'Payee',
    description: 'As it appears on your bank statement',
    error: '',
    required: false,
    optional: false,
    labelHidden: false,
    disabled: false,
    children: <Input placeholder="Corner Grocer" />,
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

/** An expense form. One solid button; amount in the theme's figures. */
export const AddExpense: Story = {
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
      <SelectField label="Category" groups={expenseCategories} defaultValue="groceries" required />
      <TextField label="Date" type="date" defaultValue="2026-09-26" required />
      <TextareaField
        label="Notes"
        optional
        autoResize
        rows={2}
        placeholder="Half is Oskar's — settle up on Friday"
      />
      <Switch label="Repeats every month" />
      <Inline gap={3}>
        <Button type="submit">Save expense</Button>
        <Button variant="ghost" tone="neutral">
          Cancel
        </Button>
      </Inline>
    </Stack>
  ),
}

/** A club sign-up: text, a grouped select, a radio group and a consent box. */
export const RegisterAClub: Story = {
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
        description="Where your club is registered."
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
        label="I've read the league rules"
        description="Home clubs supply match balls and enter the result within an hour of full time."
        required
      />
      <Inline gap={3}>
        <Button type="submit">Register club</Button>
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
        groups={expenseCategories}
        placeholder="Choose a category"
        error="Choose a category"
      />
      <TextareaField
        label="Notes"
        defaultValue="Rent for September and October"
        error="Split this into two expenses, one per month"
      />
      <Fieldset legend="Plan" error="Choose a plan">
        <RadioGroup orientation="horizontal" invalid>
          <RadioGroup.Item value="10" label="$10" />
          <RadioGroup.Item value="20" label="$20" />
          <RadioGroup.Item value="50" label="$50" />
        </RadioGroup>
      </Fieldset>
      <CheckboxField label="I've read the league rules" error="Tick this to register your club" />
    </Stack>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Stack gap={5} style={formWidth}>
      <TextField
        label="Account"
        defaultValue="Everyday 062-000 1234 5678"
        disabled
        description="Linked accounts can't be edited here."
      />
      <SelectField label="Category" groups={expenseCategories} defaultValue="rent" disabled />
      <TextareaField label="Notes" defaultValue="Imported from the bank feed" disabled />
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
        label="Monthly budget"
        numeric
        leading="$"
        defaultValue="8500"
        warning="That's well above your usual spend"
        error="Enter an amount below $10,000"
      />
    </Stack>
  ),
}

/** A spinner after the label; the control gets `aria-busy` while its own check runs. */
export const Validating: Story = {
  render: () => (
    <Stack gap={5} style={formWidth}>
      <TextField label="Club name" defaultValue="Eastgate United" validating />
      <SelectField
        label="Postcode area"
        groups={expenseCategories}
        placeholder="Looking up…"
        validating
      />
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
        groups={expenseCategories}
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
        label="Account"
        defaultValue="Everyday 062-000 1234 5678"
        readOnly
        description="Linked accounts can't be edited here."
      />
      <SelectField label="Category" groups={expenseCategories} defaultValue="rent" readOnly />
      <CheckboxField label="Include in monthly report" defaultChecked readOnly />
    </Stack>
  ),
}

/** Any control can sit in a Field. A render function gives you the wiring to spread. */
export const RenderFunction: Story = {
  render: () => (
    <Stack gap={5} style={formWidth}>
      <Field label="Savings goal" description="Monthly, in whole dollars" required>
        {(props) => <Input {...props} numeric leading="$" defaultValue="750" />}
      </Field>
      <Field label="Search transactions" labelHidden>
        <Input type="search" placeholder="Search transactions" />
      </Field>
    </Stack>
  ),
}
