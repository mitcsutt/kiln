import type { Primitive } from '#kit/contracts'

/**
 * Types a demo value as any primitive (or empty), the widest value an option field binds,
 * so one story form can show string, number and boolean options.
 */
export function primitive(value: Primitive | null): Primitive | null {
  return value
}
