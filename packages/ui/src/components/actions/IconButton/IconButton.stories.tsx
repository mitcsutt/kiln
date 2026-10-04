import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ArrowUpRightIcon,
  CloseIcon,
  CopyIcon,
  MenuIcon,
  MoreIcon,
  PlusIcon,
  SearchIcon,
} from '#icons'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Button } from '#components/actions/Button'
import { IconButton } from './IconButton'

const meta = {
  title: 'UI/Actions/IconButton',
  component: IconButton,
  args: {
    label: 'Copy link',
    icon: <CopyIcon />,
    variant: 'ghost',
    tone: 'neutral',
    size: 'md',
    shape: 'auto',
  },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Same variants and tones as Button. Ghost-neutral is the everyday toolbar default. */
export const Variants: Story = {
  render: () => (
    <Stack gap={4}>
      {(['accent', 'neutral', 'critical'] as const).map((tone) => (
        <Inline key={tone} gap={3}>
          <IconButton tone={tone} variant="solid" label="New project" icon={<PlusIcon />} />
          <IconButton tone={tone} variant="outline" label="Search invoices" icon={<SearchIcon />} />
          <IconButton tone={tone} variant="ghost" label="More options" icon={<MoreIcon />} />
        </Inline>
      ))}
    </Stack>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Inline gap={3}>
      <IconButton size="sm" variant="outline" label="Close" icon={<CloseIcon />} />
      <IconButton size="md" variant="outline" label="Close" icon={<CloseIcon />} />
      <IconButton size="lg" variant="outline" label="Close" icon={<CloseIcon />} />
    </Inline>
  ),
}

/** `auto` follows the theme's action radius; `round` and `square` pin the shape. */
export const Shapes: Story = {
  render: () => (
    <Inline gap={3}>
      <IconButton variant="outline" shape="auto" label="Open menu" icon={<MenuIcon />} />
      <IconButton variant="outline" shape="round" label="Open menu" icon={<MenuIcon />} />
      <IconButton variant="outline" shape="square" label="Open menu" icon={<MenuIcon />} />
    </Inline>
  ),
}

/** Sits beside a Button of the same size without a height mismatch. */
export const BesideButton: Story = {
  render: () => (
    <Inline gap={2}>
      <Button>Save changes</Button>
      <IconButton variant="outline" label="More invoice actions" icon={<MoreIcon />} showTitle />
    </Inline>
  ),
}

export const States: Story = {
  render: () => (
    <Inline gap={3}>
      <IconButton
        variant="solid"
        tone="accent"
        loading
        label="Refreshing invoices"
        icon={<PlusIcon />}
      />
      <IconButton variant="outline" disabled label="Copy link" icon={<CopyIcon />} />
      <IconButton asChild variant="outline" label="Source on GitHub" icon={<ArrowUpRightIcon />}>
        <a href="https://github.com/mitcsutt/kiln" aria-label="Source on GitHub" />
      </IconButton>
    </Inline>
  ),
}
