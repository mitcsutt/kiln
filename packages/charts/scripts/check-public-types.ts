/**
 * Proves the chart engine stays swappable: no declaration the package ships names it.
 *
 *   node scripts/check-public-types.ts <package.tgz>
 *
 * Reads every `.d.ts` in the packed tarball a consumer would install and fails on any that
 * mentions Recharts.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const tarball = process.argv[2]
if (!tarball) throw new Error('Usage: node scripts/check-public-types.ts <package.tgz>')

const target = mkdtempSync(join(tmpdir(), 'kiln-charts-types-'))
try {
  execFileSync('tar', ['-xzf', resolve(tarball), '-C', target, '--strip-components=1'])
  const declarations = readdirSync(target, { recursive: true, encoding: 'utf8' }).filter((file) =>
    file.endsWith('.d.ts'),
  )
  if (declarations.length <= 10) {
    throw new Error(`Expected the package to ship declarations, found ${declarations.length}`)
  }
  const leaks = declarations.filter((file) =>
    /recharts/i.test(readFileSync(join(target, file), 'utf8')),
  )
  if (leaks.length > 0) {
    throw new Error(`These public declarations name the chart engine:\n${leaks.join('\n')}`)
  }
  console.log(`${declarations.length} declarations, none names the chart engine`)
} finally {
  rmSync(target, { recursive: true, force: true })
}
