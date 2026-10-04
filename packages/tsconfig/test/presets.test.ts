import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const packageDir = path.join(import.meta.dirname, '..')
const presets = ['base', 'react', 'library', 'app', 'node'] as const

function load(preset: (typeof presets)[number]) {
  const file = path.join(packageDir, `${preset}.json`)
  const parsed = ts.getParsedCommandLineOfConfigFile(file, undefined, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    },
  })
  if (!parsed) throw new Error(`Could not parse ${file}`)
  // A preset has no files of its own, so "no inputs found" is expected.
  const errors = parsed.errors.filter((error) => error.code !== 18003)
  return { options: parsed.options, errors }
}

function compile(options: ts.CompilerOptions, source: string) {
  const fileName = path.join(packageDir, 'virtual.ts')
  const host = ts.createCompilerHost(options)
  const readFile = host.readFile.bind(host)
  host.readFile = (file) => (file === fileName ? source : readFile(file))
  host.fileExists = (file) => file === fileName || ts.sys.fileExists(file)
  const program = ts.createProgram([fileName], { ...options, noEmit: true, types: [] }, host)
  return ts.getPreEmitDiagnostics(program).map((diagnostic) => diagnostic.code)
}

describe.each(presets)('%s preset', (preset) => {
  it('parses without errors or deprecations', () => {
    expect(load(preset).errors).toEqual([])
  })
})

describe('base', () => {
  const { options } = load('base')

  it('sets the options from ADR 0007', () => {
    expect(options).toMatchObject({
      strict: true,
      noUncheckedIndexedAccess: true,
      verbatimModuleSyntax: true,
      isolatedModules: true,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      target: ts.ScriptTarget.ES2022,
    })
  })

  it('treats indexed access as possibly undefined', () => {
    const source = 'const list: number[] = []\nexport const first: number = list[0]\n'
    expect(compile(options, source)).toContain(2322)
  })
})

describe('react', () => {
  it('adds the DOM and the automatic JSX runtime', () => {
    const { options } = load('react')
    expect(options.jsx).toBe(ts.JsxEmit.ReactJSX)
    expect(options.lib).toEqual(expect.arrayContaining(['lib.dom.d.ts']))
    expect(options.strict).toBe(true)
  })
})

describe('library', () => {
  it('emits declarations with maps', () => {
    expect(load('library').options).toMatchObject({
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      strict: true,
    })
  })
})

describe('app', () => {
  it('type-checks without emitting', () => {
    expect(load('app').options).toMatchObject({ noEmit: true, strict: true })
  })
})

describe('node', () => {
  it('resolves modules the way Node does', () => {
    expect(load('node').options).toMatchObject({
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      types: ['node'],
      strict: true,
    })
  })
})

describe('package exports', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')) as {
    exports: Record<string, string>
  }

  it.each(presets)('exports %s with and without the .json extension', (preset) => {
    expect(manifest.exports[`./${preset}`]).toBe(`./${preset}.json`)
    expect(manifest.exports[`./${preset}.json`]).toBe(`./${preset}.json`)
  })

  it('points every export at a file that exists', () => {
    for (const target of Object.values(manifest.exports)) {
      expect(fs.existsSync(path.join(packageDir, target)), target).toBe(true)
    }
  })
})
