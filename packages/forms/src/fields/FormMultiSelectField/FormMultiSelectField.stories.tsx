import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormMultiSelectField } from './FormMultiSelectField'

const labels = [
  { value: 'bug', label: 'Bug' },
  { value: 'design', label: 'Design' },
  { value: 'docs', label: 'Documentation' },
  { value: 'performance', label: 'Performance' },
]

const meta = {
  title: 'Forms/Fields/MultiSelectField',
  component: FormMultiSelectField,
  args: { label: 'Labels' },
} satisfies Meta<typeof FormMultiSelectField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo
      defaultValues={{ value: ['bug', 'design'] as readonly (string | number)[] }}
      label="Edit issue"
    >
      {(form) => (
        <form.MultiSelectField
          name="value"
          label="Labels"
          description="Pick up to five. Used to filter the board."
          options={labels}
          maxSelected={5}
          placeholder="Add a label"
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
                <form.MultiSelectField
                  name="value"
                  label="Labels"
                  options={labels}
                  placeholder="Add a label"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: ['bug'] as readonly (string | number)[] }}>
              {(form) => (
                <form.MultiSelectField
                  name="value"
                  label="Labels"
                  description="Pick up to five. Used to filter the board."
                  options={labels}
                  placeholder="Add a label"
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
                <form.MultiSelectField
                  name="value"
                  label="Labels"
                  options={labels}
                  placeholder="Add a label"
                  required
                  validators={{ onDynamic: () => 'Add at least one label' }}
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
                value: ['bug', 'design', 'docs'] as readonly (string | number)[],
              }}
              reveal
            >
              {(form) => (
                <form.MultiSelectField
                  name="value"
                  label="Labels"
                  options={labels}
                  warn={() => 'Bugs are rarely documentation issues too'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: ['bug'] as readonly (string | number)[] }}>
              {(form) => (
                <form.MultiSelectField name="value" label="Labels" options={labels} disabled />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: ['bug'] as readonly (string | number)[] }}>
              {(form) => (
                <form.MultiSelectField name="value" label="Labels" options={labels} readOnly />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: ['bug'] as readonly (string | number)[] }} reveal>
              {(form) => (
                <form.MultiSelectField
                  name="value"
                  label="Labels"
                  options={labels}
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
      defaultValues={{ title: '', labels: [] as readonly (string | number)[] }}
      label="New issue"
    >
      {(form) => (
        <>
          <form.TextField
            name="title"
            label="Title"
            placeholder="Search ignores accented letters"
            required
          />
          <form.MultiSelectField
            name="labels"
            label="Labels"
            description="Pick up to five. Used to filter the board."
            options={labels}
            maxSelected={5}
            placeholder="Add a label"
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
      defaultValues={{ value: ['bug', 'design'] as readonly (string | number)[] }}
      mode="view"
      label="Labels"
    >
      {(form) => <form.MultiSelectField name="value" label="Labels" options={labels} />}
    </FieldDemo>
  ),
}
