import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Text } from '#components/typography/Text'
import { Heading, type HeadingSize } from './Heading'

const meta = {
  title: 'UI/Typography/Heading',
  component: Heading,
  args: {
    children: 'Software that stays out of the way',
    level: 1,
    size: 'display-md',
    tone: 'default',
    balance: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['display-lg', 'display-md', 'display-sm', '3xl', '2xl', 'xl', 'lg', 'md', 'sm'],
    },
  },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const SCALE: { size: HeadingSize; text: string }[] = [
  { size: 'display-lg', text: 'Software that stays out of the way' },
  { size: 'display-md', text: 'Division two table' },
  { size: 'display-sm', text: 'September spending' },
  { size: '3xl', text: 'Recent projects, 2019 to now' },
  { size: '2xl', text: 'Round 14 fixtures' },
  { size: 'xl', text: 'Groceries and home' },
  { size: 'lg', text: 'Opening match at Harbour Park' },
  { size: 'md', text: 'Recent writing' },
  { size: 'sm', text: 'Club totals' },
]

/**
 * The full scale. This is where the themes differ most: Monograph sets a big, tight
 * Newsreader; Fiesta shouts in condensed stadium caps; Ledger stays a compact grotesk.
 */
export const TypeScale: Story = {
  render: () => (
    <Stack gap={6}>
      {SCALE.map(({ size, text }) => (
        <Stack key={size} gap={2}>
          <Text as="span" size="xs" tone="subtle">
            {size}
          </Text>
          <Heading level={2} size={size}>
            {text}
          </Heading>
        </Stack>
      ))}
    </Stack>
  ),
}

/** `level` is the outline; `size` is the look. A page's h1 can be small; a card's h3 can be huge. */
export const LevelVersusSize: Story = {
  render: () => (
    <Stack gap={6}>
      <Stack gap={2}>
        <Heading level={1} size="lg" tone="muted">
          Monthly budget
        </Heading>
        <Heading level={2} size="display-md">
          $4,182.60 spent
        </Heading>
      </Stack>
      <Stack gap={2}>
        <Heading level={3} size="sm" tone="muted">
          Round 1, 14 June
        </Heading>
        <Heading level={4} size="2xl">
          Harbour Hawks v Millpond FC
        </Heading>
      </Stack>
    </Stack>
  ),
}

/** Responsive: modest on phones, a display step from `md` up. Resize the canvas to see the switch. */
export const Responsive: Story = {
  args: {
    level: 2,
    size: { base: '2xl', md: 'display-sm', xl: 'display-md' },
    children: 'Things I have built for teams',
  },
}

export const Tones: Story = {
  render: () => (
    <Stack gap={4}>
      <Heading level={3} size="2xl">
        Default — Brazil top the group
      </Heading>
      <Heading level={3} size="2xl" tone="muted">
        Muted — Archive, 2022 season
      </Heading>
      <Heading level={3} size="2xl" tone="accent">
        Accent — Live now
      </Heading>
    </Stack>
  ),
}

/** `measure` caps the line length with a width token, so a long display heading breaks where you'd set it by hand. */
export const Measure: Story = {
  render: () => (
    <Stack gap={6}>
      <Heading level={2} size="display-sm" measure="narrow">
        A budget that survives contact with September
      </Heading>
      <Heading level={3} size="xl" measure="text">
        How the fixture list keeps every club's home games spread across the season
      </Heading>
    </Stack>
  ),
}
