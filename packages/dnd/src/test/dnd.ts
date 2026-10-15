import { screen } from '@testing-library/react'

/** The text of the scope's live region (there's one per `Dnd`; pass `index` for another). */
export function announcement(index = 0): string {
  const regions = document.querySelectorAll('[data-kiln-dnd-announcer]')
  return (regions[index]?.textContent ?? '').replace(/\u00A0/g, '').trim()
}

/** A node a test needs to exist. */
export function must<T>(value: T | null | undefined, what = 'node'): T {
  if (value === null || value === undefined) throw new Error(`Expected ${what} to exist`)
  return value
}

/** The visible text of each list item, in order. */
export const itemTexts = (list: HTMLElement): string[] =>
  [...list.querySelectorAll(':scope > li')].map((li) => li.textContent.trim())

export { screen }
