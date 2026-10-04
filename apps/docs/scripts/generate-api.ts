/**
 * Reads the public surface of kiln-ui and kiln-forms with the TypeScript checker and
 * writes `.generated/api.json`: one entry per export, with its doc comment and, for prop
 * and option types, a row per property. The docs site renders API tables from it, so a
 * table can't drift from the types it describes.
 *
 *   node scripts/generate-api.ts
 *
 * A property is listed when it's declared in Kiln's own source. Props inherited from
 * React or Radix (every `<button>` attribute, say) are summarised by the `extends` list
 * instead of being listed one by one.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import ts from 'typescript'

const root = resolve(import.meta.dirname, '../../..')
const out = resolve(import.meta.dirname, '../.generated/api.json')

const entries = [
  { pkg: '@mitcsutt/kiln-ui', file: join(root, 'packages/ui/src/index.ts') },
  { pkg: '@mitcsutt/kiln-forms', file: join(root, 'packages/forms/src/index.ts') },
  {
    pkg: '@mitcsutt/kiln-forms/schema',
    file: join(root, 'packages/forms/src/schema/core/index.ts'),
  },
] as const

const kilnSource = [join(root, 'packages/ui/src') + sep, join(root, 'packages/forms/src') + sep]

export interface ApiProp {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
  deprecated?: boolean
}

export interface ApiEntry {
  name: string
  package: string
  kind: 'component' | 'function' | 'type' | 'constant'
  description: string
  /** Function and hook signatures, as TypeScript prints them. */
  signature?: string
  /** Own properties of a props or options type. */
  props?: ApiProp[]
  /** Types the props inherit from outside Kiln, summarised rather than listed. */
  extends?: string[]
  /** Static members of a compound component (`Card.Title`). */
  members?: string[]
}

function isKilnSource(fileName: string): boolean {
  const path = resolve(fileName)
  return kilnSource.some((dir) => path.startsWith(dir))
}

function readTsconfig(dir: string): ts.ParsedCommandLine {
  const configPath = join(dir, 'tsconfig.json')
  const read = ts.readConfigFile(configPath, (path) => ts.sys.readFile(path))
  const config: unknown = read.config
  return ts.parseJsonConfigFileContent(config, ts.sys, dir)
}

const options = readTsconfig(join(root, 'packages/forms')).options
const program = ts.createProgram(
  entries.map((entry) => entry.file),
  { ...options, noEmit: true },
)
const checker = program.getTypeChecker()

const PRINT: ts.TypeFormatFlags =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType |
  ts.TypeFormatFlags.WriteArrowStyleSignature

function docs(symbol: ts.Symbol): string {
  return ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim()
}

function jsDocTag(symbol: ts.Symbol, tag: string): string | undefined {
  const found = symbol.getJsDocTags(checker).find((t) => t.name === tag)
  if (!found) return undefined
  return ts.displayPartsToString(found.text).trim() || ''
}

// How the source writes defaults in prose: "Default `md`.", "Default 800.", "Default "Close".",
// "`md` (default)". "Defaults `inputMode` to `decimal`" names a different prop, so it's skipped.
const DEFAULT_IN_PROSE = [
  /\bDefault(?: is)?:?\s+`([^`]+)`/,
  /\bdefault(?: is)?:?\s+`([^`]+)`/,
  /\bDefault:?\s+(-?\d+(?:\.\d+)?)\b/,
  /\bDefault:?\s+("[^"]+")/,
  /`([^`]+)` \(default\)/,
]

function defaultOf(symbol: ts.Symbol, description: string): string | undefined {
  const tag = jsDocTag(symbol, 'default') ?? jsDocTag(symbol, 'defaultValue')
  if (tag !== undefined && tag !== '') return tag.replace(/^`|`$/g, '')
  for (const pattern of DEFAULT_IN_PROSE) {
    const match = pattern.exec(description)
    if (match?.[1]) return match[1]
  }
  return undefined
}

/**
 * A compound component's doc comment sits on its root (`const CardRoot = forwardRef(…)`),
 * not on `export const Card = Object.assign(CardRoot, {…})`.
 */
function componentDocs(symbol: ts.Symbol): string {
  const own = docs(symbol)
  if (own) return own
  const decl = symbol.getDeclarations()?.[0]
  if (!decl || !ts.isVariableDeclaration(decl) || !decl.initializer) return ''
  const init = decl.initializer
  if (ts.isCallExpression(init) && init.expression.getText() === 'Object.assign') {
    const first = init.arguments[0]
    const rootSymbol = first ? checker.getSymbolAtLocation(first) : undefined
    if (rootSymbol) return docs(rootSymbol)
  }
  return ''
}

const LITERAL =
  ts.TypeFlags.StringLiteral |
  ts.TypeFlags.NumberLiteral |
  ts.TypeFlags.BooleanLiteral |
  ts.TypeFlags.Null

/** A union of literals reads better spelled out than as its alias (`ButtonVariant`). */
function printType(type: ts.Type, node: ts.TypeNode | undefined, typeParams: Set<string>): string {
  const nonNullable = type.isUnion()
    ? type.types.filter((t) => !(t.flags & ts.TypeFlags.Undefined))
    : [type]
  if (nonNullable.length > 1 && nonNullable.every((t) => t.flags & LITERAL)) {
    const numeric = nonNullable.every((t) => t.flags & ts.TypeFlags.NumberLiteral)
    const ordered = numeric
      ? [...nonNullable].sort(
          (a, b) => (a as ts.NumberLiteralType).value - (b as ts.NumberLiteralType).value,
        )
      : nonNullable
    const parts = ordered.map((t) => checker.typeToString(t, undefined, PRINT))
    const hasTrue = parts.includes('true')
    const hasFalse = parts.includes('false')
    const rest = parts.filter((p) => p !== 'true' && p !== 'false')
    if (hasTrue && hasFalse) rest.push('boolean')
    else if (hasTrue) rest.push('true')
    else if (hasFalse) rest.push('false')
    return rest.join(' | ')
  }
  if (node) {
    const text = node.getText().replace(/\s+/g, ' ')
    const mentionsParam = [...typeParams].some((param) => new RegExp(`\\b${param}\\b`).test(text))
    if (!mentionsParam) return text
  }
  const printed = checker.typeToString(type, undefined, PRINT)
  return printed.replace(/ \| undefined$/, '')
}

function declaredTypeNode(decl: ts.Declaration): ts.TypeNode | undefined {
  if (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) return decl.type
  return undefined
}

function typeParamsOf(decl: ts.Declaration): Set<string> {
  const parent = decl.parent as ts.Node | undefined
  if (parent && (ts.isInterfaceDeclaration(parent) || ts.isTypeLiteralNode(parent))) {
    const owner = ts.isTypeLiteralNode(parent) ? parent.parent : parent
    if (ts.isInterfaceDeclaration(owner) || ts.isTypeAliasDeclaration(owner)) {
      return new Set(owner.typeParameters?.map((p) => p.name.text) ?? [])
    }
  }
  return new Set()
}

function propsOf(type: ts.Type): ApiProp[] {
  // A union of prop shapes (`GridColumnsProps | GridAutoProps`): list every member's props,
  // required only where every member requires it.
  if (type.isUnion() && !(type.flags & ts.TypeFlags.EnumLiteral)) {
    const merged = new Map<string, ApiProp>()
    const members = type.types.map(propsOf)
    for (const list of members) {
      for (const prop of list) {
        const seen = merged.get(prop.name)
        // `minItemWidth?: never` marks a prop the other member owns.
        if (!seen || seen.type === 'never') merged.set(prop.name, { ...prop })
        else seen.required = seen.required && prop.required
      }
    }
    for (const prop of merged.values()) {
      const inEvery = members.every((list) =>
        list.some((p) => p.name === prop.name && p.type !== 'never'),
      )
      if (!inEvery) prop.required = false
    }
    return [...merged.values()]
  }
  const props: ApiProp[] = []
  for (const prop of checker.getPropertiesOfType(type)) {
    const decls = prop.getDeclarations() ?? []
    const own = decls.find((d) => isKilnSource(d.getSourceFile().fileName))
    if (!own) continue
    const propType = checker.getTypeOfSymbol(prop)
    const description = docs(prop)
    const row: ApiProp = {
      name: prop.getName(),
      type: printType(propType, declaredTypeNode(own), typeParamsOf(own)),
      required: !(prop.flags & ts.SymbolFlags.Optional),
      description,
    }
    const fallback = defaultOf(prop, description)
    if (fallback !== undefined) row.default = fallback
    if (jsDocTag(prop, 'deprecated') !== undefined) row.deprecated = true
    props.push(row)
  }
  return props
}

/** Heritage from outside Kiln (`ButtonHTMLAttributes<HTMLButtonElement>`), unwrapping Omit/Pick. */
function externalHeritage(decl: ts.Declaration, seen = new Set<ts.Declaration>()): string[] {
  if (seen.has(decl)) return []
  seen.add(decl)
  const found: string[] = []
  const visit = (node: ts.TypeNode | ts.ExpressionWithTypeArguments): void => {
    const typeArgs = ts.isExpressionWithTypeArguments(node)
      ? node.typeArguments
      : ts.isTypeReferenceNode(node)
        ? node.typeArguments
        : undefined
    const name = ts.isExpressionWithTypeArguments(node)
      ? node.expression.getText()
      : ts.isTypeReferenceNode(node)
        ? node.typeName.getText()
        : undefined
    if (name && (name === 'Omit' || name === 'Pick') && typeArgs?.[0]) {
      visit(typeArgs[0])
      return
    }
    if (!ts.isExpressionWithTypeArguments(node) && ts.isIntersectionTypeNode(node)) {
      for (const part of node.types) visit(part)
      return
    }
    const type = checker.getTypeAtLocation(node)
    const symbol = type.aliasSymbol ?? type.getSymbol()
    const declarations = symbol?.getDeclarations() ?? []
    if (declarations.some((d) => isKilnSource(d.getSourceFile().fileName))) {
      // A Kiln type: its own props are already listed, but it may inherit from React too.
      for (const d of declarations) found.push(...externalHeritage(d, seen))
      return
    }
    found.push(node.getText().replace(/\s+/g, ' '))
  }
  if (ts.isInterfaceDeclaration(decl)) {
    for (const clause of decl.heritageClauses ?? []) for (const t of clause.types) visit(t)
  } else if (ts.isTypeAliasDeclaration(decl)) {
    const t = decl.type
    if (ts.isIntersectionTypeNode(t)) for (const part of t.types) visit(part)
    else if (!ts.isTypeLiteralNode(t)) visit(t)
  }
  return [...new Set(found)]
}

function isComponentLike(type: ts.Type, name: string): boolean {
  if (!/^[A-Z]/.test(name)) return false
  return type.getCallSignatures().length > 0 || Boolean(type.getProperty('$$typeof'))
}

function membersOf(type: ts.Type): string[] {
  return checker
    .getPropertiesOfType(type)
    .map((p) => p.getName())
    .filter((n) => /^[A-Z]/.test(n))
}

const api: Record<string, ApiEntry> = {}

for (const entry of entries) {
  const sourceFile = program.getSourceFile(entry.file)
  if (!sourceFile) throw new Error(`Not in the program: ${entry.file}`)
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile)
  if (!moduleSymbol) throw new Error(`No module symbol for ${entry.file}`)
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const name = exported.getName()
    if (api[name]) continue
    const symbol =
      exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
    const decls = symbol.getDeclarations() ?? []
    const decl = decls[0]
    if (!decl) continue
    // Passthroughs from TanStack are documented upstream.
    if (!isKilnSource(decl.getSourceFile().fileName)) continue

    const description = docs(symbol)
    if (symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) {
      const type = checker.getDeclaredTypeOfSymbol(symbol)
      const props =
        type.getFlags() & ts.TypeFlags.Object || type.isIntersection() || type.isUnion()
          ? propsOf(type)
          : []
      const heritage = decls.flatMap((d) => externalHeritage(d))
      const result: ApiEntry = { name, package: entry.pkg, kind: 'type', description }
      if (props.length) result.props = props
      if (heritage.length) result.extends = [...new Set(heritage)]
      if (!props.length && !heritage.length) {
        result.signature = ts.isTypeAliasDeclaration(decl)
          ? `type ${name} = ${decl.type.getText().replace(/\s+/g, ' ')}`
          : checker.typeToString(type, undefined, PRINT)
      }
      api[name] = result
      continue
    }

    const type = checker.getTypeOfSymbol(symbol)
    if (isComponentLike(type, name)) {
      const result: ApiEntry = {
        name,
        package: entry.pkg,
        kind: 'component',
        description: componentDocs(symbol),
      }
      const members = membersOf(type)
      if (members.length) result.members = members
      api[name] = result
      continue
    }
    const signatures = type.getCallSignatures()
    if (signatures.length) {
      api[name] = {
        name,
        package: entry.pkg,
        kind: 'function',
        description,
        signature: signatures
          .map((s) => `${name}${checker.signatureToString(s, undefined, PRINT)}`)
          .join('\n'),
      }
      continue
    }
    api[name] = { name, package: entry.pkg, kind: 'constant', description }
  }
}

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, `${JSON.stringify(api, null, 2)}\n`)
console.log(`api.json: ${String(Object.keys(api).length)} exports`)
