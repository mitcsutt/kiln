import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarGroup, Inline, Text } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const portrait = new URL('../Avatar/portrait.story.svg', import.meta.url).href
const MEMBERS = [
  'Noor Nguyen',
  'Kofi Grant',
  'Ingrid Tran',
  'Mei Walker',
  'Theo Oduya',
  'Amara Raman',
  'Diego Kelly',
]

const meta = {
  title: 'UI/Display/AvatarGroup',
  component: AvatarGroup,
  args: { max: 4, size: 'sm', 'aria-label': 'Members who reacted' },
  render: (args) => (
    <AvatarGroup {...args}>
      <Avatar name="Ada Okafor" src={portrait} />
      {MEMBERS.map((n) => (
        <Avatar key={n} name={n} />
      ))}
    </AvatarGroup>
  ),
} satisfies Meta<typeof AvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={4}>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <AvatarGroup key={size} {...args} size={size}>
          <Avatar name="Ada Okafor" src={portrait} />
          {MEMBERS.map((n) => (
            <Avatar key={n} name={n} />
          ))}
        </AvatarGroup>
      ))}
    </Stack>
  ),
}

const CREW = [
  'Ines Varga',
  'Tomasz Okoro',
  'Priya Halvorsen',
  'Joon Park',
  'Amara Lindqvist',
  'Felix Duarte',
]

/**
 * Six crew members past a `max` of four: the rest become a count.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Inline gap={3}>
        <AvatarGroup max={4} aria-label="Crew on the 07:10 sailing">
          {CREW.map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
        <Text size="sm" tone="muted">
          6 crew on the 07:10 sailing
        </Text>
      </Inline>
    )
  },
}
