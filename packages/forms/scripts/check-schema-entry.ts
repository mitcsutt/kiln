/**
 * Proves `@mitcsutt/kiln-forms/schema` loads in plain Node with no React installed
 * (target-state §3), using the packed tarball a consumer would install.
 *
 *   node scripts/check-schema-entry.ts <package.tgz>
 *
 * The tarball is unpacked into an empty temporary project, so nothing else resolves: no
 * React, no React DOM, no TanStack Form, no kiln-ui. A server then parses a schema from
 * JSON and validates a payload with it. Importing React there must fail, which shows the
 * project really has no React. `schema/core/node.test.ts` checks the same entry from source.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const tarball = process.argv[2]
if (!tarball) throw new Error('Usage: node scripts/check-schema-entry.ts <package.tgz>')

const project = mkdtempSync(join(tmpdir(), 'kiln-forms-schema-'))
try {
  const target = join(project, 'node_modules', '@mitcsutt', 'kiln-forms')
  mkdirSync(target, { recursive: true })
  execFileSync('tar', ['-xzf', resolve(tarball), '-C', target, '--strip-components=1'])

  const server = `
    import assert from 'node:assert/strict'

    await assert.rejects(import('react'), { code: 'ERR_MODULE_NOT_FOUND' })

    const { parseFormSchema, toStandardSchema, evaluateCondition } = await import(
      '@mitcsutt/kiln-forms/schema'
    )
    const json = {
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'text', name: 'email', label: 'Email', rules: [{ rule: 'required' }] },
          { kind: 'text', name: 'company', label: 'Company', rules: [{ rule: 'required' }] },
        ],
      },
    }
    const parsed = parseFormSchema(json, { kinds: ['text'] })
    assert.equal(parsed.ok, true, JSON.stringify(parsed.issues))
    const result = await toStandardSchema(parsed.schema)['~standard'].validate({
      email: 'ada@example.com',
      company: '',
    })
    assert.deepEqual(result.issues, [{ message: 'Enter a value', path: ['company'] }])
    assert.equal(evaluateCondition({ field: 'email', op: 'notEmpty' }, { email: 'x' }), true)
    console.log('@mitcsutt/kiln-forms/schema runs in plain Node without React')
  `
  execFileSync(process.execPath, ['--input-type=module', '--eval', server], {
    cwd: project,
    stdio: 'inherit',
  })
} finally {
  rmSync(project, { recursive: true, force: true })
}
