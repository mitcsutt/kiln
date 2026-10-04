import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Media } from './Media'

const portrait = new URL('../Avatar/portrait.story.svg', import.meta.url).href

const meta = {
  title: 'UI/Display/Media',
  component: Media,
  args: {
    src: portrait,
    alt: 'Ada Okafor, smiling, outdoors',
    ratio: '4/3',
    fit: 'cover',
    radius: 'media',
    caption: 'Ada Okafor, cartographer, Lisbon',
  },
  render: (args) => (
    <Stack style={{ maxWidth: '22rem' }}>
      <Media {...args} />
    </Stack>
  ),
} satisfies Meta<typeof Media>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Ratios: Story = {
  render: (args) => (
    <Inline gap={4} align="start">
      {(['1/1', '4/3', '16/9', '3/4'] as const).map((ratio) => (
        <Stack key={ratio} style={{ width: '9rem' }}>
          <Media {...args} ratio={ratio} caption={ratio} />
        </Stack>
      ))}
    </Inline>
  ),
}

/** A failed image keeps its frame and its accessible name. */
export const Fallback: Story = {
  args: {
    src: '/missing/receipt-hardware.jpg',
    alt: 'Receipt from Hardware Barn, 14 September',
    caption: 'Receipt · Hardware Barn · $142.80',
    fallback: 'Receipt image unavailable',
  },
}
