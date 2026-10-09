'use client'

import { SegmentedControl } from '@mitcsutt/kiln-ui'
import { useSyncExternalStore, type ReactNode } from 'react'
import {
  VARIANT_AXES,
  variantLabel,
  variantOf,
  variantValues,
  type VariantAxis,
} from '@/lib/variants'
import styles from './Variant.module.css'

/** Where the docs remember each axis's choice, like the theme: one key per axis. */
const storageKey = (axis: VariantAxis) => `kiln-docs-variant-${axis}`

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function stored(axis: VariantAxis): string {
  const [fallback = ''] = variantValues(axis)
  try {
    const value = localStorage.getItem(storageKey(axis))
    return value !== null && variantValues(axis).includes(value) ? value : fallback
  } catch {
    return fallback
  }
}

function choose(axis: VariantAxis, value: string) {
  try {
    localStorage.setItem(storageKey(axis), value)
  } catch {
    // Storage can be blocked; the choice then lasts until the page reloads.
  }
  for (const listener of listeners) listener()
}

/**
 * Stack-specific content (ADR 0038): `<Variant router="next">…</Variant>`. Consecutive blocks of
 * one axis read as one switch: only the chosen value's block shows, with the switch above it. The
 * choice is kept in the browser, so every block on every page follows it. The server renders the
 * axis's first value, and a stored choice takes over after hydration.
 */
export function Variant({ children, ...props }: { children: ReactNode } & Record<string, unknown>) {
  const { axis, value } = variantOf(props)
  const [fallback = ''] = variantValues(axis)
  const selected = useSyncExternalStore(
    subscribe,
    () => stored(axis),
    () => fallback,
  )
  return (
    <div
      className={styles.variant}
      hidden={selected !== value}
      data-docs-variant={`${axis}:${value}`}
    >
      <SegmentedControl
        aria-label={VARIANT_AXES[axis].label}
        size="sm"
        value={selected}
        onValueChange={(next) => {
          choose(axis, next)
        }}
        options={variantValues(axis).map((option) => ({
          value: option,
          label: variantLabel({ axis, value: option }),
        }))}
      />
      <div className={styles.body}>{children}</div>
    </div>
  )
}
