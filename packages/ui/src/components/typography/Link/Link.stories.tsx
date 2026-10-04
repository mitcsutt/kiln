import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { Text } from '#components/typography/Text'
import { Link } from './Link'

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
      The studio makes maps and signs for public places, and writes about{' '}
      <Link href="#wayfinding">wayfinding that survives a rebrand</Link>. The code for this
      component library is on{' '}
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
      <Link href="#a">Default — Publish fixtures</Link>
      <Link href="#b" tone="accent">
        Accent — Follow Hawks v Millpond live
      </Link>
      <Link href="#c" tone="muted">
        Muted — Edit budget categories
      </Link>
    </Stack>
  ),
}

/** `underline="hover"` for lists and nav, where position already says "link". */
export const UnderlineOnHover: Story = {
  render: () => (
    <Inline gap={5}>
      <Link href="#work" underline="hover">
        Work
      </Link>
      <Link href="#writing" underline="hover">
        Writing
      </Link>
      <Link href="#about" underline="hover">
        About
      </Link>
      <Link href="https://www.linkedin.com/" underline="hover" tone="muted" external>
        LinkedIn
      </Link>
    </Inline>
  ),
}
