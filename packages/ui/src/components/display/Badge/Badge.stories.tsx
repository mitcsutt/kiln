import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, Inline, Stack } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Display/Badge',
  component: Badge,
  args: { children: 'Over quota', tone: 'critical', variant: 'soft', size: 'sm', dot: false },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
const LABELS: Record<(typeof TONES)[number], string> = {
  neutral: 'Upcoming',
  accent: 'Live',
  positive: 'Approved',
  caution: 'Near limit',
  critical: 'Overdue',
  info: 'Team plan',
}

export const Tones: Story = {
  render: () => (
    <Stack gap={4}>
      {(['soft', 'solid', 'outline'] as const).map((variant) => (
        <Inline key={variant} gap={2}>
          {TONES.map((tone) => (
            <Badge key={tone} tone={tone} variant={variant}>
              {LABELS[tone]}
            </Badge>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
}

/** Counts and live state. Numbers are tabular so a ticking count doesn't jitter. */
export const CountsAndDots: Story = {
  render: () => (
    <Inline gap={3}>
      <Badge tone="accent" variant="solid" dot size="md">
        Live · 128 online
      </Badge>
      <Badge size="md">12 new</Badge>
      <Badge tone="positive" dot>
        Synced
      </Badge>
      <Badge tone="caution" dot>
        3 unreviewed
      </Badge>
      <Badge variant="outline">Beta</Badge>
    </Inline>
  ),
}

const TONES = ['neutral', 'accent', 'positive', 'caution', 'critical', 'info'] as const

/**
 * `tone` carries the meaning: `positive`, `caution`, `critical` and `info` for status, `accent`
 * for something current, `neutral` for counts. `variant` is `soft` (the default), `solid` for the
 * one badge that must shout, or `outline`. `dot` adds a leading dot, for live states.
 *
 * Keep badges to a word or two, and don't use colour alone: "Delayed" in the caution tone says it
 * twice.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={3}>
        {(['soft', 'solid', 'outline'] as const).map((variant) => (
          <Inline key={variant} gap={2}>
            {TONES.map((tone) => (
              <Badge key={tone} tone={tone} variant={variant}>
                {tone}
              </Badge>
            ))}
          </Inline>
        ))}
        <Inline gap={2}>
          <Badge tone="positive" dot>
            Live
          </Badge>
          <Badge tone="critical" size="sm">
            3 delayed
          </Badge>
        </Inline>
      </Stack>
    )
  },
}
