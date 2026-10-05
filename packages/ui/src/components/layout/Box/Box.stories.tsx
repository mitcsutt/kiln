import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { Body, Figure, Label, Title } from '#components/layout/_story/StoryKit'
import { Box } from './Box'

const meta = {
  title: 'UI/Layout/Box',
  component: Box,
  args: { padding: 5, surface: 'sunken', radius: 'surface', border: false },
  argTypes: { as: { control: false } },
} satisfies Meta<typeof Box>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Box {...args}>
      <Stack gap={2}>
        <Label>Outstanding this month</Label>
        <Figure size="lg">$1,284.60</Figure>
        <Body size="sm" tone="muted">
          Across four open invoices. Two are due on Thursday.
        </Body>
      </Stack>
    </Box>
  ),
}

/**
 * Box is the escape hatch: a fill, a hairline or a radius — pick one edge treatment.
 * `inverse` re-points ink and line colours so its children stay legible.
 */
export const Surfaces: Story = {
  render: () => (
    <Stack gap={3}>
      {(['canvas', 'surface', 'sunken', 'raised', 'inverse'] as const).map((surface) => (
        <Box
          key={surface}
          surface={surface}
          padding={4}
          radius="surface"
          border={surface === 'canvas' || surface === 'surface'}
        >
          <Inline gap={4} justify="between">
            <Stack gap={1}>
              <Title level={3} size="md">
                {surface}
              </Title>
              <Body size="sm" tone="muted">
                Brightline Labs · 14 invoices
              </Body>
            </Stack>
            <Figure>$612.85</Figure>
          </Inline>
        </Box>
      ))}
    </Stack>
  ),
}

/** Asymmetric padding: the axis props override `padding` per axis and per breakpoint. */
export const AxisPadding: Story = {
  render: () => (
    <Box surface="sunken" radius="field" paddingY={3} paddingX={{ base: 4, md: 6 }}>
      <Body size="sm">Next invoice due: Thursday 2 October · $3,725.00</Body>
    </Box>
  ),
}
