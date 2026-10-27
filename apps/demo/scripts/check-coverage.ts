/**
 * Fails unless the demo uses every component and hook the Kiln packages export (apps/demo/AGENTS.md).
 *
 * The list comes from each entry's TypeScript exports, so adding a component to a package's
 * barrel fails this check until the demo uses it, and removing one fails the demo's typecheck.
 * "Uses" means a named import from that entry somewhere under `src/`; ESLint's unused-import
 * rule makes sure the import is rendered or called, not just written.
 *
 *   node scripts/check-coverage.ts          report and exit 1 on a gap
 *   node scripts/check-coverage.ts --list   print what is covered, entry by entry
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import ts from 'typescript'

import { EXEMPT, type Entry } from './coverage-exemptions.ts'

const ROOT = join(import.meta.dirname, '..')
const PACKAGES = join(ROOT, '..', '..', 'packages')

interface EntryConfig {
  /** The package entry file, under packages/. */
  file: string
  /** `components`: PascalCase values and `use*` hooks. `all`: every value export (opt-in entries). */
  scope: 'components' | 'all'
}

/** Every entry a consumer renders from. Testing entries are for tests, not apps. */
const ENTRIES: Record<Entry, EntryConfig> = {
  '@mitcsutt/kiln-ui': { file: 'ui/src/index.ts', scope: 'components' },
  '@mitcsutt/kiln-ui/highlight': { file: 'ui/src/highlight/index.ts', scope: 'all' },
  '@mitcsutt/kiln-forms': { file: 'forms/src/index.ts', scope: 'components' },
  '@mitcsutt/kiln-forms/dnd': { file: 'forms/src/dnd/index.ts', scope: 'all' },
  '@mitcsutt/kiln-dnd': { file: 'dnd/src/index.ts', scope: 'components' },
  '@mitcsutt/kiln-charts': { file: 'charts/src/index.ts', scope: 'components' },
}

/** Icons are glyphs, not components to demo: the icon module is left out of the count. */
const ICONS_DIR = `${sep}ui${sep}src${sep}icons${sep}`

function isComponentOrHook(name: string) {
  return /^[A-Z][a-z]/.test(name) || /^use[A-Z]/.test(name)
}

/** The value exports (no types) of each entry that the demo must use. */
function requiredExports(): Map<Entry, string[]> {
  const files = Object.values(ENTRIES).map(({ file }) => join(PACKAGES, file))
  const program = ts.createProgram(files, {
    module: ts.ModuleKind.Preserve,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    noEmit: true,
    skipLibCheck: true,
    allowImportingTsExtensions: true,
  })
  const checker = program.getTypeChecker()
  const result = new Map<Entry, string[]>()
  for (const [entry, { file, scope }] of Object.entries(ENTRIES) as [Entry, EntryConfig][]) {
    const source = program.getSourceFile(join(PACKAGES, file))
    const moduleSymbol = source && checker.getSymbolAtLocation(source)
    if (!moduleSymbol) throw new Error(`Could not read the exports of ${file}`)
    const names = checker
      .getExportsOfModule(moduleSymbol)
      .filter((symbol) => {
        const target =
          symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
        if (!(target.flags & ts.SymbolFlags.Value)) return false
        const declaration = target.declarations?.[0]
        return !declaration?.getSourceFile().fileName.split('/').join(sep).includes(ICONS_DIR)
      })
      .map((symbol) => symbol.name)
      .filter((name) => scope === 'all' || isComponentOrHook(name))
      .sort()
    result.set(entry, names)
  }
  return result
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((item) => item.isFile() && /\.tsx?$/.test(item.name) && !item.name.endsWith('.gen.ts'))
    .map((item) => join(item.parentPath, item.name))
}

/**
 * Bound fields are written as the form's shorthand (`form.TextField`, `item.fields.AmountField`),
 * which is the same component as the `FormTextField` export. A JSX tag that's a property access
 * ending in `Field` counts as a use of the `Form`-prefixed export.
 */
function boundFieldTags(source: ts.SourceFile, record: (name: string) => void) {
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName
      if (ts.isPropertyAccessExpression(tag) && /^[A-Z]\w*Field$/.test(tag.name.text)) {
        record(`Form${tag.name.text}`)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}

/** Every name the demo uses from each Kiln entry, with the files that use it. */
function demoImports(): Map<string, Map<string, string[]>> {
  const used = new Map<string, Map<string, string[]>>()
  const add = (entry: string, name: string, file: string) => {
    const names = used.get(entry) ?? new Map<string, string[]>()
    used.set(entry, names)
    names.set(name, [...(names.get(name) ?? []), relative(ROOT, file)])
  }
  for (const file of sourceFiles(join(ROOT, 'src'))) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      false,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    )
    boundFieldTags(source, (name) => {
      add('@mitcsutt/kiln-forms', name, file)
    })
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement)) continue
      if (statement.importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword) continue
      if (!ts.isStringLiteral(statement.moduleSpecifier)) continue
      const bindings = statement.importClause?.namedBindings
      if (!bindings || !ts.isNamedImports(bindings)) continue
      for (const element of bindings.elements) {
        if (element.isTypeOnly) continue
        add(statement.moduleSpecifier.text, (element.propertyName ?? element.name).text, file)
      }
    }
  }
  return used
}

const required = requiredExports()
const used = demoImports()
const problems: string[] = []
const list = process.argv.includes('--list')

for (const [entry, names] of required) {
  const imported = used.get(entry) ?? new Map<string, string[]>()
  const exempt = EXEMPT[entry] ?? {}
  if (list) console.log(`\n${entry} (${names.length})`)
  for (const name of names) {
    const where = imported.get(name)
    if (list) console.log(`  ${where ? '✓' : name in exempt ? '–' : '✗'} ${name}`)
    if (where && name in exempt) {
      problems.push(`${entry}: ${name} is exempt but the demo uses it. Remove its exemption.`)
    } else if (!where && !(name in exempt)) {
      problems.push(`${entry}: the demo never uses ${name}.`)
    }
  }
  for (const name of Object.keys(exempt)) {
    if (!names.includes(name)) {
      problems.push(`${entry}: ${name} is exempt but no longer exported. Remove its exemption.`)
    }
  }
}

const total = [...required.values()].reduce((sum, names) => sum + names.length, 0)
if (problems.length > 0) {
  console.error(
    `Kiln demo coverage: ${problems.length} problem(s) across ${total} exports.\n\n${problems
      .map((problem) => `  - ${problem}`)
      .join('\n')}\n\n` +
      'Every component and hook a Kiln package exports appears in apps/demo, on a page where an\n' +
      'app would really use it (apps/demo/AGENTS.md). Run with --list to see the full table.',
  )
  process.exit(1)
}
console.log(`Kiln demo coverage: all ${total} components and hooks are used.`)
