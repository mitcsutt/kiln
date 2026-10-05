import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { LiveIndicator } from '#components/feedback/LiveIndicator'
import { Marquee } from './Marquee'

const features = [
  'Unlimited projects',
  'Invoicing',
  'Time tracking',
  'Client portal',
  'Audit log',
  'Single sign-on',
  'Webhooks',
  'Priority support',
]

const meta = {
  title: 'UI/Display/Marquee',
  component: Marquee,
  args: { label: "What's in every plan", items: features, speed: 'normal', surface: 'plain' },
  argTypes: { items: { control: false }, separator: { control: false } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Marquee>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A status ticker: running deploys carry the indicator, finished ones read Done. */
export const LiveStatus: Story = {
  args: {
    label: 'Deploy status',
    surface: 'inverse',
    speed: 'slow',
    items: [
      <>
        <LiveIndicator label="Deploying" tone="critical" />
        Atlas redesign · release 2.4 to production
      </>,
      <>
        <LiveIndicator label="Running" tone="critical" />
        Billing migration · batch 3 of 8
      </>,
      <>Done · Mobile app 3.1 in the app stores</>,
      <>Done · Help centre search reindexed</>,
      <>Next · Release 2.5 code freeze, Thursday 11:00</>,
      <>Done · Invoices API 2.0 to staging</>,
    ],
  },
}

/** Top accounts on the accent band — used once, on the dashboard. */
export const TopAccounts: Story = {
  args: {
    label: 'Top accounts this quarter',
    surface: 'accent',
    items: [
      'Northwind Studio $32,400, 14 invoices',
      'Brightline Labs $30,150',
      'Orchard & Co $29,800',
      'Fernhill Press $27,300',
      'Tidewater Books $24,900',
    ],
  },
}

/** A features strip: plain band between hairlines, travelling right. */
export const Features: Story = {
  args: { direction: 'right', pauseControl: false },
}

/** Any node can replace the default slanted rule. */
export const CustomSeparator: Story = {
  args: {
    separator: '/',
    label: 'Office cities',
    items: [
      'Lisbon',
      'Tallinn',
      'Osaka',
      'Cape Town',
      'Valparaíso',
      'Rotterdam',
      'Hobart',
      'Reykjavík',
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
