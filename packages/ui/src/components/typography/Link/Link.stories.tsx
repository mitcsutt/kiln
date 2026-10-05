import type { Meta, StoryObj } from '@storybook/react-vite'
import { Link, Stack, Text } from '@mitcsutt/kiln-ui'
import { Inline } from '#components/layout/Inline'

const meta = {
  title: 'UI/Typography/Link',
  component: Link,
  args: {
    children: 'Read the release notes',
    href: '#release-notes',
    tone: 'default',
    underline: 'always',
    external: false,
  },
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** In running text the underline carries the affordance; hover thickens it rather than recolouring. */
export const InText: Story = {
  render: () => (
    <Text size="lg" style={{ maxWidth: '38rem' }}>
      Brightline Labs builds invoicing tools for small teams, and writes about{' '}
      <Link href="#late-payments">getting paid on time without awkward emails</Link>. The code for
      this component library is on{' '}
      <Link href="https://github.com/mitcsutt/kiln" external>
        GitHub
      </Link>
      .
    </Text>
  ),
}

export const Tones: Story = {
  render: () => (
    <Stack gap={3}>
      <Link href="#a">Default — Send invoice</Link>
      <Link href="#b" tone="accent">
        Accent — Follow the release 2.4 deploy live
      </Link>
      <Link href="#c" tone="muted">
        Muted — Edit invoice templates
      </Link>
    </Stack>
  ),
}

/** `underline="hover"` for lists and nav, where position already says "link". */
export const UnderlineOnHover: Story = {
  render: () => (
    <Inline gap={5}>
      <Link href="#product" underline="hover">
        Product
      </Link>
      <Link href="#pricing" underline="hover">
        Pricing
      </Link>
      <Link href="#changelog" underline="hover">
        Changelog
      </Link>
      <Link href="https://github.com/mitcsutt/kiln" underline="hover" tone="muted" external>
        GitHub
      </Link>
    </Inline>
  ),
}

/**
 * `external` adds `target="_blank"`, `rel="noopener noreferrer"`, a small arrow, and a visually
 * hidden "(opens in new tab)" for screen readers. `underline="hover"` is for quiet links in dense
 * places like footers, where it's clear from context that they're links. With `asChild`, your
 * router's link renders with Link's styles:
 *
 * ```tsx
 * <Link asChild>
 *   <NextLink href="/fares">Fares and passes</NextLink>
 * </Link>
 * ```
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={3}>
        <Text>
          Read the <Link href="#accessibility">accessibility guide</Link> before you travel.
        </Text>
        <Text>
          Fares are set by the{' '}
          <Link href="https://example.com" external>
            regional transport board
          </Link>
          .
        </Text>
        <Text size="sm">
          <Link href="#terms" tone="muted" underline="hover">
            Terms of carriage
          </Link>
        </Text>
      </Stack>
    )
  },
}
