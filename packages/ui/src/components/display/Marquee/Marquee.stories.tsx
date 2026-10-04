import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { LiveIndicator } from '#components/feedback/LiveIndicator'
import { Marquee } from './Marquee'

const services = [
  'Wayfinding',
  'Transit maps',
  'Signage systems',
  'Type design',
  'Annual reports',
  'Exhibition graphics',
  'Accessibility audits',
  'Print production',
]

const meta = {
  title: 'UI/Display/Marquee',
  component: Marquee,
  args: { label: 'What the studio does', items: services, speed: 'normal', surface: 'plain' },
  argTypes: { items: { control: false }, separator: { control: false } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Marquee>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A matchday ticker: live games carry the indicator, finished ones read FT. */
export const LiveScores: Story = {
  args: {
    label: 'Live scores',
    surface: 'inverse',
    speed: 'slow',
    items: [
      <>
        <LiveIndicator label="67'" tone="critical" />
        Harbour Hawks 2–1 Westbank Swifts
      </>,
      <>
        <LiveIndicator label="52'" tone="critical" />
        Eastgate United 1–1 Old Town Wanderers
      </>,
      <>FT · Northside Rovers 3–1 Millpond FC</>,
      <>FT · Quarry Lane 0–0 Riverside Athletic</>,
      <>Next · Hawks v Rovers, Sunday 11:00</>,
      <>FT · Swifts 2–0 Millpond FC</>,
    ],
  },
}

/** League leaders on the accent band — used once, on the table page. */
export const LeagueLeaders: Story = {
  args: {
    label: 'League leaders',
    surface: 'accent',
    items: [
      'Harbour Hawks 32 pts, 14 played',
      'Northside Rovers 30 pts',
      'Riverside Athletic 29 pts',
      'Eastgate United 27 pts',
      'Millpond FC 24 pts',
    ],
  },
}

/** A services strip: plain band between hairlines, travelling right. */
export const Services: Story = {
  args: { direction: 'right', pauseControl: false },
}

/** Any node can replace the default slanted rule. */
export const CustomSeparator: Story = {
  args: {
    separator: '/',
    label: 'Studio cities',
    items: [
      'Lisbon',
      'Toronto',
      'Osaka',
      'Vancouver',
      'Valparaíso',
      'Rotterdam',
      'Hobart',
      'Seattle',
    ],
    pauseControl: false,
  },
}

export const AllSurfaces: Story = {
  render: (args) => (
    <Stack gap={5}>
      <Marquee {...args} surface="plain" label={`${args.label} (plain)`} />
      <Marquee {...args} surface="inverse" label={`${args.label} (inverse)`} />
      <Marquee {...args} surface="accent" label={`${args.label} (accent)`} />
    </Stack>
  ),
}
