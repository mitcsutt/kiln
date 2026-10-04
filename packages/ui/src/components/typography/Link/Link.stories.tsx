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
