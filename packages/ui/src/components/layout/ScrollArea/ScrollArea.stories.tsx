import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, Card, Inline, ScrollArea, Stack, Text } from '@mitcsutt/kiln-ui'
import { expect } from 'storybook/test'

const meta = {
  title: 'UI/Layout/ScrollArea',
  component: ScrollArea,
  args: { label: 'Knockout rounds', axis: 'x' },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const ROUNDS = [
  { round: 'Round of 16', ties: ['Kelso Bay 2–1 Old Quay', 'Harbour Square 0–0 Marram Point'] },
  { round: 'Quarter-finals', ties: ['Kelso Bay 3–2 North Point', 'Harbour Square 1–0 Eastgate'] },
  { round: 'Semi-finals', ties: ['Kelso Bay 1–1 Harbour Square'] },
  { round: 'Final', ties: ['Saturday 14:00 at Harbour Park'] },
]

/** A row of rounds wider than the frame. Try `axis` in the controls. */
export const Playground: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '32rem' }}>
      <ScrollArea {...args}>
        <Inline gap={4} wrap={false}>
          {ROUNDS.map((r) => (
            <Card key={r.round}>
              <Card.Body>
                <Stack gap={2}>
                  <Text weight="medium">{r.round}</Text>
                  {r.ties.map((tie) => (
                    <Text key={tie} size="sm" tone="muted">
                      {tie}
                    </Text>
                  ))}
                </Stack>
              </Card.Body>
            </Card>
          ))}
        </Inline>
      </ScrollArea>
    </Stack>
  ),
}

/**
 * Something wider than the page, such as a knockout bracket, scrolls inside a `ScrollArea`
 * instead of pushing the page sideways. Its `label` makes it a named region that keyboard users
 * can focus and scroll with the arrow keys.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <ScrollArea label="Knockout rounds">
      <Inline gap={4} wrap={false}>
        {ROUNDS.map((r) => (
          <Card key={r.round}>
            <Card.Body>
              <Stack gap={2} align="start">
                <Text weight="medium">{r.round}</Text>
                {r.ties.map((tie) => (
                  <Badge key={tie} variant="outline">
                    {tie}
                  </Badge>
                ))}
              </Stack>
            </Card.Body>
          </Card>
        ))}
      </Inline>
    </ScrollArea>
  ),
}

/** The labelled area is in the tab order and its content overflows, so a keyboard can scroll it. */
export const KeyboardReachable: Story = {
  render: () => (
    <Stack style={{ maxWidth: '20rem' }}>
      <ScrollArea label="Fixtures, week 14">
        <Inline gap={4} wrap={false}>
          {ROUNDS.map((r) => (
            <Card key={r.round}>
              <Card.Body>
                <Text weight="medium">{r.round}</Text>
              </Card.Body>
            </Card>
          ))}
        </Inline>
      </ScrollArea>
    </Stack>
  ),
  play: async ({ canvas, userEvent }) => {
    const region = canvas.getByRole('region', { name: 'Fixtures, week 14' })
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth)
    await userEvent.tab()
    await expect(region).toHaveFocus()
    region.scrollLeft = 120
    await expect(region.scrollLeft).toBeGreaterThan(0)
    await expect(getComputedStyle(region).overflowX).toBe('auto')
  },
}
