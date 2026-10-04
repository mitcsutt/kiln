import { getRoles, within } from '@testing-library/react'

/** Roles without semantics of their own (wrappers) — left out of the comparison. */
const IGNORED_ROLES = new Set(['generic', 'presentation', 'none'])

const STATES = [
  'aria-invalid',
  'aria-required',
  'aria-disabled',
  'aria-readonly',
  'aria-checked',
  'aria-selected',
  'aria-expanded',
  'aria-current',
] as const

function describe(role: string, name: string, element: Element): string {
  const states: string[] = []
  for (const attribute of STATES) {
    const value = element.getAttribute(attribute)
    if (value !== null && value !== 'false') states.push(`${attribute.slice(5)}=${value}`)
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (element.required) states.push('required')
    if (element.disabled) states.push('disabled')
    if (element.readOnly) states.push('readonly')
    if (
      element instanceof HTMLInputElement &&
      (element.type === 'checkbox' || element.type === 'radio') &&
      element.checked
    )
      states.push('checked')
    states.push(`value=${JSON.stringify(element.value)}`)
  }
  if (element instanceof HTMLButtonElement && element.disabled) states.push('disabled')
  // Nameless containers (cells, terms, alerts) are identified by their text.
  const text = name === '' ? element.textContent.replace(/\s+/g, ' ').trim() : ''
  return `${role} "${name}"${text === '' ? '' : ` text="${text}"`}${states.length > 0 ? ` [${states.join(' ')}]` : ''}`
}

/**
 * The accessibility tree of `container` as `role "name" [states]` lines in DOM order (accessible
 * roles and names as testing-library computes them, ARIA / form states, the text of nameless
 * nodes), for render-equivalence tests (§10.11).
 */
export function a11yTree(container: HTMLElement): string[] {
  const entries: { element: Element; line: string }[] = []
  for (const role of Object.keys(getRoles(container))) {
    if (IGNORED_ROLES.has(role)) continue
    within(container).queryAllByRole(role, {
      name: (accessibleName, element) => {
        entries.push({ element, line: describe(role, accessibleName, element) })
        return true
      },
    })
  }
  entries.sort((a, b) => {
    if (a.element === b.element) return a.line.localeCompare(b.line)
    return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  })
  return entries.map((entry) => entry.line)
}
