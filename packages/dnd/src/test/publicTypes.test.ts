// @vitest-environment node
/**
 * The drag engine is an implementation detail (ADR 0040): no declaration the public entry
 * reaches may mention it, so swapping or upgrading it never changes a consumer's types.
 * This emits the declarations in memory, walks every file `index.d.ts` imports, and fails
 * on any reference to `@dnd-kit`.
 */
import { dirname, join, resolve } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const root = join(dirname(new URL(import.meta.url).pathname), '../..')

function emitDeclarations(): Map<string, string> {
  const config = ts.getParsedCommandLineOfConfigFile(
    join(root, 'tsconfig.build.json'),
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      },
    },
  )
  if (!config) throw new Error("Can't read tsconfig.build.json")
  const files = new Map<string, string>()
  const program = ts.createProgram(config.fileNames, {
    ...config.options,
    outDir: join(root, 'virtual-dist'),
    emitDeclarationOnly: true,
    declaration: true,
    noEmit: false,
  })
  program.emit(undefined, (fileName, text) => {
    files.set(resolve(fileName), text)
  })
  return files
}

function reachable(files: Map<string, string>, entry: string): string[] {
  const seen = new Set<string>()
  const queue = [entry]
  for (let file = queue.pop(); file !== undefined; file = queue.pop()) {
    if (seen.has(file)) continue
    seen.add(file)
    const text = files.get(file) ?? ''
    for (const match of text.matchAll(/(?:from|import\()\s*['"]([^'"]+)['"]/g)) {
      const spec = match[1] ?? ''
      const base = spec.startsWith('#')
        ? join(root, 'virtual-dist', spec.slice(1))
        : spec.startsWith('.')
          ? resolve(dirname(file), spec)
          : null
      if (!base) continue
      const stem = base.replace(/\.js$/, '')
      for (const candidate of [`${stem}.d.ts`, join(stem, 'index.d.ts')]) {
        if (files.has(candidate)) queue.push(candidate)
      }
    }
  }
  return [...seen]
}

describe('public types', () => {
  const files = emitDeclarations()

  it.each(['index.d.ts', 'testing/index.d.ts'])('%s reaches no @dnd-kit type', (entry) => {
    const reached = reachable(files, join(root, 'virtual-dist', entry))
    expect(reached.length).toBeGreaterThan(entry === 'index.d.ts' ? 10 : 0)
    const leaks = reached.filter((file) => files.get(file)?.includes('@dnd-kit'))
    expect(leaks).toEqual([])
  })
})
