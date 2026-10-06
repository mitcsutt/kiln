'use client'

import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import type { CSSProperties } from 'react'
import { roundPx, useTokenReadout } from './useComputedTokens'
import styles from './Specimens.module.css'

// Specimens set one token per element through `style`: that's the token being shown, not
// a styling choice, and it's the one place in the docs where inline styles are the point.

const COLOUR_GROUPS: Record<string, string[]> = {
  Surfaces: [
    '--color-canvas',
    '--color-surface',
    '--color-surface-sunken',
    '--color-surface-raised',
    '--color-surface-inverse',
  ],
  'Ink and lines': [
    '--color-ink',
    '--color-ink-muted',
    '--color-ink-subtle',
    '--color-ink-inverse',
    '--color-line',
    '--color-line-strong',
  ],
  'Accent and highlight': [
    '--color-accent',
    '--color-accent-hover',
    '--color-accent-ink',
    '--color-accent-text',
    '--color-accent-soft',
    '--color-highlight',
    '--color-highlight-ink',
    '--color-focus',
    '--color-selection',
  ],
  Tones: [
    '--tone-positive',
    '--tone-positive-soft',
    '--tone-positive-text',
    '--tone-caution',
    '--tone-caution-soft',
    '--tone-caution-text',
    '--tone-critical',
    '--tone-critical-soft',
    '--tone-critical-text',
    '--tone-info',
    '--tone-info-soft',
    '--tone-info-text',
  ],
  Categorical: Array.from({ length: 8 }, (_, index) => `--color-cat-${String(index + 1)}`),
}

/** Every semantic colour of the current theme and mode. */
export function ColourSwatches({ group }: { group?: keyof typeof COLOUR_GROUPS }) {
  const [ref, values] = useTokenReadout<HTMLDivElement>('backgroundColor')
  const groups = group ? { [group]: COLOUR_GROUPS[group] ?? [] } : COLOUR_GROUPS
  return (
    <div ref={ref} className={styles.specimen} data-kiln-component="specimen">
      <Stack gap={6}>
        {Object.entries(groups).map(([title, tokens]) => (
          <Stack key={title} gap={3}>
            {group ? null : (
              <Text as="p" weight="strong">
                {title}
              </Text>
            )}
            <div className={styles.swatches}>
              {tokens.map((token) => (
                <div key={token} className={styles.swatch}>
                  <div
                    className={styles.chip}
                    data-token={token}
                    style={{ backgroundColor: `var(${token})` }}
                  />
                  <Code>{token}</Code>
                  <Text as="span" size="xs" tone="muted" className={styles.value}>
                    {values[token]}
                  </Text>
                </div>
              ))}
            </div>
          </Stack>
        ))}
      </Stack>
    </div>
  )
}

const TEXT_STEPS = [
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

/** The type scale, set in the theme's own faces, with each step's size here and now. */
export function TypeScale() {
  const [ref, values] = useTokenReadout<HTMLDivElement>('fontSize')
  return (
    <div ref={ref} className={styles.specimen} data-kiln-component="specimen">
      <Stack gap={4}>
        {TEXT_STEPS.map((step) => {
          const token = `--text-${step}`
          const display = step.startsWith('display')
          return (
            <div key={step} className={styles.typeRow}>
              <Text as="span" size="xs" tone="muted" className={styles.typeMeta}>
                <Code>{token}</Code> {roundPx(values[token])}
              </Text>
              <span
                data-token={token}
                className={display ? styles.display : styles.text}
                style={{ fontSize: `var(${token})` }}
              >
                {display ? 'Harbour lights' : 'The night ferry leaves at 22:40'}
              </span>
            </div>
          )
        })}
      </Stack>
    </div>
  )
}

const SPACE_STEPS = Array.from({ length: 12 }, (_, index) => index + 1)

/** The space scale as bars, measured in the current theme (Ledger is denser). */
export function SpaceScale() {
  const [ref, values] = useTokenReadout<HTMLDivElement>('width')
  return (
    <div ref={ref} className={styles.specimen} data-kiln-component="specimen">
      <Stack gap={2}>
        {SPACE_STEPS.map((step) => {
          const token = `--space-${String(step)}`
          return (
            <div key={step} className={styles.spaceRow}>
              <Text as="span" size="sm" className={styles.spaceStep}>
                <Code>{`gap={${String(step)}}`}</Code>
              </Text>
              <span className={styles.bar} data-token={token} style={{ width: `var(${token})` }} />
              <Text as="span" size="xs" tone="muted">
                {roundPx(values[token])}
              </Text>
            </div>
          )
        })}
      </Stack>
    </div>
  )
}

const RADII = ['action', 'field', 'surface', 'media', 'chip', 'avatar'] as const

/** Radii are roles, not one global roundness. */
export function RadiusRoles() {
  const [ref, values] = useTokenReadout<HTMLDivElement>('borderRadius')
  return (
    <div ref={ref} className={styles.specimen} data-kiln-component="specimen">
      <div className={styles.radii}>
        {RADII.map((role) => {
          const token = `--radius-${role}`
          return (
            <Stack key={role} gap={2} align="start">
              <span
                className={styles.radius}
                data-token={token}
                style={{ borderRadius: `var(${token})` }}
              />
              <Code>{token}</Code>
              <Text as="span" size="xs" tone="muted">
                {roundPx(values[token])}
              </Text>
            </Stack>
          )
        })}
      </div>
    </div>
  )
}

const DEPTHS = [
  '--shadow-surface',
  '--shadow-active',
  '--shadow-float',
  '--shadow-overlay',
] as const

/** The four depths. Only floating layers get a soft shadow; Riso's misregistered offset sits on floating layers too, and Fiesta's offset is its legacy edge. */
export function DepthRoles() {
  return (
    <div className={styles.specimen} data-kiln-component="specimen">
      <div className={styles.depths}>
        {DEPTHS.map((token) => (
          <Stack key={token} gap={3} align="start">
            <span className={styles.depth} style={{ boxShadow: `var(${token})` }} />
            <Code>{token}</Code>
          </Stack>
        ))}
      </div>
    </div>
  )
}

const DURATIONS = ['--dur-1', '--dur-2', '--dur-3'] as const
const EASINGS = ['--ease-out', '--ease-in-out', '--ease-spring'] as const

/** Hover or focus a row to watch it travel with that duration and easing. */
export function MotionDemo() {
  const [ref, values] = useTokenReadout<HTMLDivElement>('transitionDuration')
  return (
    <div ref={ref} className={styles.specimen} data-kiln-component="specimen">
      <Stack gap={3}>
        {DURATIONS.flatMap((duration) =>
          EASINGS.map((easing) => (
            <button
              key={`${duration}${easing}`}
              type="button"
              className={styles.track}
              data-token={`${duration} ${easing}`}
              style={
                {
                  '--_duration': `var(${duration})`,
                  '--_easing': `var(${easing})`,
                } as CSSProperties
              }
            >
              <span className={styles.lane}>
                <span className={styles.puck} />
              </span>
              <Text as="span" size="xs">
                <Code>{duration}</Code> <Code>{easing}</Code>{' '}
                <Text as="span" size="xs" tone="muted">
                  {values[`${duration} ${easing}`]}
                </Text>
              </Text>
            </button>
          )),
        )}
      </Stack>
    </div>
  )
}
