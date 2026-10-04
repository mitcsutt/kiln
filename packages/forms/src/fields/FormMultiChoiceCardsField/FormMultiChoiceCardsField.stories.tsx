import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormMultiChoiceCardsField } from './FormMultiChoiceCardsField'

const addOns = [
  { value: 'lunch', label: 'Lunch both days', description: '£24, vegetarian unless you say' },
  {
    value: 'recordings',
    label: 'Talk recordings',
    description: '£15, sent a week after the event',
  },
]

const meta = {
  title: 'Forms/Fields/MultiChoiceCardsField',
  component: FormMultiChoiceCardsField,
  args: { label: 'Add-ons' },
} satisfies Meta<typeof FormMultiChoiceCardsField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo
      defaultValues={{ value: [] as readonly (string | number)[] }}
      label="Event registration"
    >
      {(form) => (
        <form.MultiChoiceCardsField
          name="value"
          label="Add-ons"
          description="Optional extras, paid with your ticket"
          options={addOns}
          columns={{ base: 1, sm: 2 }}
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
            <FieldDemo defaultValues={{ value: [] as readonly (string | number)[] }}>
              {(form) => (
                <form.MultiChoiceCardsField name="value" label="Add-ons" options={addOns} />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: [] as readonly (string | number)[] }}>
              {(form) => (
                <form.MultiChoiceCardsField
                  name="value"
                  label="Add-ons"
                  description="Optional extras, paid with your ticket"
                  options={addOns}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: [] as readonly (string | number)[] }} reveal>
              {(form) => (
                <form.MultiChoiceCardsField
                  name="value"
                  label="Add-ons"
                  options={addOns}
                  validators={{
                    onDynamic: () => 'Choose at least one add-on, or go back and skip this step',
                  }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo
              defaultValues={{
                value: ['lunch', 'recordings'] as readonly (string | number)[],
              }}
              reveal
            >
              {(form) => (
                <form.MultiChoiceCardsField
                  name="value"
                  label="Add-ons"
                  options={addOns}
                  warn={() => 'That adds £39 to your ticket'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: ['lunch'] as readonly (string | number)[] }}>
              {(form) => (
                <form.MultiChoiceCardsField
                  name="value"
                  label="Add-ons"
                  options={addOns}
                  disabled
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: ['lunch'] as readonly (string | number)[] }}>
              {(form) => (
                <form.MultiChoiceCardsField
                  name="value"
                  label="Add-ons"
                  options={addOns}
                  readOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: ['lunch'] as readonly (string | number)[] }} reveal>
              {(form) => (
                <form.MultiChoiceCardsField
                  name="value"
                  label="Add-ons"
                  options={addOns}
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
      defaultValues={{ name: '', addOns: [] as readonly (string | number)[] }}
      label="Event registration"
      submitLabel="Register"
    >
      {(form) => (
        <>
          <form.TextField name="name" label="Your name" required />
          <form.MultiChoiceCardsField
            name="addOns"
            label="Add-ons"
            description="Optional extras, paid with your ticket"
            options={addOns}
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo
      defaultValues={{ value: ['lunch'] as readonly (string | number)[] }}
      mode="view"
      label="Add-ons"
    >
      {(form) => <form.MultiChoiceCardsField name="value" label="Add-ons" options={addOns} />}
    </FieldDemo>
  ),
}
