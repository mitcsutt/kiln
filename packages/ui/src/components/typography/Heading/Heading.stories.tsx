import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading, Stack } from '@mitcsutt/kiln-ui'
import { Text } from '#components/typography/Text'
import type { HeadingSize } from './Heading'

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
  { size: 'display-md', text: 'Release 2.4 overview' },
  { size: 'display-sm', text: 'September invoices' },
  { size: '3xl', text: 'Active projects, 2024 to now' },
  { size: '2xl', text: 'Sprint 14 tasks' },
  { size: 'xl', text: 'Billing and plans' },
  { size: 'lg', text: 'Planning meeting with Northwind Studio' },
  { size: 'md', text: 'Recent releases' },
  { size: 'sm', text: 'Team totals' },
]

/**
 * The full scale. This is where the themes differ most: Monograph sets a big, tight
 * Newsreader; Fiesta shouts in condensed poster caps; Ledger stays a compact grotesk.
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
          Monthly revenue
        </Heading>
        <Heading level={2} size="display-md">
          $4,182.60 invoiced
        </Heading>
      </Stack>
      <Stack gap={2}>
        <Heading level={3} size="sm" tone="muted">
          Release 2.4, 14 June
        </Heading>
        <Heading level={4} size="2xl">
          Billing migration and the new pricing page
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
    children: 'Tools that keep releases on schedule',
  },
}

export const Tones: Story = {
  render: () => (
    <Stack gap={4}>
      <Heading level={3} size="2xl">
        Default — Atlas redesign is on track
      </Heading>
      <Heading level={3} size="2xl" tone="muted">
        Muted — Archive, 2022 releases
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
        An invoice run that survives contact with September
      </Heading>
      <Heading level={3} size="xl" measure="text">
        How we cut invoice processing time in half without hiring anyone
      </Heading>
    </Stack>
  ),
}

/**
 * With no `size`, each level has a default look (`DEFAULT_HEADING_SIZE`). Headings use the theme's
 * heading role (face, weight, tracking, transform) and display sizes use its display role.
 * `balance` (on by default) evens out line lengths. `tone="muted"` steps a heading back;
 * `tone="accent"` is rarely right.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={4}>
        <Heading level={2} size="display-sm">
          Summer timetable
        </Heading>
        <Heading level={3}>Coastal line</Heading>
        <Heading level={4} tone="muted">
          Weekend services
        </Heading>
      </Stack>
    )
  },
}

const SIZES = [
  'display-lg',
  'display-md',
  'display-sm',
  '3xl',
  '2xl',
  'xl',
  'lg',
  'md',
  'sm',
] as const

/**
 * `size` is a display step (`display-lg`, `display-md`, `display-sm`) or a text step (`3xl` down
 * to `sm`), and takes responsive values: `size={{ base: '2xl', md: 'display-sm' }}`.
 */
export const Sizes: Story = {
  tags: ['docs'],
  render: function Sizes() {
    return (
      <Stack gap={3}>
        {SIZES.map((size) => (
          <Heading key={size} level={3} size={size}>
            {size}: High water 06:42
          </Heading>
        ))}
      </Stack>
    )
  },
}
