// @vitest-environment node
/**
 * kiln-forms and kiln-ui are used together, so no name may be exported by both (ADR 0017).
 * A shared name lets an editor auto-import the unbound ui control where the bound field was
 * meant, or the other way round. Types count too: `FieldLayout` once lived in both.
 */
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const formsRoot = join(dirname(new URL(import.meta.url).pathname), '../..')
const uiRoot = dirname(require.resolve('@mitcsutt/kiln-ui/package.json'))

const entries = {
  forms: join(formsRoot, 'src/index.ts'),
  formsSchema: join(formsRoot, 'src/schema/core/index.ts'),
  ui: join(uiRoot, 'src/index.ts'),
}

function exportNames(): Record<keyof typeof entries, string[]> {
  const configPath = join(formsRoot, 'tsconfig.json')
  const config = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      },
    },
  )
  if (!config) throw new Error(`Can't read ${configPath}`)
  const program = ts.createProgram(Object.values(entries), config.options)
  const checker = program.getTypeChecker()
  const namesOf = (file: string) => {
    const source = program.getSourceFile(file)
    const symbol = source && checker.getSymbolAtLocation(source)
    if (!symbol) throw new Error(`No module symbol for ${file}`)
    return checker.getExportsOfModule(symbol).map((exported) => exported.name)
  }
  return {
    forms: namesOf(entries.forms),
    formsSchema: namesOf(entries.formsSchema),
    ui: namesOf(entries.ui),
  }
}

describe('export names', () => {
  const names = exportNames()

  it('reads both packages', () => {
    expect(names.forms).toContain('FormTextField')
    expect(names.ui).toContain('TextField')
  })

  it('no kiln-forms export shares a name with a kiln-ui export', () => {
    const ui = new Set(names.ui)
    expect(names.forms.filter((name) => ui.has(name))).toEqual([])
    expect(names.formsSchema.filter((name) => ui.has(name))).toEqual([])
  })
})
