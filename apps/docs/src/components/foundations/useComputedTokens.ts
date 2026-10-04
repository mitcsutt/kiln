'use client'

import { useTheme } from '@mitcsutt/kiln-ui'
import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Reads one resolved CSS property from every `[data-token]` element inside the returned
 * ref, keyed by the token, whenever the theme or mode changes. A custom property reads
 * back as its unresolved `calc()`, so specimens measure the property the token drives
 * (`width: var(--space-5)`) instead.
 */
export function useTokenReadout<T extends HTMLElement>(
  property: 'width' | 'fontSize' | 'borderRadius' | 'backgroundColor' | 'transitionDuration',
): [RefObject<T | null>, Record<string, string>] {
  const ref = useRef<T>(null)
  const { theme, resolvedMode } = useTheme()
  const [values, setValues] = useState<Record<string, string>>({})
  useEffect(() => {
    // After the frame, so a new data-theme on <html> has been applied.
    const frame = requestAnimationFrame(() => {
      const container = ref.current
      if (!container) return
      const next: Record<string, string> = {}
      for (const element of container.querySelectorAll<HTMLElement>('[data-token]')) {
        const token = element.dataset.token
        if (token) next[token] = getComputedStyle(element)[property]
      }
      setValues(next)
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [property, theme, resolvedMode])
  return [ref, values]
}

/** `23.9999px` → `24px`. */
export function roundPx(value: string | undefined): string {
  if (!value) return ''
  const px = /^(-?[\d.]+)px$/.exec(value)
  return px?.[1] ? `${String(Math.round(parseFloat(px[1]) * 10) / 10)}px` : value
}
