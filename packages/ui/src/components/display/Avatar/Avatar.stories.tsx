import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, avatarColor, getInitials, Inline, Stack, Text } from '@mitcsutt/kiln-ui'

const portrait = new URL('./portrait.story.svg', import.meta.url).href

const meta = {
  title: 'UI/Display/Avatar',
  component: Avatar,
  args: { name: 'Ada Okafor', size: 'lg', ring: false },
  argTypes: { color: { control: 'select', options: [undefined, 1, 2, 3, 4, 5, 6, 7, 8] } },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const MEMBERS = [
  'Noor Nguyen',
  'Kofi Grant',
  'Ada Okafor',
  'Ingrid Tran',
  'Mei Walker',
  'Theo Oduya',
  'Amara Raman',
  'Diego Kelly',
]

/** Initials on a colour derived from the name — the same person is the same colour everywhere. */
export const Members: Story = {
  render: () => (
    <Inline gap={3}>
      {MEMBERS.map((n) => (
        <Avatar key={n} name={n} />
      ))}
    </Inline>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={4}>
      <Inline gap={3} align="end">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Avatar key={size} name="Ingrid Tran" size={size} />
        ))}
      </Inline>
      <Inline gap={3} align="end">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Avatar key={size} name="Ada Okafor" src={portrait} size={size} />
        ))}
      </Inline>
    </Stack>
  ),
}

/** The ring marks "you". A broken image falls back to initials. */
export const RingAndFallback: Story = {
  render: () => (
    <Inline gap={5}>
      <Avatar name="Ada Okafor" src={portrait} size="xl" ring alt="Ada Okafor (you)" />
      <Avatar name="Kofi Grant" size="xl" ring />
      <Avatar name="Noor Nguyen" src="/missing/noor.jpg" size="xl" />
    </Inline>
  ),
}

/** `initials` overrides the derived letters — three-letter codes for companies. Three letters are set smaller. */
export const CompanyCodes: Story = {
  render: () => (
    <Stack gap={4}>
      <Inline gap={3} align="end">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Avatar key={size} name="Northwind Studio" initials="NWS" color={2} size={size} />
        ))}
      </Inline>
      <Inline gap={3}>
        {[
          ['Northwind Studio', 'NWS'],
          ['Brightline Labs', 'BRL'],
          ['Orchard & Co', 'ORC'],
          ['Fernhill Press', 'FHP'],
          ['Tidewater Books', 'TWB'],
        ].map(([name, code]) => (
          <Avatar key={code} name={name ?? ''} initials={code} />
        ))}
      </Inline>
    </Stack>
  ),
}

/**
 * `name` is required: it's the accessible name and the source of the initials and colour. `ring`
 * adds a canvas-coloured ring, for avatars that overlap or sit on images.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Inline gap={4}>
        <Avatar name="Ines Varga" size="xl" src="/images/portrait.svg" alt="Ines Varga" />
        <Avatar name="Ines Varga" size="lg" />
        <Avatar name="Tomasz Okoro" />
        <Avatar name="Priya Halvorsen" size="sm" ring />
        <Avatar name="Bayline Ferries" initials="BF" size="xs" />
      </Inline>
    )
  },
}

/**
 * `getInitials` and `avatarColor` are the functions Avatar uses, for when you need the same
 * initials or colour elsewhere, like a chart legend.
 */
export const Helpers: Story = {
  tags: ['docs'],
  render: function Helpers() {
    return (
      <Stack gap={2}>
        <Text>getInitials(&apos;Priya Halvorsen&apos;) is {getInitials('Priya Halvorsen')}</Text>
        <Text>avatarColor(&apos;Priya Halvorsen&apos;) is {avatarColor('Priya Halvorsen')}</Text>
      </Stack>
    )
  },
}
