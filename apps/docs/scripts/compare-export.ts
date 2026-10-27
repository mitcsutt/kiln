/**
 * Compares a static export of the docs site with a baseline export, and fails unless they serve
 * readers the same site (ADR 0045, "Kiln's no-regression check"). A refactor of the site's code
 * is checked with it against an export of the branch it started from:
 *
 *   git switch main && pnpm build && cp -r out /tmp/baseline-out
 *   git switch - && pnpm build && node scripts/compare-export.ts /tmp/baseline-out
 *
 * - `llms.txt`, `llms-full.txt`, `_headers` and every `.md` file match byte for byte.
 * - Each HTML page matches as a summary (`export-snapshot.ts`): title, meta tags, `id`s, `href`s,
 *   visible text, `data-theme`, `data-mode` and the
 *   head script.
 * - The search index holds the same documents.
 * - Each theme selector has the same CSS rules.
 *
 * With `--report <dir>`, it also writes `<dir>/html.diff`, a diff of every page whose full HTML
 * differs once hashes are normalised. The report never fails the check: the React Server
 * Components payload and the asset list change with the code that renders the same page.
 *
 *   node scripts/compare-export.ts <baseline-out> [<out>] [--report <dir>]
 */
import { spawnSync } from 'node:child_process'
import { existsSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import {
  listDifference,
  normaliseAssets,
  normaliseClassNames,
  pageSummary,
  searchDocuments,
  themeRules,
  type PageSummary,
} from './export-snapshot.ts'

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { report: { type: 'string' } },
})
const [baselineArg, candidateArg = resolve(import.meta.dirname, '../out')] = positionals
if (!baselineArg) {
  console.error('Usage: node scripts/compare-export.ts <baseline-out> [<out>] [--report <dir>]')
  process.exit(2)
}
const baseline = resolve(baselineArg)
const candidate = resolve(candidateArg)
for (const dir of [baseline, candidate]) {
  if (!existsSync(join(dir, 'index.html'))) {
    console.error(`${dir} isn't a static export of the docs site: it has no index.html.`)
    process.exit(2)
  }
}

/** How many differences each check prints before it stops listing them. */
const SHOWN = 5
const failures: string[] = []

function fail(check: string, details: string[]): void {
  failures.push(check)
  console.log(`✗ ${check}`)
  for (const line of details.slice(0, SHOWN)) console.log(`    ${line}`)
  if (details.length > SHOWN) console.log(`    … and ${String(details.length - SHOWN)} more`)
}

function files(dir: string, pattern: string): string[] {
  return globSync(pattern, { cwd: dir }).sort()
}

/** Both exports' files that match `pattern`, failing on a file only one of them has. */
function pairedFiles(pattern: string, check: string): string[] {
  const { missing, extra } = listDifference(files(baseline, pattern), files(candidate, pattern))
  if (missing.length || extra.length) {
    fail(check, [
      ...missing.map((file) => `missing ${file}`),
      ...extra.map((file) => `new ${file}`),
    ])
  }
  return files(baseline, pattern).filter((file) => existsSync(join(candidate, file)))
}

function read(dir: string, file: string): string {
  return readFileSync(join(dir, file), 'utf8')
}

/** The first line the two texts differ on, for the message. */
function firstDifference(expected: string, actual: string): string {
  const a = expected.split('\n')
  const b = actual.split('\n')
  const line = a.findIndex((text, index) => text !== b[index])
  const at = line === -1 ? a.length : line
  return `line ${String(at + 1)}: ${JSON.stringify(a[at]?.slice(0, 120))} became ${JSON.stringify(b[at]?.slice(0, 120))}`
}

// Markdown and headers, byte for byte.
const markdown = pairedFiles('**/*.md', 'the same Markdown files')
const exact = ['llms.txt', 'llms-full.txt', '_headers', ...markdown]
const changed = exact.filter((file) => {
  if (!existsSync(join(candidate, file))) return true
  return !readFileSync(join(baseline, file)).equals(readFileSync(join(candidate, file)))
})
if (changed.length) {
  fail(
    'llms.txt, llms-full.txt, _headers and the Markdown files match byte for byte',
    changed.map((file) =>
      existsSync(join(candidate, file))
        ? `${file}, ${firstDifference(read(baseline, file), read(candidate, file))}`
        : `${file} is missing`,
    ),
  )
} else {
  console.log(`✓ ${String(exact.length)} Markdown, llms and _headers files match byte for byte`)
}

// HTML pages, as summaries.
const pages = pairedFiles('**/*.html', 'the same HTML pages')
const differing: string[] = []
const pageDetails: string[] = []
for (const file of pages) {
  const before = pageSummary(read(baseline, file))
  const after = pageSummary(read(candidate, file))
  const fields = (Object.keys(before) as (keyof PageSummary)[]).filter(
    (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  )
  if (!fields.length) continue
  differing.push(file)
  for (const field of fields) {
    const was = before[field]
    const now = after[field]
    if (Array.isArray(was) && Array.isArray(now)) {
      const index = was.findIndex((item, at) => item !== now[at])
      const at = index === -1 ? was.length : index
      pageDetails.push(
        `${file} ${field}[${String(at)}]: ${JSON.stringify(was[at])} became ${JSON.stringify(now[at])}`,
      )
    } else {
      pageDetails.push(`${file} ${field} changed`)
    }
  }
}
if (differing.length) {
  fail(`the HTML pages match (${String(differing.length)} differ)`, pageDetails)
} else {
  console.log(`✓ ${String(pages.length)} HTML pages match: title, meta, ids, hrefs, text`)
}

// The search index, as a set of documents.
const searchBefore = searchDocuments(read(baseline, 'api/search'))
const searchAfter = searchDocuments(read(candidate, 'api/search'))
const search = listDifference(searchBefore, searchAfter)
if (search.missing.length || search.extra.length) {
  fail('the search index holds the same documents', [
    ...search.missing.map((doc) => `missing ${doc.slice(0, 160)}`),
    ...search.extra.map((doc) => `new ${doc.slice(0, 160)}`),
  ])
} else {
  console.log(`✓ the search index holds the same ${String(searchBefore.length)} documents`)
}

// Each theme's CSS rules, wherever the build put them.
function exportThemeRules(dir: string): Map<string, string[]> {
  const all = new Map<string, string[]>()
  for (const file of files(dir, '_next/static/**/*.css')) {
    for (const [theme, rules] of themeRules(read(dir, file))) {
      all.set(theme, [...(all.get(theme) ?? []), ...rules])
    }
  }
  for (const rules of all.values()) rules.sort()
  return all
}
const rulesBefore = exportThemeRules(baseline)
const rulesAfter = exportThemeRules(candidate)
const themeDetails: string[] = []
for (const theme of new Set([...rulesBefore.keys(), ...rulesAfter.keys()])) {
  const { missing, extra } = listDifference(
    rulesBefore.get(theme) ?? [],
    rulesAfter.get(theme) ?? [],
  )
  themeDetails.push(
    ...missing.map((rule) => `${theme}: missing ${rule.slice(0, 160)}`),
    ...extra.map((rule) => `${theme}: new ${rule.slice(0, 160)}`),
  )
}
if (themeDetails.length) {
  fail('each theme selector has the same CSS rules', themeDetails)
} else {
  const counts = [...rulesBefore].map(([theme, rules]) => `${theme} ${String(rules.length)}`)
  console.log(`✓ each theme selector has the same CSS rules (${counts.join(', ')})`)
}

// The full HTML, as a report only.
if (values.report) {
  const report = resolve(values.report)
  const sides = { baseline: join(report, 'baseline'), candidate: join(report, 'candidate') }
  rmSync(report, { recursive: true, force: true })
  mkdirSync(report, { recursive: true })
  let differ = 0
  for (const file of pages) {
    const [before, after] = [baseline, candidate].map((dir) =>
      normaliseAssets(normaliseClassNames(read(dir, file)))
        // Next.js gives every build a random id, which each page's payload carries.
        .replace(/(\\?"b\\?":\\?")[\w-]+(\\?")/g, '$1*$2')
        .replace(/></g, '>\n<'),
    )
    if (before === after) continue
    differ++
    for (const [side, text] of [
      [sides.baseline, before],
      [sides.candidate, after],
    ] as const) {
      mkdirSync(dirname(join(side, file)), { recursive: true })
      writeFileSync(join(side, file), text ?? '')
    }
  }
  const diff = differ
    ? spawnSync('git', ['diff', '--no-index', '--no-color', sides.baseline, sides.candidate], {
        encoding: 'utf8',
        maxBuffer: 1024 ** 3,
      }).stdout
    : ''
  writeFileSync(join(report, 'html.diff'), diff)
  console.log(
    `  report: ${String(differ)} of ${String(pages.length)} pages' full HTML differ: ${join(report, 'html.diff')}`,
  )
}

if (failures.length) {
  console.log(
    `\n${String(failures.length)} check(s) failed: the export doesn't match the baseline.`,
  )
  process.exit(1)
}
console.log('\nThe export matches the baseline.')
