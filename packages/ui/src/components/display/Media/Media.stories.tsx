import type { Meta, StoryObj } from '@storybook/react-vite'
import { Grid, Media } from '@mitcsutt/kiln-ui'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'

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
    caption: 'Ada Okafor, support lead, Lisbon',
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
    src: '/missing/billing-settings.png',
    alt: 'Billing settings with the Team plan selected',
    caption: 'Billing settings · Team plan',
    fallback: 'Screenshot unavailable',
  },
}

/**
 * `alt` is required. Describe what the image shows, or pass an empty string for a purely
 * decorative one. `fit` is `cover` or `contain`, `radius` is `media` (the default), `surface` or
 * `none`, and `fallback` replaces the failure state. `imgProps` reaches the `<img>` for anything
 * else, like `srcSet`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Grid columns={{ base: 1, sm: 2 }} gap={5}>
        <Media
          src="/images/harbour.svg"
          alt="The ferry at Harbour Square pier at dusk"
          ratio="16/9"
          caption="Harbour Square at dusk"
        />
        <Media
          src="/missing/route-map.png"
          alt="Route map of the coastal line"
          ratio="16/9"
          caption="When an image fails, the frame keeps its shape"
        />
      </Grid>
    )
  },
}
