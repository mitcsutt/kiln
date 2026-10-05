import type { Meta, StoryObj } from '@storybook/react-vite'
import type { FieldOption } from '#kit/contracts'
import { FieldDemo, NEVER_SETTLES, primitive, StatesGrid, StoryForm } from '#stories/_kit'
import { FormRadioField } from './FormRadioField'

const shirtSizes: readonly FieldOption[] = [
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
]

const meta = {
  title: 'Forms/Fields/RadioField',
  component: FormRadioField,
  args: { label: 'T-shirt size' },
} satisfies Meta<typeof FormRadioField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo
      defaultValues={{ value: null as string | number | boolean | null }}
      label="Event registration"
    >
      {(form) => (
        <form.RadioField
          name="value"
          label="T-shirt size"
          description="Collected with your badge at the front desk"
          options={shirtSizes}
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
            <FieldDemo defaultValues={{ value: null as string | number | boolean | null }}>
              {(form) => <form.RadioField name="value" label="T-shirt size" options={shirtSizes} />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: null as string | number | boolean | null }}>
              {(form) => (
                <form.RadioField
                  name="value"
                  label="T-shirt size"
                  description="Collected with your badge at the front desk"
                  options={shirtSizes}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: null as string | number | boolean | null }} reveal>
              {(form) => (
                <form.RadioField
                  name="value"
                  label="T-shirt size"
                  options={shirtSizes}
                  required
                  validators={{ onDynamic: () => 'Choose a size' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: primitive('xl') }} reveal>
              {(form) => (
                <form.RadioField
                  name="value"
                  label="T-shirt size"
                  options={shirtSizes}
                  warn={() => 'XL is running low, so register soon'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: primitive('m') }}>
              {(form) => (
                <form.RadioField name="value" label="T-shirt size" options={shirtSizes} disabled />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: primitive('m') }}>
              {(form) => (
                <form.RadioField name="value" label="T-shirt size" options={shirtSizes} readOnly />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: primitive('m') }} reveal>
              {(form) => (
                <form.RadioField
                  name="value"
                  label="T-shirt size"
                  options={shirtSizes}
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
      defaultValues={{ name: '', size: null as string | number | boolean | null }}
      label="Event registration"
      submitLabel="Register"
    >
      {(form) => (
        <>
          <form.TextField name="name" label="Your name" required />
          <form.RadioField
            name="size"
            label="T-shirt size"
            description="Collected with your badge at the front desk"
            options={shirtSizes}
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
    <FieldDemo defaultValues={{ value: primitive('m') }} mode="view" label="T-shirt size">
      {(form) => <form.RadioField name="value" label="T-shirt size" options={shirtSizes} />}
    </FieldDemo>
  ),
}
