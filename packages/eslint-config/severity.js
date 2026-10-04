/**
 * Raises every `warn` rule in a config to `error`.
 *
 * Kiln has no warning tier: a rule is either an error or off. Plugin presets
 * that ship some rules as warnings go through this so the whole config reads
 * the same way.
 *
 * @param {{ rules?: object }} config
 * @returns {import('eslint').Linter.Config}
 */
export function asErrors(config) {
  /** @type {import('eslint').Linter.RulesRecord} */
  const rules = {}
  /** @type {[string, unknown][]} */
  const entries = Object.entries(config.rules ?? {})
  for (const [name, entry] of entries) {
    rules[name] = promote(/** @type {import('eslint').Linter.RuleEntry} */ (entry))
  }
  // Plugin typings lag behind ESLint's own, so the config is retyped here.
  return /** @type {import('eslint').Linter.Config} */ ({ ...config, rules })
}

/**
 * @param {import('eslint').Linter.RuleEntry} entry
 * @returns {import('eslint').Linter.RuleEntry}
 */
function promote(entry) {
  if (Array.isArray(entry)) {
    /** @type {unknown[]} */
    const options = entry.slice(1)
    return isWarn(entry[0]) ? ['error', ...options] : entry
  }
  return isWarn(entry) ? 'error' : entry
}

/** @param {unknown} level */
function isWarn(level) {
  return level === 'warn' || level === 1
}
