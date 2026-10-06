import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { ESLint } from 'eslint'
import type { Linter } from 'eslint'
import { defineConfig } from 'eslint/config'
import { afterAll, describe, expect, it } from 'vitest'

import base from '../base.js'
import node from '../node.js'
import react from '../react.js'
import storybook from '../storybook.js'

// Type-aware rules only lint files that exist inside a TypeScript project, so
// each case is written into a throwaway project before it is linted.
const fixtures = fs.mkdtempSync(path.join(os.tmpdir(), 'kiln-eslint-config-'))

writeFixture(
  'tsconfig.json',
  JSON.stringify({
    compilerOptions: {
      strict: true,
      target: 'ES2022',
      module: 'Preserve',
      moduleResolution: 'Bundler',
      lib: ['ES2023', 'DOM'],
      jsx: 'react-jsx',
      allowJs: true,
      checkJs: true,
      noEmit: true,
    },
    include: ['**/*'],
  }),
)
writeFixture(
  'package.json',
  JSON.stringify({ name: 'fixture', private: true, devDependencies: { vitest: '*' } }),
)
writeFixture('options.ts', 'export interface Options {\n  verbose: boolean\n}\n')
// A stand-in for TanStack Router's types, for the `only-throw-error` allowance.
writeFixture(
  'node_modules/@tanstack/router-core/package.json',
  JSON.stringify({ name: '@tanstack/router-core', version: '1.0.0', types: 'index.d.ts' }),
)
writeFixture(
  'node_modules/@tanstack/router-core/index.d.ts',
  'export interface Redirect {\n  to: string\n}\nexport interface NotFoundError {\n  global?: boolean\n}\nexport declare function redirect(options: { to: string }): Redirect\nexport declare function notFound(): NotFoundError\n',
)

afterAll(() => {
  fs.rmSync(fixtures, { recursive: true, force: true })
})

function writeFixture(file: string, contents: string) {
  const target = path.join(fixtures, file)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, contents)
}

function createLinter(...configs: Linter.Config[][]) {
  return new ESLint({
    cwd: fixtures,
    overrideConfigFile: true,
    overrideConfig: defineConfig(...configs, {
      languageOptions: { parserOptions: { tsconfigRootDir: fixtures } },
    }),
  })
}

async function lint(linter: ESLint, file: string, code: string) {
  writeFixture(file, code)
  const [result] = await linter.lintText(code, { filePath: path.join(fixtures, file) })
  if (!result) throw new Error(`No lint result for ${file}`)
  return result.messages
}

async function ruleIds(linter: ESLint, file: string, code: string) {
  const messages = await lint(linter, file, code)
  return messages.map((message) => message.ruleId)
}

describe('base', () => {
  const linter = createLinter(base)

  it('accepts clean, Prettier-formatted code', async () => {
    expect(await lint(linter, 'clean.ts', "export const greeting = 'hello'\n")).toEqual([])
  })

  it('leaves formatting to Prettier', async () => {
    expect(await lint(linter, 'formatting.ts', 'export const greeting = "hello";\n')).toEqual([])
  })

  it('runs type-aware rules', async () => {
    const code = 'async function load() {}\nvoid 0\nexport function run() {\n  load()\n}\n'
    expect(await ruleIds(linter, 'floating.ts', code)).toContain(
      '@typescript-eslint/no-floating-promises',
    )
  })

  it('requires type-only imports to use `import type`', async () => {
    const code =
      "import { Options } from './options'\n\nexport const options: Options = { verbose: true }\n"
    expect(await ruleIds(linter, 'imports.ts', code)).toContain(
      '@typescript-eslint/consistent-type-imports',
    )
  })

  it('reports unused disable directives as errors', async () => {
    const code = '// eslint-disable-next-line no-console\nexport const value = 1\n'
    const [message] = await lint(linter, 'directives.ts', code)
    expect(message).toMatchObject({ ruleId: null, severity: 2 })
    expect(message?.message).toMatch(/Unused eslint-disable directive/)
  })

  it('flags dev dependencies imported from shipped code', async () => {
    const code = "import { describe } from 'vitest'\n\nexport const suite = describe\n"
    expect(await ruleIds(linter, 'shipped.ts', code)).toContain(
      'import-x/no-extraneous-dependencies',
    )
  })

  it('lets scripts and config files import dev dependencies', async () => {
    const code = "import { describe } from 'vitest'\n\nexport const suite = describe\n"
    for (const file of ['scripts/generate.ts', 'tools/scripts/generate.mjs', 'vite.config.ts']) {
      expect(await ruleIds(linter, file, code), file).not.toContain(
        'import-x/no-extraneous-dependencies',
      )
    }
  })

  it('lets test support files import dev dependencies', async () => {
    const code = "import { describe } from 'vitest'\n\nexport const suite = describe\n"
    for (const file of [
      'src/testing/renderWithRouter.tsx',
      'src/test/setup.ts',
      'src/testing/msw/handlers.ts',
      'src/__mocks__/api.ts',
      'vitest.setup.ts',
      'vitest.workspace.ts',
    ]) {
      expect(await ruleIds(linter, file, code), file).not.toContain(
        'import-x/no-extraneous-dependencies',
      )
    }
  })

  it('gives one answer on non-null assertions, so --fix never trades one error for another', async () => {
    const code =
      'export function pick(a: string | null, b: string | null) {\n  return (a ?? b) as string\n}\n'
    const ids = await ruleIds(linter, 'assertion.ts', code)
    expect(ids).not.toContain('@typescript-eslint/non-nullable-type-assertion-style')
    expect(
      await ruleIds(linter, 'bang.ts', code.replace('(a ?? b) as string', '(a ?? b)!')),
    ).toContain('@typescript-eslint/no-non-null-assertion')
  })

  it("allows throwing TanStack Router's redirect and notFound, and nothing else that isn't an Error", async () => {
    const rule = '@typescript-eslint/only-throw-error'
    const routes =
      "import { notFound, redirect } from '@tanstack/router-core'\n\nexport function beforeLoad(signedIn: boolean) {\n  if (!signedIn) throw redirect({ to: '/sign-in' })\n  throw notFound()\n}\n"
    expect(await ruleIds(linter, 'routes.ts', routes)).not.toContain(rule)
    const plain = "export function fail() {\n  throw { to: '/sign-in' }\n}\n"
    expect(await ruleIds(linter, 'plain.ts', plain)).toContain(rule)
  })

  it('allows numbers in template literals, but not nullish values or booleans', async () => {
    const rule = '@typescript-eslint/restrict-template-expressions'
    const label = (type: string) =>
      `declare const value: ${type}\n\nexport const label = \`\${value} items\`\n`
    expect(await ruleIds(linter, 'count.ts', label('number'))).not.toContain(rule)
    expect(await ruleIds(linter, 'missing.ts', label('string | undefined'))).toContain(rule)
    expect(await ruleIds(linter, 'done.ts', label('boolean'))).toContain(rule)
  })

  it('applies Vitest rules to test files', async () => {
    const code =
      "import { expect, it } from 'vitest'\n\nit.only('adds', () => {\n  expect(1 + 1).toBe(2)\n})\n"
    expect(await ruleIds(linter, 'math.test.ts', code)).toContain('vitest/no-focused-tests')
  })
})

describe('node', () => {
  const code = 'process.exitCode = 1\n'

  it('is needed for Node globals in JavaScript files', async () => {
    expect(await ruleIds(createLinter(base), 'script.js', code)).toContain('no-undef')
  })

  it('declares Node globals', async () => {
    expect(await lint(createLinter(base, node), 'script.js', code)).toEqual([])
  })
})

describe('react', () => {
  const linter = createLinter(base, react)

  it('enforces the rules of hooks', async () => {
    const code = [
      "import { useState } from 'react'",
      '',
      'export function Toggle({ on }: { on: boolean }) {',
      '  if (on) {',
      '    useState(0)',
      '  }',
      '  return null',
      '}',
      '',
    ].join('\n')
    expect(await ruleIds(linter, 'Toggle.tsx', code)).toContain('react-hooks/rules-of-hooks')
  })

  it('checks JSX accessibility', async () => {
    const code = 'export function Logo() {\n  return <img src="/logo.svg" />\n}\n'
    expect(await ruleIds(linter, 'Logo.tsx', code)).toContain('jsx-a11y/alt-text')
  })

  it('keeps component files Fast Refresh friendly', async () => {
    const code =
      'export const helper = () => 1\n\nexport function Button() {\n  return <button type="button" />\n}\n'
    expect(await ruleIds(linter, 'Button.tsx', code)).toContain(
      'react-refresh/only-export-components',
    )
  })
})

describe('storybook', () => {
  it('applies Storybook rules to stories', async () => {
    const linter = createLinter(base, react, storybook)
    const code = "export default { title: 'Example' }\n\nexport const primary = {}\n"
    expect(await ruleIds(linter, 'Example.stories.tsx', code)).toContain(
      'storybook/prefer-pascal-case',
    )
  })
})

describe('severity', () => {
  it('has no warn-level rules in any combination', async () => {
    const linter = createLinter(base, node, react, storybook)
    for (const file of ['a.ts', 'A.tsx', 'a.test.tsx', 'A.stories.tsx', '.storybook/main.ts']) {
      const config = (await linter.calculateConfigForFile(
        path.join(fixtures, file),
      )) as Linter.Config
      const warnings = Object.entries(config.rules ?? {}).filter(([, entry]) => {
        const level: unknown = Array.isArray(entry) ? entry[0] : entry
        return level === 'warn' || level === 1
      })
      expect(warnings, file).toEqual([])
    }
  })
})
