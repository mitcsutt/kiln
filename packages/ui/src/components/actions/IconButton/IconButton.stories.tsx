import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Button,
  CloseIcon,
  CopyIcon,
  IconButton,
  Inline,
  MenuIcon,
  MoreIcon,
  PlusIcon,
  SearchIcon,
  Stack,
} from '@mitcsutt/kiln-ui'
import { ArrowUpRightIcon } from '#icons'

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

/**
 * It takes the same `variant`, `tone`, `size`, `loading` and `asChild` props as `Button`. Ghost
 * and neutral are the defaults, for the everyday toolbar.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Inline gap={2}>
        <IconButton label="Search stops" icon={<SearchIcon />} />
        <IconButton label="Copy share link" icon={<CopyIcon />} />
        <IconButton label="More route actions" icon={<MoreIcon />} />
        <IconButton label="Add a stop" icon={<PlusIcon />} variant="solid" tone="accent" />
      </Inline>
    )
  },
}

/**
 * `shape="auto"` follows the theme's action radius, so it's a pill in Monograph and a square in
 * Paper. `round` and `square` pin the shape.
 */
export const ShapesAndSizes: Story = {
  tags: ['docs'],
  render: function ShapesAndSizes() {
    return (
      <Stack gap={4}>
        <Inline gap={3}>
          <IconButton size="sm" variant="outline" label="Close" icon={<CloseIcon />} />
          <IconButton size="md" variant="outline" label="Close" icon={<CloseIcon />} />
          <IconButton size="lg" variant="outline" label="Close" icon={<CloseIcon />} />
        </Inline>
        <Inline gap={3}>
          <IconButton variant="outline" shape="auto" label="Open menu" icon={<MenuIcon />} />
          <IconButton variant="outline" shape="round" label="Open menu" icon={<MenuIcon />} />
          <IconButton variant="outline" shape="square" label="Open menu" icon={<MenuIcon />} />
        </Inline>
      </Stack>
    )
  },
}

/**
 * An `IconButton` matches a `Button` of the same size, so a "more actions" button can sit beside
 * the primary action. `showTitle` adds a native tooltip with the label, for pointer users who want
 * to check before pressing.
 */
export const BesideButton: Story = {
  name: 'Beside a button',
  tags: ['docs'],
  render: function BesideButton() {
    return (
      <Inline gap={2}>
        <Button>Publish timetable</Button>
        <IconButton
          variant="outline"
          label="More timetable actions"
          icon={<MoreIcon />}
          showTitle
        />
      </Inline>
    )
  },
}
