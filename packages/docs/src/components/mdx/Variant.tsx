'use client'

import { SegmentedControl } from '@mitcsutt/kiln-ui'
import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { variantStorageKey } from '../../storage.ts'
import { createVariants, type Variants } from '../../variants.ts'
import { useSiteConfig } from '../SiteConfig.tsx'
import styles from './Variant.module.css'

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function stored(variants: Variants, axis: string): string {
  const [fallback = ''] = variants.variantValues(axis)
  try {
    const value = localStorage.getItem(variantStorageKey(axis))
    return value !== null && variants.variantValues(axis).includes(value) ? value : fallback
  } catch {
    return fallback
  }
}

function choose(axis: string, value: string) {
  try {
    localStorage.setItem(variantStorageKey(axis), value)
  } catch {
    // Storage can be blocked; the choice then lasts until the page reloads.
  }
  for (const listener of listeners) listener()
}

/**
 * Stack-specific content (ADR 0038): `<Variant router="next">…</Variant>`. Consecutive blocks of
 * one axis read as one switch: only the chosen value's block shows, with the switch above it. The
 * choice is kept in the browser, so every block on every page follows it. The server renders the
 * axis's first value, and a stored choice takes over after hydration. The axes are the site's
 * `variants` config.
 */
export function Variant({ children, ...props }: { children: ReactNode } & Record<string, unknown>) {
  const config = useSiteConfig()
  const variants = useMemo(() => createVariants(config.variants), [config.variants])
  const { axis, value } = variants.variantOf(props)
  const [fallback = ''] = variants.variantValues(axis)
  const selected = useSyncExternalStore(
    subscribe,
    () => stored(variants, axis),
    () => fallback,
  )
  return (
    <div
      className={styles.variant}
      hidden={selected !== value}
      data-docs-variant={`${axis}:${value}`}
    >
      <SegmentedControl
        aria-label={variants.axisLabel(axis)}
        size="sm"
        value={selected}
        onValueChange={(next) => {
          choose(axis, next)
        }}
        options={variants.variantValues(axis).map((option) => ({
          value: option,
          label: variants.variantLabel({ axis, value: option }),
        }))}
      />
      <div className={styles.body}>{children}</div>
    </div>
  )
}
