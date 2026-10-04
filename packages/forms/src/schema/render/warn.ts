import { isDev } from '#core/env'

const warned = new Set<string>()

/** Logs a dev-only warning once per message (unknown keys in untrusted schemas, §10.6). */
export function warnOnce(message: string): void {
  if (!isDev() || warned.has(message)) return
  warned.add(message)
  console.warn(`[@mitcsutt/kiln-forms] ${message}`)
}

/** @internal Test helper: forget which warnings were shown. */
export function resetWarnings(): void {
  warned.clear()
}
