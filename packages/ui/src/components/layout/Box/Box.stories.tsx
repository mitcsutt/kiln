import type { Meta, StoryObj } from '@storybook/react-vite'
import { Box, Stack, Text } from '@mitcsutt/kiln-ui'
import { Inline } from '#components/layout/Inline'
import { Body, Figure, Label, Title } from '#components/layout/_story/StoryKit'

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

/**
 * `surface="inverse"` flips the colour roles inside, like an inverse `Section`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={4}>
        <Box padding={{ base: 4, md: 5 }} surface="sunken" radius="surface">
          <Text>Sunken: a well for secondary content.</Text>
        </Box>
        <Box padding={5} border radius="surface">
          <Text>Bordered: a hairline frame.</Text>
        </Box>
        <Box padding={5} surface="inverse" radius="surface">
          <Text>Inverse: colour roles flip inside.</Text>
        </Box>
      </Stack>
    )
  },
}

/** Categorical surfaces: one person's or team's colour, with ink that stays legible on it. */
export const CategoricalSurfaces: Story = {
  render: () => (
    <Inline gap={3}>
      {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) => (
        <Box key={n} surface={`cat-${String(n)}` as `cat-${typeof n}`} padding={4} radius="field">
          <Text>Crew {n}</Text>
        </Box>
      ))}
    </Inline>
  ),
}
