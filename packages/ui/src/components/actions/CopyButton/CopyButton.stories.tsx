import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Code,
  CopyButton,
  DataList,
  Inline,
  Stack,
  Tag,
  Text,
  useClipboard,
  Button,
} from '@mitcsutt/kiln-ui'
import { expect, fn, userEvent } from 'storybook/test'

const meta = {
  title: 'UI/Actions/CopyButton',
  component: CopyButton,
  args: { value: 'https://example.com/share/ridge-route-7Hk2', label: 'Copy link', onCopy: fn() },
} satisfies Meta<typeof CopyButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  // Clipboard writes need a focused, permitted document; the browser test stubs the API so the
  // interaction is about the button, not the browser's permission prompt.
  beforeEach: () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.resolve() },
      configurable: true,
    })
    return () => {
      if (original) Object.defineProperty(navigator, 'clipboard', original)
    }
  },
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole('button', { name: 'Copy link' })
    await userEvent.click(button)
    await expect(args.onCopy).toHaveBeenCalledWith('https://example.com/share/ridge-route-7Hk2')
    await expect(button).toHaveAttribute('data-state', 'copied')
    await expect(canvas.getByRole('status')).toHaveTextContent('Copied to clipboard')
  },
}

/**
 * Beside the thing it copies. The icon-only button has a tooltip that reads "Copy", then
 * "Copied", and screen readers hear "Copied to clipboard". Say what it copies in `label`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <DataList>
        <DataList.Item label="API key">
          <Inline gap={2}>
            <Code>kln_live_4f9c2a17</Code>
            <CopyButton value="kln_live_4f9c2a17" label="Copy API key" size="sm" />
          </Inline>
        </DataList.Item>
        <DataList.Item label="Share link">
          <Inline gap={2}>
            <Text>example.com/share/ridge-route-7Hk2</Text>
            <CopyButton
              value="https://example.com/share/ridge-route-7Hk2"
              label="Copy share link"
              size="sm"
            />
          </Inline>
        </DataList.Item>
      </DataList>
    )
  },
}

/**
 * `showLabel` puts the words beside the glyph, for a copy that's the main action of its row.
 * `value` can be a function, read at the moment of the press.
 */
export const WithLabel: Story = {
  tags: ['docs'],
  render: function WithLabel() {
    return (
      <Inline gap={3}>
        <CopyButton
          value="pnpm add @mitcsutt/kiln-ui"
          label="Copy command"
          showLabel
          variant="outline"
        />
        <CopyButton
          value={() => JSON.stringify({ route: 'Ridge loop', stops: 7 }, null, 2)}
          label="Copy as JSON"
          copiedLabel="JSON copied"
          showLabel
        />
      </Inline>
    )
  },
}

/**
 * Pass a function as `children` to copy from a trigger of your own. The announcement is still
 * rendered for you. For a trigger that isn't next to a `CopyButton` at all, like a menu item, use
 * the `useClipboard` hook.
 */
export const CustomTrigger: Story = {
  tags: ['docs'],
  render: function CustomTrigger() {
    const { copy, copied, error } = useClipboard({ timeout: 2000 })
    return (
      <Stack gap={3}>
        <CopyButton value="ORD-88213">
          {({ copy: copyOrder, copied: orderCopied }) => (
            <Tag asChild>
              <button type="button" onClick={copyOrder}>
                {orderCopied ? 'Copied' : 'ORD-88213'}
              </button>
            </Tag>
          )}
        </CopyButton>
        <Inline gap={3}>
          <Button
            variant="outline"
            tone="neutral"
            onClick={() => {
              void copy('Depot 4, 18 Kestrel Way, Hamilton')
            }}
          >
            Copy depot address
          </Button>
          <Text size="sm" tone="muted" role="status">
            {copied ? 'Address copied' : error ? 'Couldn’t copy the address' : ''}
          </Text>
        </Inline>
      </Stack>
    )
  },
}
