import { pickErrors } from '#core/binding/errors'
import {
  getFormRuntime,
  isInactive,
  toFormApi,
  type AnyKitForm,
  type FieldRegistration,
} from '#core/runtime/formRuntime'
import type { ScopeHandle } from '#core/scope/FieldScope'

const FOCUSABLE =
  '[tabindex]:not([tabindex="-1"]), input:not([type="hidden"]), button, select, textarea, [role=combobox], a[href]'

/** Resolves after the next animation frame (React has committed by then). */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function')
      requestAnimationFrame(() => {
        resolve()
      })
    else setTimeout(resolve, 16)
  })
}

function isDisabled(element: HTMLElement): boolean {
  return (element as HTMLInputElement).disabled || element.getAttribute('aria-hidden') === 'true'
}

/** The element itself if focusable, else its first focusable descendant. */
export function focusTarget(element: HTMLElement): HTMLElement | null {
  if (element.matches(FOCUSABLE) && !isDisabled(element)) return element
  for (const candidate of element.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (!isDisabled(candidate)) return candidate
  }
  return null
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

async function revealAndFocus(entry: FieldRegistration): Promise<boolean> {
  for (const scope of entry.scopes) scope.reveal?.()
  if (entry.scopes.some((scope) => scope.reveal)) await nextFrame()
  const element = entry.element()
  if (!element) return false
  const target = focusTarget(element)
  if (!target) return false
  target.focus({ preventScroll: true })
  if (typeof target.scrollIntoView === 'function') {
    const reduced = prefersReducedMotion()
    target.scrollIntoView({ block: reduced ? 'nearest' : 'center', behavior: 'auto' })
  }
  return target.ownerDocument.activeElement === target
}

/** Reveals the field's tab/accordion/step chain, then focuses its control (§5.6). */
export async function focusField(form: AnyKitForm, name: string): Promise<boolean> {
  const entry = getFormRuntime(form).fields.get(name)
  if (!entry) return false
  return revealAndFocus(entry)
}

/** Sorts entries by the DOM order of their elements; unmounted elements last. */
export function sortByDomOrder<T extends { element(): HTMLElement | null }>(
  entries: readonly T[],
): T[] {
  return [...entries].sort((a, b) => {
    const ea = a.element()
    const eb = b.element()
    if (!ea || !eb) return ea ? -1 : eb ? 1 : 0
    if (ea === eb) return 0
    return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  })
}

/** Registered, active fields that currently have an error, in DOM order (optionally within a scope). */
export function invalidFields(
  target: AnyKitForm,
  within?: ScopeHandle,
): [string, FieldRegistration][] {
  const form = toFormApi(target)
  const runtime = getFormRuntime(form)
  const scoped = within ? new Set(within.names()) : null
  const entries: (FieldRegistration & { name: string })[] = []
  for (const [name, entry] of runtime.fields) {
    if (scoped && !scoped.has(name)) continue
    if (isInactive(runtime, name)) continue
    const meta = form.getFieldMeta(name)
    if (!meta || pickErrors(meta.errorMap as Record<string, unknown>).length === 0) continue
    entries.push({ ...entry, name })
  }
  return sortByDomOrder(entries).map((entry) => [entry.name, entry])
}

/**
 * After a frame (so `aria-invalid` is committed), focuses the first invalid field in DOM order,
 * revealing its tab/accordion/step first. Resolves `true` when something got focus.
 */
export async function focusFirstInvalid(form: AnyKitForm, within?: ScopeHandle): Promise<boolean> {
  await nextFrame()
  const first = invalidFields(form, within)[0]
  if (!first) return false
  return revealAndFocus(first[1])
}

/** Applies the form's `focusOnInvalid` policy after an invalid submit. */
export async function focusOnInvalidSubmit(form: AnyKitForm): Promise<boolean> {
  const runtime = getFormRuntime(form)
  const policy = runtime.options.focusOnInvalid
  if (policy === false) return false
  const summary = runtime.summary
  if ((policy === 'auto' || policy === 'summary') && summary?.mounted) {
    await nextFrame()
    summary.focus()
    return true
  }
  if (policy === 'summary') return false
  return focusFirstInvalid(form)
}
