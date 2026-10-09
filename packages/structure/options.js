import path from 'node:path'

/**
 * Option validation for `kilnStructure()`. Everything here runs when the ESLint config loads,
 * so a bad option fails before any file is linted.
 */

/** Kinds every owner may hold. Their names are fixed (ADR 0037). */
export const OWNER_KINDS = /** @type {const} */ ([
  'components',
  'hooks',
  'stores',
  'utils',
  'constants',
  'types',
  'schemas',
])

/** A feature's public surface: its root folders of these kinds. */
export const PUBLIC_KINDS = /** @type {const} */ ([
  'components',
  'hooks',
  'stores',
  'data',
  'types',
  'constants',
  'schemas',
])

/** Folder names the structure already uses, which a kind, group or test kind can't take. */
const RESERVED = new Set([
  ...OWNER_KINDS,
  'pages',
  'data',
  'features',
  'app',
  'routes',
  'assets',
  'config',
  'public',
  '_shell',
])

const ROUTERS = ['tanstack', 'next']
const OPTION_KEYS = new Set([
  'features',
  'kinds',
  'groups',
  'testKind',
  'router',
  'ignores',
  'srcDir',
  'rootDir',
])
const KIND_NAME = /^[a-z][a-zA-Z0-9]*$/
const FEATURE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * @typedef {import('./types/eslint.d.ts').KilnStructureOptions} KilnStructureOptions
 *
 * @typedef {object} NormalizedOptions
 * @property {Record<string, string[]>} features
 * @property {string[]} kinds Every kind an owner may hold: the core kinds plus additions.
 * @property {Record<string, string[]>} groups
 * @property {string} testKind
 * @property {'tanstack' | 'next'} router
 * @property {{ naming: string[], boundaries: string[] }} ignores
 * @property {string} srcDir
 * @property {string} rootDir An absolute path.
 */

/**
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  throw new Error(`kilnStructure: ${message}`)
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {string[]}
 */
function stringList(value, label) {
  if (value === undefined) return []
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    fail(`${label} must be an array of strings.`)
  }
  return /** @type {string[]} */ (value)
}

/**
 * Throws when the declared feature graph has a cycle, names a feature it doesn't declare, or
 * isn't a `{ [feature]: string[] }` record. Edges aren't transitive: each feature lists only the
 * features it imports directly.
 *
 * @param {unknown} features
 * @returns {Record<string, string[]>}
 */
export function assertFeatureGraph(features) {
  if (!isRecord(features)) {
    fail('`features` is required: a record of each feature and the features it may import.')
  }
  const graph = /** @type {Record<string, string[]>} */ ({})
  for (const [feature, deps] of Object.entries(features)) {
    if (!FEATURE_NAME.test(feature)) {
      fail(`feature "${feature}" must be a kebab-case folder name.`)
    }
    const list = stringList(deps, `features.${feature}`)
    for (const dep of list) {
      if (!Object.hasOwn(features, dep)) {
        fail(`feature "${feature}" depends on "${dep}", which isn't declared in \`features\`.`)
      }
      if (dep === feature) fail(`feature cycle: ${feature} -> ${feature}`)
    }
    graph[feature] = [...new Set(list)]
  }

  /** @type {Map<string, 'visiting' | 'done'>} */
  const state = new Map()
  /** @param {string} feature @param {string[]} trail */
  const visit = (feature, trail) => {
    const seen = state.get(feature)
    if (seen === 'done') return
    if (seen === 'visiting') {
      const cycle = [...trail.slice(trail.indexOf(feature)), feature]
      fail(`feature cycle: ${cycle.join(' -> ')}`)
    }
    state.set(feature, 'visiting')
    for (const dep of graph[feature] ?? []) visit(dep, [...trail, feature])
    state.set(feature, 'done')
  }
  for (const feature of Object.keys(graph)) visit(feature, [])
  return graph
}

/**
 * @param {unknown} input
 * @returns {NormalizedOptions}
 */
export function normalizeOptions(input) {
  if (!isRecord(input)) fail('pass an options object with at least `features`.')
  for (const key of Object.keys(input)) {
    if (!OPTION_KEYS.has(key)) fail(`unknown option \`${key}\`.`)
  }

  const features = assertFeatureGraph(input.features)

  const testKind = input.testKind ?? 'testing'
  if (typeof testKind !== 'string' || !KIND_NAME.test(testKind) || RESERVED.has(testKind)) {
    fail(
      `\`testKind\` must be a camelCase folder name that isn't already a kind or a fixed folder.`,
    )
  }

  const extraKinds = stringList(input.kinds, '`kinds`')
  for (const kind of extraKinds) {
    if (!KIND_NAME.test(kind)) fail(`kind "${kind}" must be a camelCase folder name.`)
    if (RESERVED.has(kind) || kind === testKind) {
      fail(`kind "${kind}" is already a core kind or a fixed folder. Core kinds can't be renamed.`)
    }
  }
  const kinds = [...OWNER_KINDS, ...new Set(extraKinds)]

  /** @type {Record<string, string[]>} */
  const groups = {}
  if (input.groups !== undefined) {
    if (!isRecord(input.groups)) fail('`groups` must be a record of kind to group names.')
    const groupable = new Set([...kinds, 'pages', 'data'])
    for (const [kind, names] of Object.entries(input.groups)) {
      if (!groupable.has(kind)) fail(`groups: "${kind}" isn't a kind.`)
      const list = stringList(names, `groups.${kind}`)
      for (const name of list) {
        if (!KIND_NAME.test(name)) fail(`group "${name}" must be a camelCase folder name.`)
        if (RESERVED.has(name) || kinds.includes(name) || name === testKind) {
          fail(`group "${name}" clashes with a kind or a fixed folder.`)
        }
      }
      if (list.length) groups[kind] = [...new Set(list)]
    }
  }

  const router = input.router ?? 'tanstack'
  if (typeof router !== 'string' || !ROUTERS.includes(router)) {
    fail(`\`router\` must be one of ${ROUTERS.map((r) => `'${r}'`).join(', ')}.`)
  }

  let naming = /** @type {string[]} */ ([])
  let boundaries = /** @type {string[]} */ ([])
  if (input.ignores !== undefined) {
    if (!isRecord(input.ignores))
      fail('`ignores` must be `{ naming?: string[], boundaries?: string[] }`.')
    for (const key of Object.keys(input.ignores)) {
      if (key !== 'naming' && key !== 'boundaries') fail(`unknown option \`ignores.${key}\`.`)
    }
    naming = stringList(input.ignores.naming, '`ignores.naming`')
    boundaries = stringList(input.ignores.boundaries, '`ignores.boundaries`')
  }

  const srcDir = input.srcDir ?? 'src'
  if (
    typeof srcDir !== 'string' ||
    !/^[\w.-]+(?:\/[\w.-]+)*$/.test(srcDir) ||
    srcDir.startsWith('.')
  ) {
    fail('`srcDir` must be a relative folder path such as `src`.')
  }

  const rootDir = input.rootDir ?? process.cwd()
  if (typeof rootDir !== 'string') fail('`rootDir` must be a path.')

  return {
    features,
    kinds,
    groups,
    testKind,
    router: /** @type {'tanstack' | 'next'} */ (router),
    ignores: { naming, boundaries },
    srcDir,
    rootDir: path.resolve(rootDir),
  }
}
