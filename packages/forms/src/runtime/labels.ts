/** Text of a label-like element as the user reads it: `aria-hidden` marks (required stars, spinners) removed. */
export function visibleText(element: Element): string {
  const clone = element.cloneNode(true) as HTMLElement
  for (const hidden of clone.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return clone.textContent.replace(/\s+/g, ' ').trim()
}

/** The legend of a `<fieldset>` (its own, not a nested one's). */
function legendOf(fieldset: Element): Element | null {
  for (const child of fieldset.children) if (child.tagName === 'LEGEND') return child
  return null
}

/** The element's own name source: `aria-labelledby`, `${id}-label`, `label[for]` or `labels`. */
function ownLabel(control: HTMLElement): Element | null {
  const doc = control.ownerDocument
  const labelledBy = control.getAttribute('aria-labelledby')
  if (labelledBy) {
    const first = labelledBy
      .split(/\s+/)
      .map((ref) => doc.getElementById(ref))
      .find((el) => el !== null)
    if (first) return first
  }
  if (control.id) {
    const byId = doc.getElementById(`${control.id}-label`)
    if (byId) return byId
  }
  const labels = (control as HTMLInputElement).labels
  if (labels && labels.length > 0) return labels[0] ?? null
  if (control.id)
    return (
      [...doc.querySelectorAll('label')].find((element) => element.htmlFor === control.id) ?? null
    )
  return null
}

/**
 * Visible label text of a field (ErrorSummary links), read from the DOM so it is
 * whatever the user sees. Group fields are named by their `<fieldset>`'s legend:
 * - the field's root (the nearest ancestor-or-self carrying `data-field={name}`) is itself a
 *   fieldset (DateRange: the control is an inner "Start date" input) → that legend;
 * - the control has no name of its own (a radiogroup/group inside a Fieldset) → the nearest
 *   enclosing fieldset's legend;
 * - otherwise the control's own label. Falls back to `fallback` (the path).
 */
export function readFieldLabel(
  control: HTMLElement | null,
  name: string,
  fallback: string,
): string {
  if (!control) return fallback
  let root: HTMLElement | null = control
  while (root && root.getAttribute('data-field') !== name) root = root.parentElement
  const source =
    (root?.tagName === 'FIELDSET' ? legendOf(root) : null) ??
    ownLabel(control) ??
    (() => {
      const fieldset = control.closest('fieldset')
      return fieldset ? legendOf(fieldset) : null
    })()
  if (!source) return fallback
  const text = visibleText(source)
  return text === '' ? fallback : text
}

/** The visible text of the first `<legend>` inside `element` (a Repeater's group), or `fallback`. */
export function readLegend(element: HTMLElement | null, fallback: string): string {
  const legend = element?.querySelector('legend')
  if (!legend) return fallback
  const text = visibleText(legend)
  return text === '' ? fallback : text
}
