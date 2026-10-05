import type { Meta, StoryObj } from '@storybook/react-vite'
import { kit, parseFormSchema } from '@mitcsutt/kiln-forms'
import { Code, List, Stack, Text } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'Forms/Schema/Untrusted schemas',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// JSON from a CMS, with the mistakes and hostile props such JSON can carry.
const json: unknown = {
  version: 1,
  root: {
    layout: 'stack',
    children: [
      { kind: 'txt', name: 'name', label: 'Name' },
      { kind: 'text', name: 'email', label: 'Email', onFocus: 'alert(1)' },
      { kind: 'text', name: 'site', label: 'Website', rules: [{ rule: 'minLenght', value: 3 }] },
      { layout: 'colums', children: [] },
    ],
  },
}

const result = parseFormSchema(json, { kinds: Object.keys(kit.registries.fields) })

/**
 * ```ts
 * import { parseFormSchema } from '@mitcsutt/kiln-forms/schema'
 *
 * const result = parseFormSchema(json, { kinds: ['text', 'select', 'checkbox'], loaders: ['stops']
 * }) if (!result.ok) report(result.issues) else render(result.schema) ```
 *
 * The second argument lists the keys the schema may reference: field kinds, layouts, loaders,
 * validators, computers and custom nodes.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    if (result.ok) return <Text>Valid schema</Text>
    return (
      <Stack gap={3}>
        <Text weight="strong">{result.issues.length} problems, each at its exact path:</Text>
        <List density="compact">
          {result.issues.map((issue) => (
            <List.Item key={issue.path + issue.message}>
              <List.Content>
                <Code>{issue.path}</Code>
                <List.Description>{issue.message}</List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      </Stack>
    )
  },
}
