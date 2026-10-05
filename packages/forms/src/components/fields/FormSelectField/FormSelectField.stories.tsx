import type { Meta, StoryObj } from '@storybook/react-vite'
import type { FieldOption } from '#kit/contracts'
import { FieldDemo, NEVER_SETTLES, primitive, StatesGrid, StoryForm } from '#stories/_kit'
import { FormSelectField } from './FormSelectField'

const categories: readonly FieldOption[] = [
  { value: 'rail', label: 'Rail and air', group: 'Travel' },
  { value: 'hotels', label: 'Hotels', group: 'Travel' },
  { value: 'meals', label: 'Meals', group: 'Day to day' },
  { value: 'taxis', label: 'Taxis', group: 'Day to day' },
  { value: 'hosting', label: 'Client hospitality', group: 'Day to day' },
  { value: 'software', label: 'Software', group: 'Equipment' },
]

const meta = {
  title: 'Forms/Fields/SelectField',
  component: FormSelectField,
  args: { label: 'Category' },
} satisfies Meta<typeof FormSelectField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: null as string | number | boolean | null }} label="Category">
      {(form) => (
        <form.SelectField
          name="value"
          label="Category"
          description="Decides who approves the claim"
          options={categories}
          placeholder="Choose a category"
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
              {(form) => (
                <form.SelectField
                  name="value"
                  label="Category"
                  options={categories}
                  placeholder="Choose a category"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: null as string | number | boolean | null }}>
              {(form) => (
                <form.SelectField
                  name="value"
                  label="Category"
                  description="Decides who approves the claim"
                  options={categories}
                  placeholder="Choose a category"
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
                <form.SelectField
                  name="value"
                  label="Category"
                  options={categories}
                  placeholder="Choose a category"
                  validators={{ onDynamic: () => 'Choose a category' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: primitive('hosting') }} reveal>
              {(form) => (
                <form.SelectField
                  name="value"
                  label="Category"
                  options={categories}
                  warn={() => 'Client hospitality needs a guest list attached'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: primitive('meals') }}>
              {(form) => (
                <form.SelectField name="value" label="Category" options={categories} disabled />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: primitive('meals') }}>
              {(form) => (
                <form.SelectField name="value" label="Category" options={categories} readOnly />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: primitive('meals') }} reveal>
              {(form) => (
                <form.SelectField
                  name="value"
                  label="Category"
                  options={categories}
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
      defaultValues={{ merchant: '', category: null as string | number | boolean | null }}
      label="Submit an expense"
    >
      {(form) => (
        <>
          <form.TextField name="merchant" label="Merchant" placeholder="Halden Rail" required />
          <form.SelectField
            name="category"
            label="Category"
            options={categories}
            placeholder="Choose a category"
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
    <FieldDemo defaultValues={{ value: primitive('meals') }} mode="view" label="Category">
      {(form) => <form.SelectField name="value" label="Category" options={categories} />}
    </FieldDemo>
  ),
}
