import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormNumberField } from './FormNumberField'

const meta = {
  title: 'Forms/Fields/NumberField',
  component: FormNumberField,
  args: { label: 'Instalments' },
} satisfies Meta<typeof FormNumberField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: 6 }} label="Instalments">
      {(form) => (
        <form.NumberField
          name="value"
          label="Instalments"
          description="Spread the balance over"
          min={1}
          max={24}
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
              {(form) => <form.NumberField name="value" label="Instalments" min={1} max={24} />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: 6 }}>
              {(form) => (
                <form.NumberField
                  name="value"
                  label="Instalments"
                  description="Spread the balance over"
                  min={1}
                  max={24}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: 36 }} reveal>
              {(form) => (
                <form.NumberField
                  name="value"
                  label="Instalments"
                  min={1}
                  max={24}
                  validators={{ onDynamic: () => 'Choose 24 instalments or fewer' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 24 }} reveal>
              {(form) => (
                <form.NumberField
                  name="value"
                  label="Instalments"
                  min={1}
                  max={24}
                  warn={() => 'Longer plans cost more in total interest'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 6 }}>
              {(form) => (
                <form.NumberField name="value" label="Instalments" min={1} max={24} disabled />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: 6 }}>
              {(form) => (
                <form.NumberField name="value" label="Instalments" min={1} max={24} readOnly />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: 6 }} reveal>
              {(form) => (
                <form.NumberField
                  name="value"
                  label="Instalments"
                  min={1}
                  max={24}
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
    <StoryForm defaultValues={{ amount: 48000, instalments: 6 }} label="Set up a payment plan">
      {(form) => (
        <>
          <form.AmountField name="amount" label="Balance" currency="GBP" unit="minor" required />
          <form.NumberField name="instalments" label="Instalments" min={1} max={24} required />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: 6 }} mode="view" label="Instalments">
      {(form) => <form.NumberField name="value" label="Instalments" />}
    </FieldDemo>
  ),
}
