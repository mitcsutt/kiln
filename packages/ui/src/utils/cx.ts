/**
 * Merges class names, filtering falsy values.
 * @example cx(styles.root, isActive && styles.active, className)
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
