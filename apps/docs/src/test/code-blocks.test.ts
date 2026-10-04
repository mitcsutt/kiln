import { join } from 'node:path'
import ts from 'typescript'
import { toMarkdown } from '@/lib/to-markdown'
import { appDir, contentPages } from './content'

// ADR 0020: every TypeScript and JavaScript code block in the docs compiles against the real
// packages, under the rules `intent validate` (TanStack Intent 0.5) applies to a skill's code
// blocks. The blocks are read from each page's Markdown, the text the `.md` routes,
// llms-full.txt and the skills serve, so live examples and API signatures are checked too. The
// skills are built from these pages, so a docs edit that would fail `intent validate` fails here
// first, and so does a page no skill ships.

const checked = new Set(['ts', 'tsx', 'typescript', 'js', 'jsx', 'javascript'])

// A fragment may use names it doesn't declare (`form`, `save`, `styles`) or leave out what JSX
// needs, so Intent ignores these codes, and so does this check. Every other diagnostic fails.
const partialSnippetCodes = new Set([
  1375, 2304, 2318, 2503, 2552, 2580, 2581, 2582, 2583, 2584, 2591, 2592, 2593, 2602, 2686, 2688,
  7006, 7026, 7031, 17004, 18004,
])
// A module that can't be found fails only when it's a Kiln package: `@/lib/…` is the reader's.
const missingModuleCodes = new Set([2307, 2792])

// Intent's options, except that Node's types load: config files and server code run on Node.
const compilerOptions: ts.CompilerOptions = {
  noEmit: true,
  strict: false,
  strictNullChecks: true,
  skipLibCheck: true,
  allowJs: true,
  checkJs: true,
  resolveJsonModule: true,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleDetection: ts.ModuleDetectionKind.Force,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.Preserve,
  lib: ['lib.esnext.d.ts', 'lib.dom.d.ts'],
  types: ['node'],
}

interface Block {
  /** `content/docs/ui/index.mdx, block 2`. */
  name: string
  code: string
  extension: string
}

/** A page's checked code blocks, found the way Intent finds them. */
function codeBlocks(page: string, markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/)
  const blocks: Block[] = []
  let count = 0
  for (let start = 0; start < lines.length; start++) {
    const opening = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(lines[start] ?? '')
    if (!opening) continue
    const [, indent = '', marker = '', info = ''] = opening
    if (marker.startsWith('`') && info.includes('`')) continue
    let end = start + 1
    for (; end < lines.length; end++) {
      const closing = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(lines[end] ?? '')?.[1]
      if (closing?.startsWith(marker.charAt(0)) && closing.length >= marker.length) break
    }
    count++
    const language = info.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
    if (checked.has(language)) {
      const dedent = new RegExp(`^ {0,${String(indent.length)}}`)
      blocks.push({
        name: `${page}, block ${String(count)}`,
        code: lines
          .slice(start + 1, end)
          .map((line) => line.replace(dedent, ''))
          .join('\n'),
        extension:
          language === 'tsx' || language === 'jsx'
            ? language
            : language.startsWith('j')
              ? 'js'
              : 'ts',
      })
    }
    start = end
  }
  return blocks
}

/** Each block's errors, from one program, with the blocks as files inside the app. */
function compileErrors(blocks: Block[]): Map<Block, string[]> {
  const virtualDir = join(appDir, '.code-blocks')
  const virtual = new Map(
    blocks.map((block, index) => [
      join(virtualDir, `block-${String(index)}.${block.extension}`),
      block,
    ]),
  )
  const host = ts.createCompilerHost(compilerOptions, true)
  const fileExists = host.fileExists.bind(host)
  const readFile = host.readFile.bind(host)
  host.fileExists = (path) => virtual.has(path) || fileExists(path)
  host.readFile = (path) => virtual.get(path)?.code ?? readFile(path)
  host.getSourceFile = (path, languageVersion) => {
    const code = virtual.get(path)?.code ?? readFile(path)
    return code === undefined ? undefined : ts.createSourceFile(path, code, languageVersion, true)
  }
  const program = ts.createProgram([...virtual.keys()], compilerOptions, host)

  const errors = new Map<Block, string[]>()
  for (const [path, block] of virtual) {
    const source = program.getSourceFile(path)
    if (!source) throw new Error(`Not in the program: ${path}`)
    const found: string[] = []
    for (const diagnostic of [
      ...program.getSyntacticDiagnostics(source),
      ...program.getSemanticDiagnostics(source),
    ]) {
      if (partialSnippetCodes.has(diagnostic.code)) continue
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')
      if (missingModuleCodes.has(diagnostic.code)) {
        const specifier = /Cannot find module '([^']+)'/.exec(message)?.[1]
        if (!specifier?.startsWith('@mitcsutt/kiln-')) continue
      }
      const line =
        diagnostic.start === undefined
          ? 0
          : source.getLineAndCharacterOfPosition(diagnostic.start).line
      found.push(`line ${String(line + 1)}: TS${String(diagnostic.code)}: ${message}`)
    }
    errors.set(block, found)
  }
  return errors
}

const blocks = contentPages().flatMap((page) =>
  codeBlocks(`content/docs/${page.path}.mdx`, toMarkdown(page.body)),
)
const errors = compileErrors(blocks)

describe('every code block in the docs compiles', () => {
  it('finds the blocks', () => {
    expect(blocks.length).toBeGreaterThan(100)
  })

  it.each(blocks.map((block) => [block.name, block] as const))('%s', (_name, block) => {
    expect(errors.get(block)).toEqual([])
  })
})
