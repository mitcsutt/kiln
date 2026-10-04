import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormComboboxField } from './FormComboboxField'

const countries = [
  { value: 'arg', label: 'Argentina' },
  { value: 'fra', label: 'France' },
  { value: 'bra', label: 'Brazil' },
  { value: 'eng', label: 'England' },
  { value: 'esp', label: 'Spain' },
  { value: 'ned', label: 'Netherlands' },
  { value: 'por', label: 'Portugal' },
  { value: 'ger', label: 'Germany' },
]

const meta = {
  title: 'Forms/Fields/ComboboxField',
  component: FormComboboxField,
  args: { label: 'Country' },
} satisfies Meta<typeof FormComboboxField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: null as string | number | null }} label="Shipping address">
      {(form) => (
        <form.ComboboxField
          name="value"
          label="Country"
          description="Where we send your order"
          options={countries}
          placeholder="Search 8 countries"
          clearable
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
            <FieldDemo defaultValues={{ value: null as string | number | null }}>
              {(form) => (
                <form.ComboboxField
                  name="value"
                  label="Country"
                  options={countries}
                  placeholder="Search 8 countries"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: null as string | number | null }}>
              {(form) => (
                <form.ComboboxField
                  name="value"
                  label="Country"
                  description="Where we send your order"
                  options={countries}
                  placeholder="Search 8 countries"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: null as string | number | null }} reveal>
              {(form) => (
                <form.ComboboxField
                  name="value"
                  label="Country"
                  options={countries}
                  placeholder="Search 8 countries"
                  required
                  validators={{ onDynamic: () => 'Choose a country' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 'ger' }} reveal>
              {(form) => (
                <form.ComboboxField
                  name="value"
                  label="Country"
                  options={countries}
                  warn={() => 'Deliveries to Germany take 5 to 7 working days'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 'arg' }}>
              {(form) => (
                <form.ComboboxField name="value" label="Country" options={countries} disabled />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: 'arg' }}>
              {(form) => (
                <form.ComboboxField name="value" label="Country" options={countries} readOnly />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: 'arg' }} reveal>
              {(form) => (
                <form.ComboboxField
                  name="value"
                  label="Country"
                  options={countries}
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
      defaultValues={{ name: '', country: null as string | number | null }}
      label="Shipping address"
      submitLabel="Save address"
    >
      {(form) => (
        <>
          <form.TextField name="name" label="Your name" required />
          <form.ComboboxField
            name="country"
            label="Country"
            description="Where we send your order"
            options={countries}
            placeholder="Search 8 countries"
            required
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: 'arg' }} mode="view" label="Country">
      {(form) => <form.ComboboxField name="value" label="Country" options={countries} />}
    </FieldDemo>
  ),
}
