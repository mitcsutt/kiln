import type { Meta, StoryObj } from '@storybook/react-vite'
import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'
import { inlineFixture, inlineSchema, stackFixture, stackSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'

// `stack` and `inline` are ui's own `Stack` / `Inline` in schema mode; there is no forms wrapper.
const meta = {
  title: 'Forms/Layouts/Stack and inline',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Stack: Story = parityStory(stackFixture, stackSchema, ['Stack'], 'Stack')

export const Inline: Story = parityStory(
  inlineFixture,
  inlineSchema,
  ['Inline', 'SubmitButton'],
  'Inline',
)

interface Search {
  query: string
  date: string
}

const schema = defineFormSchema<Search>()({
  version: 1,
  root: {
    layout: 'inline',
    gap: 3,
    align: 'end',
    children: [
      { kind: 'text', name: 'query', label: 'Stop or route', type: 'search' },
      { kind: 'date', name: 'date', label: 'Date' },
      { content: 'submit', label: 'Search' },
    ],
  },
})

/**
 * ```json
 * { "layout": "stack", "gap": 5, "children": [] }
 * ```
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm<Search>({ defaultValues: { query: '', date: '' } })
    return (
      <Form form={form} aria-label="Search sailings">
        <SchemaForm form={form} schema={schema} />
      </Form>
    )
  },
}
