import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormTagsField } from './FormTagsField'

const meta = {
  title: 'Forms/Fields/TagsField',
  component: FormTagsField,
  args: { label: 'Labels' },
} satisfies Meta<typeof FormTagsField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: ['Bug', 'Design'] as readonly string[] }} label="Edit issue">
      {(form) => (
        <form.TagsField
          name="value"
          label="Labels"
          description="Press enter or comma to add. Used to filter the board."
          placeholder="Add a label"
          maxTags={8}
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
            <FieldDemo defaultValues={{ value: [] as readonly string[] }}>
              {(form) => <form.TagsField name="value" label="Labels" placeholder="Add a label" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: ['Bug'] as readonly string[] }}>
              {(form) => (
                <form.TagsField
                  name="value"
                  label="Labels"
                  description="Press enter or comma to add. Used to filter the board."
                  placeholder="Add a label"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: [] as readonly string[] }} reveal>
              {(form) => (
                <form.TagsField
                  name="value"
                  label="Labels"
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
                value: ['Bug', 'Design', 'Docs', 'Performance'] as readonly string[],
              }}
              reveal
            >
              {(form) => (
                <form.TagsField
                  name="value"
                  label="Labels"
                  warn={() => 'Most issues use one or two labels'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: ['Bug'] as readonly string[] }}>
              {(form) => <form.TagsField name="value" label="Labels" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: ['Bug'] as readonly string[] }}>
              {(form) => <form.TagsField name="value" label="Labels" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: ['Bug'] as readonly string[] }} reveal>
              {(form) => (
                <form.TagsField
                  name="value"
                  label="Labels"
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
    <StoryForm defaultValues={{ title: '', labels: [] as readonly string[] }} label="New issue">
      {(form) => (
        <>
          <form.TextField
            name="title"
            label="Title"
            placeholder="Search ignores accented letters"
            required
          />
          <form.TagsField
            name="labels"
            label="Labels"
            description="Press enter or comma to add"
            placeholder="Add a label"
            maxTags={8}
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
      defaultValues={{ value: ['Bug', 'Design'] as readonly string[] }}
      mode="view"
      label="Labels"
    >
      {(form) => <form.TagsField name="value" label="Labels" />}
    </FieldDemo>
  ),
}

/**
 * Labels bound to `labels`, lowercased as they're added and capped at five, with the value they
 * hold underneath.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { labels: ['commute'] as readonly string[] } })
    const value = useFieldValue(form, 'labels')
    return (
      <Form form={form} aria-label="TagsField example">
        <Stack gap={4}>
          <form.TagsField name="labels" label="Labels" maxTags={5} normalise="lowercase" />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
