// @vitest-environment node
import { join } from 'node:path'

import ts from 'typescript'

/**
 * The chart engine stays swappable: nothing in the package's public types names it. This emits
 * the declarations the build ships, in memory, and checks none of them mentions Recharts.
 */
describe('public types', () => {
  it('reference no type from the chart engine', () => {
    const root = join(import.meta.dirname, '../..')
    const config = ts.getParsedCommandLineOfConfigFile(
      join(root, 'tsconfig.build.json'),
      {},
      { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
    )
    if (!config) throw new Error('No tsconfig.build.json')
    const program = ts.createProgram(config.fileNames, {
      ...config.options,
      noEmit: false,
      emitDeclarationOnly: true,
      declaration: true,
    })
    const declarations = new Map<string, string>()
    const result = program.emit(undefined, (file, text) => {
      if (file.endsWith('.d.ts')) declarations.set(file, text)
    })
    expect(
      result.diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    ).toEqual([])
    expect(declarations.size).toBeGreaterThan(10)
    const leaks = [...declarations]
      .filter(([, text]) => /recharts/i.test(text))
      .map(([file]) => file)
    expect(leaks).toEqual([])
  }, 60_000)
})
