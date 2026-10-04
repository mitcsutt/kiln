import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormAmountField } from './FormAmountField'

const meta = {
  title: 'Forms/Fields/AmountField',
  component: FormAmountField,
  args: { label: 'Amount', currency: 'GBP' },
} satisfies Meta<typeof FormAmountField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: 145000 }} label="Record an invoice">
      {(form) => (
        <form.AmountField
          name="value"
          label="Amount"
          description="Due to Fernhill Print Co. on 31 October"
          currency="GBP"
          unit="minor"
          required
        />
      )}
    </FieldDemo>
  ),
}

export const States: Story = {
  render: () => (
    <StatesGrid
      cells={[
        {
          title: 'Default',
          children: (
            <FieldDemo defaultValues={{ value: null as number | null }}>
              {(form) => (
                <form.AmountField name="value" label="Amount" currency="GBP" unit="minor" />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: 145000 }}>
              {(form) => (
                <form.AmountField
                  name="value"
                  label="Invoice total"
                  description="Due to Fernhill Print Co. on 31 October"
                  currency="GBP"
                  unit="minor"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: null as number | null }} reveal>
              {(form) => (
                <form.AmountField
                  name="value"
                  label="Amount"
                  currency="GBP"
                  unit="minor"
                  validators={{ onDynamic: () => 'Enter the invoice total' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 245000 }} reveal>
              {(form) => (
                <form.AmountField
                  name="value"
                  label="Invoice total"
                  currency="GBP"
                  unit="minor"
                  warn={() => 'That is £1,000 more than the quote'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 145000 }}>
              {(form) => (
                <form.AmountField
                  name="value"
                  label="Amount"
                  currency="GBP"
                  unit="minor"
                  disabled
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: 145000 }}>
              {(form) => (
                <form.AmountField
                  name="value"
                  label="Amount"
                  currency="GBP"
                  unit="minor"
                  readOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: 145000 }} reveal>
              {(form) => (
                <form.AmountField
                  name="value"
                  label="Amount"
                  currency="GBP"
                  unit="minor"
                  validators={{ onDynamicAsync: () => NEVER_SETTLES }}
                />
              )}
            </FieldDemo>
          ),
        },
      ]}
    />
  ),
}

export const InAForm: Story = {
  name: 'In a form',
  render: () => (
    <StoryForm
      defaultValues={{ supplier: '', amount: null as number | null }}
      label="Record an invoice"
    >
      {(form) => (
        <>
          <form.TextField
            name="supplier"
            label="Supplier"
            placeholder="Fernhill Print Co."
            required
          />
          <form.AmountField name="amount" label="Amount" currency="GBP" unit="minor" required />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: 145000 }} mode="view" label="Invoice total">
      {(form) => (
        <form.AmountField name="value" label="Invoice total" currency="GBP" unit="minor" />
      )}
    </FieldDemo>
  ),
}
