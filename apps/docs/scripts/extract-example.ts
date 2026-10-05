/**
 * Slices one example out of an examples file: the export's own declaration plus every
 * top-level helper, type and import it reaches, as the author wrote them. A reader who
 * copies the slice gets code that works on its own, so helpers shared by several examples
 * are repeated in each one's slice on purpose.
 *
 * References are resolved with the TypeScript checker, not by matching names, so a local
 * that shadows a helper doesn't pull the helper in, and a helper that calls another
 * helper brings both. The reached declarations keep their comments and original order;
 * imports keep only the names the slice uses. ADR 0025 has the reasoning.
 */
import { format, resolveConfig } from 'prettier'
import ts from 'typescript'

/** Where a top-level declaration came from: its statement, and the import name if it's one. */
interface TopLevel {
  statement: ts.Statement
  specifier?: ts.Node
}

/** A top-level statement's text, from after the previous statement's trailing comments. */
function segment(text: string, statement: ts.Statement, previous: ts.Statement | undefined) {
  const start = previous ? trailingEnd(text, previous) : statement.getFullStart()
  return { leading: text.slice(start, statement.getStart()), end: trailingEnd(text, statement) }
}

/** The end of a statement, including comments on the same line after it. */
function trailingEnd(text: string, statement: ts.Statement): number {
  return ts.getTrailingCommentRanges(text, statement.end)?.at(-1)?.end ?? statement.end
}

function isDirective(statement: ts.Statement): boolean {
  return ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression)
}

function bindingNames(name: ts.BindingName, into: ts.Node[]): void {
  if (ts.isIdentifier(name)) return
  for (const element of name.elements) {
    if (ts.isBindingElement(element)) {
      into.push(element)
      bindingNames(element.name, into)
    }
  }
}

/** Every node a top-level symbol can be declared by, mapped to its statement. */
function topLevelDeclarations(source: ts.SourceFile): Map<ts.Node, TopLevel> {
  const map = new Map<ts.Node, TopLevel>()
  let prologue = true
  for (const statement of source.statements) {
    if (prologue && isDirective(statement)) continue
    prologue = false
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause
      if (clause?.name) map.set(clause, { statement, specifier: clause })
      const bindings = clause?.namedBindings
      if (bindings && ts.isNamespaceImport(bindings)) {
        map.set(bindings, { statement, specifier: bindings })
      } else if (bindings) {
        for (const element of bindings.elements) map.set(element, { statement, specifier: element })
      }
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        const nodes: ts.Node[] = [declaration]
        bindingNames(declaration.name, nodes)
        for (const node of nodes) map.set(node, { statement })
      }
    } else if (
      ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEnumDeclaration(statement) ||
      ts.isModuleDeclaration(statement) ||
      ts.isImportEqualsDeclaration(statement) ||
      ts.isExportAssignment(statement)
    ) {
      map.set(statement, { statement })
    } else if (!ts.isEmptyStatement(statement)) {
      const { line } = source.getLineAndCharacterOfPosition(statement.getStart())
      throw new Error(
        `${source.fileName}:${String(line + 1)}: only imports and declarations can sit at the top level of an examples file (found ${ts.SyntaxKind[statement.kind]}). Export each example where it's declared.`,
      )
    }
  }
  return map
}

function parse(fileName: string, text: string) {
  const options: ts.CompilerOptions = {
    noLib: true,
    noResolve: true,
    types: [],
    jsx: ts.JsxEmit.Preserve,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.Preserve,
  }
  const host = ts.createCompilerHost(options)
  const source = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  )
  host.getSourceFile = (name) => (name === fileName ? source : undefined)
  const program = ts.createProgram({ rootNames: [fileName], options, host })
  const checker = program.getTypeChecker()
  const module = checker.getSymbolAtLocation(source)
  if (!module) throw new Error(`${fileName} has no imports or exports, so it has no examples.`)
  return { source, checker, exports: checker.getExportsOfModule(module) }
}

/** The names a file exports, in file order. `default` is the default export. */
export function exampleNames(fileName: string, text: string): string[] {
  const { exports } = parse(fileName, text)
  const start = (symbol: ts.Symbol) => symbol.declarations?.[0]?.getStart() ?? 0
  return exports
    .slice()
    .sort((a, b) => start(a) - start(b))
    .map((symbol) => symbol.name)
}

/** The source of one export and everything it reaches, unformatted. */
export function sliceExample(fileName: string, text: string, exportName: string): string {
  const { source, checker, exports } = parse(fileName, text)
  const declarations = topLevelDeclarations(source)
  const exported = exports.find((symbol) => symbol.name === exportName)
  if (!exported) throw new Error(`${fileName} has no export named ${exportName}.`)

  const statements = new Set<ts.Statement>()
  const specifiers = new Set<ts.Node>()
  const queue: ts.Statement[] = []

  const reach = (symbol: ts.Symbol | undefined) => {
    for (const declaration of symbol?.declarations ?? []) {
      const found = declarations.get(declaration)
      if (!found) continue
      if (found.specifier) specifiers.add(found.specifier)
      if (!statements.has(found.statement)) {
        statements.add(found.statement)
        queue.push(found.statement)
      }
    }
  }

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node)) {
      const parent = node.parent
      reach(
        ts.isShorthandPropertyAssignment(parent) && parent.name === node
          ? checker.getShorthandAssignmentValueSymbol(parent)
          : checker.getSymbolAtLocation(node),
      )
    }
    ts.forEachChild(node, visit)
  }

  reach(exported)
  if (statements.size === 0) {
    throw new Error(`${fileName}: export ${exportName} isn't declared in the file.`)
  }
  // A side-effect import (a stylesheet, say) names nothing, so every slice keeps it.
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && !statement.importClause) statements.add(statement)
  }
  // An import refers to nothing in the file, and visiting it would mark every name used.
  for (let statement = queue.pop(); statement; statement = queue.pop()) {
    if (!ts.isImportDeclaration(statement)) visit(statement)
  }

  let out = ''
  let previous: ts.Statement | undefined
  for (const statement of source.statements) {
    const { leading, end } = segment(text, statement, previous)
    previous = statement
    if (!statements.has(statement)) continue
    const code = ts.isImportDeclaration(statement)
      ? importText(statement, specifiers)
      : text.slice(statement.getStart(), end)
    if (code !== undefined) out += (out ? leading : leading.trimStart()) + code
  }
  return `${out}\n`
}

/** An import cut down to the names in `used`, or `undefined` when none are left. */
function importText(statement: ts.ImportDeclaration, used: Set<ts.Node>): string | undefined {
  const clause = statement.importClause
  if (!clause) return statement.getText()
  const parts: string[] = []
  if (clause.name && used.has(clause)) parts.push(clause.name.text)
  const bindings = clause.namedBindings
  if (bindings && ts.isNamespaceImport(bindings)) {
    if (used.has(bindings)) parts.push(bindings.getText())
  } else if (bindings) {
    const names = bindings.elements.filter((element) => used.has(element))
    if (names.length === bindings.elements.length) {
      parts.push(bindings.getText())
    } else if (names.length > 0) {
      parts.push(`{ ${names.map((element) => element.getText()).join(', ')} }`)
    }
  }
  if (parts.length === 0) return undefined
  // `import type` (or `import defer`) carries over to the cut-down import.
  const phase = clause.phaseModifier ? `${ts.tokenToString(clause.phaseModifier) ?? ''} ` : ''
  const attributes = statement.attributes ? ` ${statement.attributes.getText()}` : ''
  return `import ${phase}${parts.join(', ')} from ${statement.moduleSpecifier.getText()}${attributes}`
}

/** One example as a reader copies it: the slice, formatted with the repo's Prettier config. */
export async function extractExample(
  fileName: string,
  text: string,
  exportName: string,
): Promise<string> {
  const config = await resolveConfig(fileName)
  return format(sliceExample(fileName, text, exportName), { ...config, filepath: fileName })
}
