import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { List } from '#components/display/List'
import { Text } from '#components/typography/Text'
import { Delta } from './Delta'

const meta = {
  title: 'UI/Display/Delta',
  component: Delta,
  args: { direction: 'up', children: '2' },
} satisfies Meta<typeof Delta>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Tone follows direction; override it when falling is good (spending, goals against). */
export const Tones: Story = {
  render: () => (
    <Inline gap={5} align="baseline">
      <Delta direction="up">3 places</Delta>
      <Delta direction="down">1 place</Delta>
      <Delta direction="flat">No movement</Delta>
      <Delta direction="down" tone="positive">
        $84.20 less on groceries
      </Delta>
      <Delta direction="up" tone="critical">
        $212.40 more spent
      </Delta>
    </Inline>
  ),
}

/** Delta takes the surrounding size, so it sits inside a row or a sentence. */
export const InARow: Story = {
  render: () => (
    <Stack gap={5} style={{ maxWidth: '26rem' }}>
      <List aria-label="Movers after matchday 3">
        {[
          { name: 'Kofi Grant', pts: 51, dir: 'up' as const, by: '2' },
          { name: 'Ada Okafor', pts: 47, dir: 'down' as const, by: '1' },
          { name: 'Ingrid Tran', pts: 44, dir: 'flat' as const, by: undefined },
        ].map((r) => (
          <List.Item key={r.name}>
            <List.Content>{r.name}</List.Content>
            <List.Trailing>
              <Delta direction={r.dir}>{r.by}</Delta>
              {r.pts}
            </List.Trailing>
          </List.Item>
        ))}
      </List>
      <Text size="sm" tone="muted">
        Groceries{' '}
        <Delta direction="down" tone="positive">
          $84.20
        </Delta>{' '}
        on August.
      </Text>
    </Stack>
  ),
}
