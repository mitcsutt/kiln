import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Heading } from '#components/typography/Heading'
import styles from './Foundations.module.css'

const meta = {
  title: 'UI/Foundations/Colour',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Swatches({ groups }: { groups: Record<string, readonly string[]> }) {
  return (
    <Stack gap={7}>
      {Object.entries(groups).map(([name, tokens]) => (
        <Stack key={name} gap={4}>
          <Heading level={2} size="md">
            {name}
          </Heading>
          <div className={styles.swatchGrid}>
            {tokens.map((token) => (
              <div key={token} className={styles.swatch}>
                <div className={styles.chip} style={{ background: `var(${token})` }} />
                <span className={styles.tokenName}>{token}</span>
              </div>
            ))}
          </div>
        </Stack>
      ))}
    </Stack>
  )
}

/** Surfaces, ink and lines: the neutral roles every screen is built from. Flip Mode to see the dark pairs. */
export const Neutrals: Story = {
  render: () => (
    <Swatches
      groups={{
        Surfaces: [
          '--color-canvas',
          '--color-surface',
          '--color-surface-sunken',
          '--color-surface-raised',
          '--color-surface-inverse',
        ],
        Ink: ['--color-ink', '--color-ink-muted', '--color-ink-subtle', '--color-ink-inverse'],
        Lines: ['--color-line', '--color-line-strong', '--color-line-control'],
      }}
    />
  ),
}

/** One accent per theme, plus the highlight, focus, selection and scrim roles. */
export const Accent: Story = {
  render: () => (
    <Swatches
      groups={{
        Accent: [
          '--color-accent',
          '--color-accent-hover',
          '--color-accent-ink',
          '--color-accent-text',
          '--color-accent-soft',
        ],
        'Highlight and focus': [
          '--color-highlight',
          '--color-highlight-ink',
          '--color-focus',
          '--color-selection',
          '--color-scrim',
        ],
      }}
    />
  ),
}

const tones = ['positive', 'caution', 'critical', 'info'] as const

/** Status tones. Each has a fill, a soft fill, accessible text, and ink to set on the fill. */
export const Tones: Story = {
  render: () => (
    <Swatches
      groups={Object.fromEntries(
        tones.map((tone) => [
          tone.charAt(0).toUpperCase() + tone.slice(1),
          [`--tone-${tone}`, `--tone-${tone}-soft`, `--tone-${tone}-text`, `--tone-${tone}-ink`],
        ]),
      )}
    />
  ),
}

/** Eight categorical colours for charts and tags, and one ink that reads on all of them. */
export const Categorical: Story = {
  render: () => (
    <Swatches
      groups={{
        Categorical: [
          ...Array.from({ length: 8 }, (_, i) => `--color-cat-${String(i + 1)}`),
          '--color-cat-ink',
        ],
      }}
    />
  ),
}

/** Ramps for amounts: the sequential ramp runs least to most, away from the page; the diverging ramp steps out from a neutral midpoint. Categorical colours mark who, ramps mark how much. */
export const Ramps: Story = {
  render: () => (
    <Swatches
      groups={{
        Sequential: Array.from({ length: 7 }, (_, i) => `--color-seq-${String(i + 1)}`),
        Diverging: [
          '--color-div-neg-3',
          '--color-div-neg-2',
          '--color-div-neg-1',
          '--color-div-mid',
          '--color-div-pos-1',
          '--color-div-pos-2',
          '--color-div-pos-3',
        ],
      }}
    />
  ),
}

/** Chart chrome and the categorical strokes: the line or outline variant of each categorical colour, at 3:1 on the page. */
export const ChartChrome: Story = {
  name: 'Chart chrome',
  render: () => (
    <Swatches
      groups={{
        'Categorical strokes': Array.from(
          { length: 8 },
          (_, i) => `--color-cat-${String(i + 1)}-stroke`,
        ),
        Chrome: [
          '--chart-grid',
          '--chart-axis',
          '--chart-label',
          '--chart-tooltip-surface',
          '--chart-tooltip-border',
          '--chart-tooltip-ink',
          '--chart-focus',
        ],
      }}
    />
  ),
}
