/**
 * Reads the docs examples out of a stories file (ADR 0028). A story tagged `docs` is a docs
 * example: the docs site shows it, in file order, with its JSDoc as the caption, and every other
 * story stays in the workbench. The tag goes on each story, never on the meta, so a docs example
 * is always a choice someone made.
 *
 * The code shown reuses `extract-example.ts`. Each docs story's `render` becomes an exported
 * component (`export const Tones: Story = { tags: ['docs'], render: () => (…) }` is read as
 * `export function Tones() { return (…) }`), the meta and the workbench stories are dropped, and
 * the extractor slices that text like an examples file: the component, the helpers it reaches,
 * and only the imports it uses. A docs story's `render` takes no args, so the code shown is the
 * code that runs.
 */
import { globSync, readFileSync } from 'node:fs'
import { basename, sep } from 'node:path'
import ts from 'typescript'

/** The story tag that puts a story on the docs site. */
export const DOCS_TAG = 'docs'

/** One docs story: its export, the heading the docs give it, and its JSDoc. */
export interface DocsStory {
  /** The export: `IconsAndLinks`. */
  name: string
  /** Its heading: the story's `name`, or the export in sentence case (`Icons and links`). */
  title: string
  /** The JSDoc above the export, as Markdown. */
  description: string
  /**
   * How the docs frame it, from the story's Storybook layout: `centered` stays centred,
   * `fullscreen` is `bleed`, and `fullscreen` in a fixed-height Docs frame
   * (`parameters.docs.story.inline: false`) is `frame`. Padded, the default, is left out.
   */
  layout?: 'centered' | 'bleed' | 'frame'
}

export interface DocsStoriesFile {
  /** How pages name it in `<Example of>`: `Button`, or a guide's page path. */
  of: string
  /** Relative to the repo, with `/` separators. */
  file: string
  /** The meta's `title`. */
  title: string
  stories: DocsStory[]
  /** The file read as an examples file, for `extractExample`. */
  examples: string
}

function unwrap(node: ts.Expression): ts.Expression {
  return ts.isSatisfiesExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isParenthesizedExpression(node)
    ? unwrap(node.expression)
    : node
}

function property(object: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined {
  for (const element of object.properties) {
    if (ts.isPropertyAssignment(element) && element.name.getText() === name) {
      return element.initializer
    }
  }
  return undefined
}

function stringList(node: ts.Node | undefined): string[] {
  if (!node || !ts.isArrayLiteralExpression(node)) return []
  return node.elements.filter(ts.isStringLiteralLike).map((element) => element.text)
}

function where(source: ts.SourceFile, node: ts.Node): string {
  const { line } = source.getLineAndCharacterOfPosition(node.getStart())
  return `${source.fileName}:${String(line + 1)}`
}

/** `IconsAndLinks` → `Icons and links`, `InAForm` → `In a form`: the docs' sentence-case headings. */
export function sentenceCase(name: string): string {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .split(' ')
  return words
    .map((word, index) => {
      if (index === 0) return word
      // An acronym (`URL`, `CSV`) keeps its capitals.
      return /^[A-Z0-9]{2,}$/.test(word) ? word : word.toLowerCase()
    })
    .join(' ')
}

/**
 * A doc comment is wrapped to fit the code; the docs join each paragraph and list item back onto one
 * line, as hand-written Markdown is. Code, tables, quotes and headings are left as they are.
 */
export function unwrapLines(markdown: string): string {
  return markdown
    .split(/(^```[\s\S]*?^```)/m)
    .map((part, index) =>
      index % 2
        ? part
        : part
            .split(/\n\s*\n/)
            .map((block) =>
              /^\s*(\||>|#)/.test(block)
                ? block
                : block.replace(/\n(?!\s*(?:[-*] |\d+\. ))\s*/g, ' '),
            )
            .join('\n\n'),
    )
    .join('')
}

/** The meta object, from `export default meta` or `export default { … }`. */
function metaObject(source: ts.SourceFile): ts.ObjectLiteralExpression | undefined {
  for (const statement of source.statements) {
    if (!ts.isExportAssignment(statement) || statement.isExportEquals) continue
    let value = unwrap(statement.expression)
    if (ts.isIdentifier(value)) {
      const name = value.text
      for (const other of source.statements) {
        if (!ts.isVariableStatement(other)) continue
        for (const declaration of other.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
            if (declaration.initializer) value = unwrap(declaration.initializer)
          }
        }
      }
    }
    return ts.isObjectLiteralExpression(value) ? value : undefined
  }
  return undefined
}

/** A story's JSDoc, as Storybook reads it: every `/** … *\/` above it, without the `*`s. */
function jsDoc(text: string, statement: ts.Statement): string {
  return (ts.getLeadingCommentRanges(text, statement.getFullStart()) ?? [])
    .map(({ kind, pos, end }) => {
      const comment = text.slice(pos, end)
      if (kind !== ts.SyntaxKind.MultiLineCommentTrivia || !comment.startsWith('/**')) return ''
      return comment
        .slice(3, -2)
        .split('\n')
        .map((line) => line.replace(/^\s*\*? ?/, ''))
        .join('\n')
        .trim()
    })
    .filter(Boolean)
    .join('\n\n')
}

/** A docs story's frame on the docs site, from its `parameters` (see `DocsStory.layout`). */
function docsLayout(parameters: ts.Expression | undefined): DocsStory['layout'] {
  if (!parameters || !ts.isObjectLiteralExpression(parameters)) return undefined
  const layout = property(parameters, 'layout')
  const value = layout && ts.isStringLiteralLike(layout) ? layout.text : undefined
  if (value === 'centered') return 'centered'
  if (value !== 'fullscreen') return undefined
  const docs = property(parameters, 'docs')
  const story = docs && ts.isObjectLiteralExpression(docs) ? property(docs, 'story') : undefined
  const inline =
    story && ts.isObjectLiteralExpression(story) ? property(story, 'inline') : undefined
  return inline?.kind === ts.SyntaxKind.FalseKeyword ? 'frame' : 'bleed'
}

function isExported(statement: ts.Statement): boolean {
  return (
    ts.canHaveModifiers(statement) &&
    (ts.getModifiers(statement)?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword) ?? false)
  )
}

/** A stories file's docs stories, and the file rewritten as an examples file. */
export function readDocsStories(
  fileName: string,
  text: string,
): { title: string; stories: DocsStory[]; examples: string } {
  const source = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  )
  const meta = metaObject(source)
  if (!meta) throw new Error(`${fileName} has no meta object as its default export.`)
  const titleNode = property(meta, 'title')
  const title = titleNode && ts.isStringLiteralLike(titleNode) ? titleNode.text : ''
  if (stringList(property(meta, 'tags')).includes(DOCS_TAG)) {
    throw new Error(
      `${where(source, meta)}: tag each docs story '${DOCS_TAG}', not the meta, so every docs example is chosen one by one.`,
    )
  }

  const stories: DocsStory[] = []
  let examples = ''
  for (const statement of source.statements) {
    const full = text.slice(statement.getFullStart(), statement.end)
    // The meta, `type Story` and helpers stay: the extractor keeps only what a story reaches.
    if (ts.isExportAssignment(statement)) continue
    if (!isExported(statement) || !ts.isVariableStatement(statement)) {
      examples += full
      continue
    }
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue
      const story = unwrap(declaration.initializer)
      if (!ts.isObjectLiteralExpression(story)) continue
      if (!stringList(property(story, 'tags')).includes(DOCS_TAG)) continue
      const name = declaration.name.text

      const render = property(story, 'render')
      if (!render || !(ts.isArrowFunction(render) || ts.isFunctionExpression(render))) {
        throw new Error(
          `${where(source, declaration)}: the docs story ${name} needs a \`render\` function, so the docs have code to show. Add one, or remove its '${DOCS_TAG}' tag.`,
        )
      }
      if (render.parameters.length > 0) {
        throw new Error(
          `${where(source, render)}: the docs story ${name}'s \`render\` takes args, so its code wouldn't work when copied. Render without args, or remove its '${DOCS_TAG}' tag.`,
        )
      }
      const body = render.body
      const code = ts.isBlock(body) ? body.getText() : `{\n  return ${body.getText()}\n}`
      examples += `\n\nexport function ${name}() ${code}`

      const storyName = property(story, 'name')
      const layout = docsLayout(property(story, 'parameters'))
      stories.push({
        name,
        title: storyName && ts.isStringLiteralLike(storyName) ? storyName.text : sentenceCase(name),
        description: unwrapLines(jsDoc(text, statement)),
        ...(layout ? { layout } : {}),
      })
    }
  }
  return { title, stories, examples: `${examples.trim()}\n` }
}

/** `UI/Inputs/OneTimeCodeField` → `ui/inputs/one-time-code-field`: a title's page path. */
export function titleToPath(title: string): string {
  return title
    .split('/')
    .map((segment) =>
      segment
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase(),
    )
    .join('/')
}

/**
 * How pages name a stories file's examples. Beside an export, the file is named after it, so
 * `Button/Button.stories.tsx` is `Button`. Under a package's `src/docs/` or `src/stories/` it
 * belongs to a guide and is named by its page, the path of its title:
 * `Forms/Getting started/Account settings` is `forms/getting-started/account-settings`.
 */
export function docsStoriesOf(file: string, title: string): string {
  if (/^packages\/[^/]+\/src\/(docs|stories)\//.test(file)) return titleToPath(title)
  return basename(file, '.stories.tsx')
}

/** Every stories file in the packages with at least one docs story, sorted by path. */
export function docsStoriesFiles(repoDir: string): DocsStoriesFile[] {
  return globSync('packages/*/src/**/*.stories.tsx', { cwd: repoDir })
    .map((file) => file.split(sep).join('/'))
    .sort()
    .flatMap((file) => {
      const { title, stories, examples } = readDocsStories(
        file,
        readFileSync(`${repoDir}/${file}`, 'utf8'),
      )
      if (stories.length === 0) return []
      return [{ of: docsStoriesOf(file, title), file, title, stories, examples }]
    })
}
