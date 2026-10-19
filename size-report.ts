/**
 * Size report with budgets, and proof that single imports tree-shake.
 *
 * Measure (run from a package directory after its build, as its `size` script does):
 *
 *   node ../../size-report.ts
 *
 * It reads `size.config.json` there, prints each check, writes `.size/report.json`, and
 * fails if any check fails:
 *
 * - `file` checks measure a built file as shipped (a stylesheet, say).
 * - `import` checks bundle `import { X } from '<from>'` the way a consumer's bundler
 *   would (dependencies and peers external, the package's `sideEffects` honoured) and
 *   measure the result. With `isolatedTo`, they also fail unless every module in the
 *   bundle is reachable from that file: importing one component must not pull in
 *   another. With `bundle`, the named dependencies are bundled in and measured too, for
 *   a package whose engine is a dependency a consumer always ships with it. With
 *   `withDependencies`, only peers stay external, and every chunk counts, lazily loaded
 *   ones included: what an app downloads for the feature, engine and all.
 *
 * Sizes are gzip, in bytes.
 *
 * Compare (for a pull request comment; builds nothing):
 *
 *   node size-report.ts --markdown out.md --head <report.json> [--base <report.json>]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

import { build, type Rolldown } from 'vite'

interface FileCheck {
  name: string
  file: string
  budget: number
}

interface ImportCheck {
  name: string
  import: string
  from: string
  budget: number
  isolatedTo?: string
  /** Dependencies to bundle and measure rather than leave external. */
  bundle?: string[]
  withDependencies?: boolean
}

type Check = FileCheck | ImportCheck

interface SizeResult {
  name: string
  bytes: number
  budget: number
  modules?: string[]
  problems: string[]
}

interface SizeReport {
  package: string
  results: SizeResult[]
}

const kB = (bytes: number) => `${(bytes / 1000).toFixed(2)} kB`
const signed = (bytes: number) =>
  bytes === 0 ? '0' : `${bytes > 0 ? '+' : '−'}${kB(Math.abs(bytes))}`
const failedCheck = (result: SizeResult) =>
  result.bytes > result.budget || result.problems.length > 0

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

/* ─── Measure ─────────────────────────────────────────────────────────────── */

const gzip = (code: string | Uint8Array) => gzipSync(code, { level: 9 }).length

/** Every file a module reaches through relative static imports, itself included. */
function closure(root: string, start: string): Set<string> {
  const seen = new Set<string>()
  const queue = [resolve(root, start)]
  for (let file = queue.pop(); file !== undefined; file = queue.pop()) {
    if (seen.has(file)) continue
    seen.add(file)
    const code = readFileSync(file, 'utf8')
    for (const match of code.matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+)["']/g)) {
      const spec = match[1]
      if (spec !== undefined) queue.push(resolve(dirname(file), spec))
    }
  }
  return seen
}

async function bundle(
  root: string,
  check: ImportCheck,
  isExternal: (id: string) => boolean,
): Promise<Rolldown.OutputChunk[]> {
  const entryId = '\0kiln-size-entry'
  const target = resolve(root, check.from)
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root,
    plugins: [
      {
        name: 'kiln:size-entry',
        resolveId: (id) => (id === entryId ? id : null),
        load: (id) =>
          id === entryId ? `export ${check.import} from ${JSON.stringify(target)}` : null,
      },
    ],
    build: {
      write: false,
      minify: true,
      sourcemap: false,
      // An app build drops an entry's exports; keep them, like a consumer that uses the import.
      rolldownOptions: { input: entryId, external: isExternal, preserveEntrySignatures: 'strict' },
    },
  })
  for (const output of Array.isArray(result) ? result : [result]) {
    if (!('output' in output)) continue
    const chunks = output.output.filter((item) => item.type === 'chunk')
    // The entry chunk first; lazily loaded chunks count only with `withDependencies`.
    if (chunks.length) return check.withDependencies ? chunks : chunks.slice(0, 1)
  }
  throw new Error(`${check.name}: the bundle produced no chunk`)
}

async function measure(root: string): Promise<SizeReport> {
  const config = readJson(join(root, 'size.config.json')) as { checks: Check[] }
  const pkg = readJson(join(root, 'package.json')) as {
    name: string
    dependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
  }
  const externalNames = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ]
  const isExternal = (id: string) =>
    externalNames.some((name) => id === name || id.startsWith(`${name}/`))
  const peerNames = Object.keys(pkg.peerDependencies ?? {})
  const isPeer = (id: string) => peerNames.some((name) => id === name || id.startsWith(`${name}/`))

  const results: SizeResult[] = []
  for (const check of config.checks) {
    if ('file' in check) {
      const bytes = gzip(readFileSync(resolve(root, check.file)))
      results.push({ name: check.name, bytes, budget: check.budget, problems: [] })
      continue
    }
    const bundled = check.bundle ?? []
    const chunks = await bundle(
      root,
      check,
      check.withDependencies
        ? isPeer
        : (id) =>
            bundled.some((name) => id === name || id.startsWith(`${name}/`))
              ? false
              : isExternal(id),
    )
    const modules = chunks
      .flatMap((chunk) =>
        Object.entries(chunk.modules)
          .filter(([id, info]) => !id.startsWith('\0') && info.renderedLength > 0)
          .map(([id]) => id),
      )
      // A bundled dependency's modules are measured, but they aren't the package's own.
      .filter((id) => bundled.length === 0 || !id.includes('/node_modules/'))
    const problems: string[] = []
    if (check.isolatedTo) {
      const allowed = closure(root, check.isolatedTo)
      for (const id of modules) {
        if (!allowed.has(id)) {
          problems.push(`pulls in ${relative(root, id)}, outside ${check.isolatedTo}'s imports`)
        }
      }
    }
    results.push({
      name: check.name,
      bytes: chunks.reduce((total, chunk) => total + gzip(chunk.code), 0),
      budget: check.budget,
      modules: modules.map((id) => relative(root, id)),
      problems,
    })
  }
  return { package: pkg.name, results }
}

/* ─── Compare ─────────────────────────────────────────────────────────────── */

function markdown(head: SizeReport, base: SizeReport | undefined): string {
  const rows = head.results.map((result) => {
    const before = base?.results.find((item) => item.name === result.name)
    const change = before ? signed(result.bytes - before.bytes) : 'new'
    const status = failedCheck(result) ? '❌' : '✅'
    return `| ${result.name} | ${kB(result.bytes)} | ${change} | ${kB(result.budget)} | ${status} |`
  })
  return [
    `### Size report: \`${head.package}\``,
    '',
    'Gzip sizes of the published build. Change is against the base branch.',
    '',
    '| Check | Size | Change | Budget | |',
    '| --- | ---: | ---: | ---: | :-: |',
    ...rows,
    '',
  ].join('\n')
}

const markdownPath = flag('--markdown')
if (markdownPath) {
  const headPath = flag('--head')
  if (!headPath) throw new Error('--markdown needs --head <report.json>')
  const basePath = flag('--base')
  const base = basePath && existsSync(basePath) ? (readJson(basePath) as SizeReport) : undefined
  writeFileSync(markdownPath, markdown(readJson(headPath) as SizeReport, base))
} else {
  const root = process.cwd()
  const report = await measure(root)
  for (const result of report.results) {
    const modules = result.modules ? `, ${String(result.modules.length)} modules` : ''
    const status = failedCheck(result) ? 'FAIL' : 'ok  '
    console.log(
      `${status} ${result.name}: ${kB(result.bytes)} gzip (budget ${kB(result.budget)}${modules})`,
    )
    if (result.bytes > result.budget) {
      console.log(`     over budget by ${kB(result.bytes - result.budget)}`)
    }
    for (const problem of result.problems) console.log(`     ${problem}`)
  }
  mkdirSync(join(root, '.size'), { recursive: true })
  writeFileSync(join(root, '.size', 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  if (report.results.some(failedCheck)) process.exitCode = 1
}
