import type { Meta, StoryObj } from '@storybook/react-vite'
import { Delta, Inline } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'
import { List } from '#components/display/List'
import { Text } from '#components/typography/Text'

const meta = {
  title: 'UI/Display/Delta',
  component: Delta,
  args: { direction: 'up', children: '2' },
} satisfies Meta<typeof Delta>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Tone follows direction; override it when falling is good (costs, open bugs). */
export const Tones: Story = {
  render: () => (
    <Inline gap={5} align="baseline">
      <Delta direction="up">3 places</Delta>
      <Delta direction="down">1 place</Delta>
      <Delta direction="flat">No movement</Delta>
      <Delta direction="down" tone="positive">
        $84.20 less on hosting
      </Delta>
      <Delta direction="up" tone="critical">
        $212.40 more in costs
      </Delta>
    </Inline>
  ),
}

/** Delta takes the surrounding size, so it sits inside a row or a sentence. */
export const InARow: Story = {
  render: () => (
    <Stack gap={5} style={{ maxWidth: '26rem' }}>
      <List aria-label="Review leaderboard, week 3">
        {[
          { name: 'Tomás Ortega', reviews: 51, dir: 'up' as const, by: '2' },
          { name: 'Hana Kobayashi', reviews: 47, dir: 'down' as const, by: '1' },
          { name: 'Sam Okafor', reviews: 44, dir: 'flat' as const, by: undefined },
        ].map((r) => (
          <List.Item key={r.name}>
            <List.Content>{r.name}</List.Content>
            <List.Trailing>
              <Delta direction={r.dir}>{r.by}</Delta>
              {r.reviews}
            </List.Trailing>
          </List.Item>
        ))}
      </List>
      <Text size="sm" tone="muted">
        Hosting{' '}
        <Delta direction="down" tone="positive">
          $84.20
        </Delta>{' '}
        on August.
      </Text>
    </Stack>
  ),
}

/**
 * Changes up and down, with tones that say whether each one is good news, and no change.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Inline gap={5}>
        <Delta direction="up" tone="positive">
          12%
        </Delta>
        <Delta direction="down" tone="critical">
          3 sailings
        </Delta>
        <Delta direction="down" tone="positive">
          4 min delay
        </Delta>
        <Delta direction="flat">No change</Delta>
      </Inline>
    )
  },
}
