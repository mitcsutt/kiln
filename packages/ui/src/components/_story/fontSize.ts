/** An element's computed font size, in px. */
export function fontSize(element: Element): number {
  return parseFloat(getComputedStyle(element).fontSize)
}

/** The size a theme value such as `var(--text-sm)` or `0.75rem` resolves to inside `scope`, in px. */
export function resolvedSize(scope: Element, value: string): number {
  const probe = document.createElement('span')
  probe.style.fontSize = value
  scope.append(probe)
  const size = fontSize(probe)
  probe.remove()
  return size
}
