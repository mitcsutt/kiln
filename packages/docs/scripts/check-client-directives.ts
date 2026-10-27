/**
 * After `vite build`: every source module that starts with `'use client'` must still start with it
 * in `dist/`, or Next.js renders that client component on the server and its hooks throw (ADR
 * 0045, amending ADR 0005). The library build keeps the directive today; this fails the build if
 * a change to it ever drops one.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = join(import.meta.dirname, '..')
const src = join(root, 'src')
const dist = join(root, 'dist')
const DIRECTIVE = /^(?:#![^\n]*\n)?\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*['"]use client['"]/

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const clientModules = walk(src).filter(
  (file) =>
    /\.tsx?$/.test(file) &&
    !/\.test\.tsx?$/.test(file) &&
    DIRECTIVE.test(readFileSync(file, 'utf8')),
)
const problems: string[] = []
for (const file of clientModules) {
  const built = join(dist, relative(src, file).replace(/\.tsx?$/, '.js'))
  if (!existsSync(built)) problems.push(`${relative(root, built)} is missing`)
  else if (!DIRECTIVE.test(readFileSync(built, 'utf8'))) {
    problems.push(`${relative(root, built)} lost its 'use client' directive`)
  }
}
if (problems.length) {
  console.error(`Client modules in dist/ without 'use client':\n  ${problems.join('\n  ')}`)
  process.exit(1)
}
console.log(`'use client' kept in ${String(clientModules.length)} client modules.`)
