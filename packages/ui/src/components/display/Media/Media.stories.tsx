import type { Meta, StoryObj } from '@storybook/react-vite'
import { Grid, Heading, Inline, Media, Stack, Text } from '@mitcsutt/kiln-ui'
import { expect, waitFor } from 'storybook/test'
import { must } from '#test/must'

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

/**
 * `size` gives a small image a fixed height so it sits inline beside text, like a flag by a
 * place name. The width follows `ratio`: `xs`, `sm`, `md` and `lg` suit lists, rows and
 * scoreboards, and `xl` a page header.
 */
export const Sizes: Story = {
  tags: ['docs'],
  render: function Sizes() {
    const stops = [
      { name: 'Kelso Bay', flag: '/images/flag-kelso-bay.svg' },
      { name: 'North Point', flag: '/images/flag-north-point.svg' },
      { name: 'Harbour Square', flag: '/images/flag-harbour-square.svg' },
    ]
    return (
      <Stack gap={5}>
        <Inline gap={4} align="center">
          <Media size="xl" ratio="3/2" src="/images/flag-kelso-bay.svg" alt="Kelso Bay flag" />
          <Heading level={2}>Kelso Bay</Heading>
        </Inline>
        {(['lg', 'md', 'sm', 'xs'] as const).map((size) => (
          <Inline key={size} gap={4} align="center">
            {stops.map((stop) => (
              <Inline key={stop.name} gap={2} align="center">
                <Media size={size} ratio="3/2" src={stop.flag} alt="" />
                <Text>{stop.name}</Text>
              </Inline>
            ))}
          </Inline>
        ))}
      </Stack>
    )
  },
}

/**
 * `dimmed` fades an image toward grey, still recognisable, for something out of play.
 * Pair it with a muted `List.Item` or `Table.Row`.
 */
export const Dimmed: Story = {
  tags: ['docs'],
  render: function Dimmed() {
    return (
      <Inline gap={4} align="center">
        <Inline gap={2} align="center">
          <Media size="md" ratio="3/2" src="/images/flag-kelso-bay.svg" alt="" />
          <Text>Kelso Bay</Text>
        </Inline>
        <Inline gap={2} align="center">
          <Media size="md" ratio="3/2" src="/images/flag-north-point.svg" alt="" dimmed />
          <Text tone="muted">North Point</Text>
        </Inline>
      </Inline>
    )
  },
}

const flagSvg =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="20"><rect width="30" height="20" fill="#2f5d8a"/></svg>',
  )

/**
 * Sized thumbnails beside text: one at its own ratio, one framed at 3/2, and two that fail and
 * keep their box (an empty frame, square when the ratio is the image's own).
 */
export const InlineThumbnails: Story = {
  render: () => (
    <Inline gap={3} align="center">
      <Media size="md" src={flagSvg} alt="" data-testid="own-ratio" />
      <Media size="md" ratio="3/2" src={flagSvg} alt="" data-testid="framed" />
      <Media
        size="md"
        ratio="3/2"
        src="/missing/flag.svg"
        alt="North Point flag"
        data-testid="failed-framed"
      />
      <Media size="md" src="/missing/logo.svg" alt="Ferry company logo" data-testid="failed-own" />
      <Text>North Point</Text>
    </Inline>
  ),
  play: async ({ canvas }) => {
    const box = (id: string) => {
      const frame = canvas.getByTestId(id).firstElementChild
      const rect = must(frame, `${id}'s frame`).getBoundingClientRect()
      return { ratio: rect.width / rect.height, height: rect.height }
    }
    await waitFor(() => expect(canvas.getByTestId('failed-own')).toHaveAttribute('data-failed'))
    await waitFor(() =>
      expect(canvas.getByTestId('own-ratio').querySelector('img')?.naturalWidth).toBeGreaterThan(0),
    )
    const heights = ['own-ratio', 'framed', 'failed-framed', 'failed-own'].map(
      (id) => box(id).height,
    )
    // One fixed height for every state, well short of filling the row.
    await expect(new Set(heights.map(Math.round)).size).toBe(1)
    await expect(heights[0]).toBeLessThan(40)
    await expect(box('own-ratio').ratio).toBeCloseTo(1.5, 1)
    await expect(box('framed').ratio).toBeCloseTo(1.5, 1)
    await expect(box('failed-framed').ratio).toBeCloseTo(1.5, 1)
    await expect(box('failed-own').ratio).toBeCloseTo(1, 1)
  },
}
