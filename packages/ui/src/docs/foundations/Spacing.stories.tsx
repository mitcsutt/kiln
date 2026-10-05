import type { Meta, StoryObj } from '@storybook/react-vite'
import { Box, Button, Grid, Inline, Stack, Text, TextField } from '@mitcsutt/kiln-ui'
import styles from './Foundations.module.css'

const meta = {
  title: 'UI/Foundations/Spacing',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The non-linear space scale, multiplied by the theme's density. Props take the step: `gap={5}`. */
export const Scale: Story = {
  render: () => (
    <Stack gap={0}>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
        <div key={n} className={styles.row}>
          <span className={styles.tokenName}>--space-{n}</span>
          <div className={styles.bar} style={{ inlineSize: `var(--space-${String(n)})` }} />
        </div>
      ))}
    </Stack>
  ),
}

/** Control heights, also scaled by density, so a row of mixed controls lines up. */
export const Controls: Story = {
  render: () => (
    <Stack gap={0}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className={styles.row}>
          <span className={styles.tokenName}>--control-{size}</span>
          <div className={styles.bar} style={{ blockSize: `var(--control-${size})` }} />
        </div>
      ))}
    </Stack>
  ),
}

/** Content widths, from a narrow form column to a wide dashboard. */
export const Widths: Story = {
  render: () => (
    <Stack gap={0}>
      {(['narrow', 'text', 'content', 'wide'] as const).map((width) => (
        <div key={width} className={styles.row}>
          <span className={styles.tokenName}>--width-{width}</span>
          <div className={styles.bar} style={{ inlineSize: `min(100%, var(--width-${width}))` }} />
        </div>
      ))}
    </Stack>
  ),
}

/**
 * `data-density` multiplies the theme's own density for a subtree: `compact` by 0.85,
 * `comfortable` by 1.15. Spacing, control heights and gaps all follow. Use it for a dense admin
 * table inside an otherwise roomy page.
 */
export const Density: Story = {
  tags: ['docs'],
  render: function Density() {
    return (
      <Inline gap={7} align="start">
        {(['compact', undefined, 'comfortable'] as const).map((density) => (
          <div key={density ?? 'default'} data-density={density}>
            <Stack gap={4}>
              <Text size="sm" tone="muted">
                {density ?? 'Theme default'}
              </Text>
              <TextField label="Berth" defaultValue="3" />
              <Button size="sm">Board now</Button>
            </Stack>
          </div>
        ))}
      </Inline>
    )
  },
}

const STOPS = ['Harbour', 'Northpoint', 'Kelso Bay', 'Ferry Lane', 'Old Quay', 'Marram Point']

/**
 * Layout props that make sense per breakpoint take either a value or a map of values, from `base`
 * up:
 *
 * ```ts
 * type Responsive<T> = T | Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl', T>>
 * ```
 *
 * Breakpoints are mobile-first viewport widths: `sm` 40em, `md` 48em, `lg` 64em, `xl` 80em.
 * Structural components also take `hideBelow` and `hideAbove`, so responsive visibility is a prop
 * too: `<NavLinks hideBelow="md">` beside `<BottomNav hideAbove="md">`.
 */
export const ResponsiveProps: Story = {
  tags: ['docs'],
  render: function ResponsiveProps() {
    return (
      <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 3, md: 5 }}>
        {STOPS.map((stop) => (
          <Box key={stop} padding={4} border radius="surface">
            <Text weight="medium">{stop}</Text>
          </Box>
        ))}
      </Grid>
    )
  },
}
