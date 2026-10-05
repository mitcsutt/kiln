/**
 * Proves `@mitcsutt/kiln-ui/theme-script` loads in plain Node with no React (ADR 0023), the
 * two ways an app's Node-side tooling (a Vite config, say) can meet it:
 *
 *   node scripts/check-theme-script-entry.ts <package.tgz>
 *
 * - Installed: the packed tarball is unpacked into an empty temporary project, so nothing
 *   else resolves. Importing React there must fail, which shows the project really has none.
 * - Linked: this package is imported by name from its own directory, which resolves through
 *   the workspace `exports` the way a `link:` dependency does, with no `kiln-dist` condition.
 *   The `node` condition must send it to the built file, not to `src/`.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const tarball = process.argv[2]
if (!tarball) throw new Error('Usage: node scripts/check-theme-script-entry.ts <package.tgz>')

const check = (how: string, preamble = '') => `
  import assert from 'node:assert/strict'
  ${preamble}
  const entry = import.meta.resolve('@mitcsutt/kiln-ui/theme-script')
  assert.match(entry, /\\/dist\\/theme\\/script\\.js$/, entry)
  const { themeScript, DEFAULT_STORAGE_KEY } = await import('@mitcsutt/kiln-ui/theme-script')
  assert.equal(DEFAULT_STORAGE_KEY, 'kiln-color-mode')
  const script = themeScript('ledger', 'light', { storageKey: 'my-app:mode' })
  assert.match(script, /localStorage\\.getItem\\("my-app:mode"\\)/)
  console.log('@mitcsutt/kiln-ui/theme-script runs in plain Node without React (${how})')
`

const project = mkdtempSync(join(tmpdir(), 'kiln-ui-theme-script-'))
try {
  const target = join(project, 'node_modules', '@mitcsutt', 'kiln-ui')
  mkdirSync(target, { recursive: true })
  execFileSync('tar', ['-xzf', resolve(tarball), '-C', target, '--strip-components=1'])
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      check('installed', "await assert.rejects(import('react'), { code: 'ERR_MODULE_NOT_FOUND' })"),
    ],
    { cwd: project, stdio: 'inherit' },
  )
} finally {
  rmSync(project, { recursive: true, force: true })
}

execFileSync(process.execPath, ['--input-type=module', '--eval', check('linked')], {
  cwd: resolve(import.meta.dirname, '..'),
  stdio: 'inherit',
})
