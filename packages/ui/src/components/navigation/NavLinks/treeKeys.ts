import type { KeyboardEvent } from 'react'

/** The links and group buttons a reader can reach now: shown, and not inside a closed group. */
function reachable(nav: HTMLElement): HTMLElement[] {
  return Array.from(nav.querySelectorAll<HTMLElement>('a[href], button')).filter(
    (element) =>
      !element.closest('[data-navlinks-panel][data-state="closed"]') &&
      !(element as HTMLButtonElement).disabled &&
      (!('checkVisibility' in element) || element.checkVisibility()),
  )
}

/** A group's own row: the button, or the link and its toggle. */
function rowOf(group: Element | null | undefined): HTMLElement | null {
  return (
    group?.querySelector<HTMLElement>(':scope > [data-navlinks-row], :scope > [aria-expanded]') ??
    null
  )
}

/** The element in a group's row that opens and closes it. */
function toggleOf(group: Element | null | undefined): HTMLElement | null {
  const row = rowOf(group)
  return row?.hasAttribute('aria-expanded')
    ? row
    : (row?.querySelector<HTMLElement>('[aria-expanded]') ?? null)
}

/**
 * Arrow keys for a vertical nav with groups, like a tree: Up and Down move between the links you
 * can see, Right opens a group (or steps into an open one), Left closes it (or steps out to its
 * parent), Home and End jump, and a letter jumps to the next link starting with it. Tab still
 * moves through every link, so nothing is lost for anyone who doesn't use them.
 */
export function onTreeKeyDown(event: KeyboardEvent<HTMLElement>) {
  const nav = event.currentTarget
  if (!nav.querySelector('[data-navlinks-group]')) return
  const items = reachable(nav)
  const current = event.target as HTMLElement
  const index = items.indexOf(current)
  if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return

  const focus = (element: HTMLElement | null | undefined) => {
    if (!element) return
    event.preventDefault()
    element.focus()
  }
  const group = current.closest('[data-navlinks-group]')
  const row = rowOf(group)
  const inRow = row?.contains(current) === true
  const toggle = inRow ? toggleOf(group) : null

  switch (event.key) {
    case 'ArrowDown':
      focus(items[index + 1])
      return
    case 'ArrowUp':
      focus(items[index - 1])
      return
    case 'Home':
      focus(items[0])
      return
    case 'End':
      focus(items.at(-1))
      return
    case 'ArrowRight':
      if (!toggle) return
      event.preventDefault()
      if (toggle.getAttribute('aria-expanded') === 'false') toggle.click()
      else
        focus(items.find((item, at) => at > index && group?.contains(item) && !row?.contains(item)))
      return
    case 'ArrowLeft': {
      if (toggle?.getAttribute('aria-expanded') === 'true') {
        event.preventDefault()
        toggle.click()
        return
      }
      const owner = inRow ? group?.parentElement?.closest('[data-navlinks-group]') : group
      const ownerRow = rowOf(owner)
      focus(ownerRow?.querySelector<HTMLElement>('a[href]') ?? ownerRow)
      return
    }
    default:
      if (event.key.length !== 1 || event.key === ' ') return
      {
        const key = event.key.toLowerCase()
        const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)]
        focus(ordered.find((item) => item.textContent.trim().toLowerCase().startsWith(key)))
      }
  }
}
