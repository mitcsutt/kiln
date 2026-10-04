import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import styles from './Foundations.module.css'

const meta = {
  title: 'UI/Foundations/Tokens',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const Swatch = ({ token }: { token: string }) => (
  <div className={styles.swatch}>
    <div className={styles.chip} style={{ background: `var(${token})` }} />
    <span className={styles.tokenName}>{token}</span>
  </div>
)

const groups: Record<string, string[]> = {
  Surfaces: [
    '--color-canvas',
    '--color-surface',
    '--color-surface-sunken',
    '--color-surface-raised',
    '--color-surface-inverse',
  ],
  Ink: [
    '--color-ink',
    '--color-ink-muted',
    '--color-ink-subtle',
    '--color-ink-inverse',
    '--color-line',
    '--color-line-strong',
  ],
  'Accent & highlight': [
    '--color-accent',
    '--color-accent-hover',
    '--color-accent-text',
    '--color-accent-soft',
    '--color-highlight',
    '--color-selection',
  ],
  Tones: [
    '--tone-positive',
    '--tone-positive-soft',
    '--tone-caution',
    '--tone-caution-soft',
    '--tone-critical',
    '--tone-critical-soft',
    '--tone-info',
    '--tone-info-soft',
  ],
  Categorical: Array.from({ length: 8 }, (_, i) => `--color-cat-${String(i + 1)}`),
}

/** Every semantic colour of the selected theme. Flip Mode to see the dark remap. */
export const Colour: Story = {
  render: () => (
    <Stack gap={7}>
      {Object.entries(groups).map(([name, tokens]) => (
        <Stack key={name} gap={4}>
          <h2 className={styles.groupTitle}>{name}</h2>
          <div className={styles.swatchGrid}>
            {tokens.map((t) => (
              <Swatch key={t} token={t} />
            ))}
          </div>
        </Stack>
      ))}
    </Stack>
  ),
}

const typeSteps = [
  'display-lg',
  'display-md',
  'display-sm',
  '3xl',
  '2xl',
  'xl',
  'lg',
  'md',
  'sm',
  'xs',
  '2xs',
] as const

/** The modular scale (`--type-base × --type-ratio^n`) and the theme's type roles. */
export const Type: Story = {
  render: () => (
    <Stack gap={8}>
      <Stack gap={0}>
        {typeSteps.map((step) => (
          <div key={step} className={styles.row}>
            <span className={styles.tokenName}>--text-{step}</span>
            <span
              className={step.startsWith('display') ? styles.display : styles.heading}
              style={{ fontSize: `var(--text-${step})` }}
            >
              {step.startsWith('display') ? 'Group B, decided' : 'September spending came in under'}
            </span>
          </div>
        ))}
      </Stack>
      <Stack gap={4}>
        <h2 className={styles.groupTitle}>Figures</h2>
        <div className={styles.numeric} style={{ fontSize: 'var(--text-2xl)' }}>
          $4,812.40 · 3–1 · 17 pts · 28/09/2026
        </div>
      </Stack>
      <Stack gap={4}>
        <h2 className={styles.groupTitle}>Prose</h2>
        <p className={styles.prose}>
          Most of the work is deciding what not to build. The rest is making the thing you did build
          disappear into the task — fast to load, obvious to use, and quiet enough that nobody
          thinks about the software at all.
        </p>
      </Stack>
    </Stack>
  ),
}

/** The non-linear space scale, multiplied by the theme's density. */
export const Space: Story = {
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

const radii = ['action', 'field', 'surface', 'media', 'chip', 'avatar'] as const
const depths = ['--shadow-surface', '--shadow-float', '--shadow-overlay'] as const

/** Radii are roles, not a global roundness. Depth: hairlines for static, shadows only for floating. */
export const ShapeAndDepth: Story = {
  render: () => (
    <Stack gap={8}>
      <div className={styles.shapeGrid}>
        {radii.map((r) => (
          <div key={r} className={styles.shape} style={{ borderRadius: `var(--radius-${r})` }}>
            --radius-{r}
          </div>
        ))}
      </div>
      <div className={styles.shapeGrid}>
        {depths.map((d) => (
          <div
            key={d}
            className={styles.shape}
            style={{ boxShadow: `var(${d})`, borderRadius: 'var(--radius-surface)' }}
          >
            {d}
          </div>
        ))}
      </div>
    </Stack>
  ),
}
