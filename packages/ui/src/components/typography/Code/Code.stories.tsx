import type { Meta, StoryObj } from '@storybook/react-vite'
import { Code, Heading, Stack, Text } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Typography/Code',
  component: Code,
  args: { children: 'pnpm --filter @mitcsutt/kiln-ui test', tone: 'neutral' },
} satisfies Meta<typeof Code>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Sized in `em`, so it sits on the line wherever it lands. */
export const InContext: Story = {
  render: () => (
    <Stack gap={4}>
      <Heading level={3} size="xl">
        Why <Code>useTheme</Code> reads from context
      </Heading>
      <Text style={{ maxWidth: '38rem' }}>
        Set <Code>data-theme</Code> on the root and every component picks it up. To try another
        theme on one card, wrap it in <Code tone="accent">ThemeScope</Code> instead of passing props
        down.
      </Text>
      <Text size="sm" tone="muted">
        Invoices live in <Code>src/features/invoices/api/getInvoices.ts</Code>.
      </Text>
    </Stack>
  ),
}

/**
 * Code inside a sentence and inside a heading, sized to each.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={3}>
        <Text>
          Run <Code>pnpm add @mitcsutt/kiln-ui</Code>, then import <Code>styles.css</Code> once.
        </Text>
        <Heading level={3} size="lg">
          The <Code>gap</Code> prop
        </Heading>
      </Stack>
    )
  },
}
