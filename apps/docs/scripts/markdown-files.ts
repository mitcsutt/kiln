/**
 * Moves each page's Markdown from the route handler's output (`out/llms.mdx/<page>.md`) to the
 * URL readers use, `out/docs/<page>.md`, with the docs index at `out/docs.md`. A static export
 * can't rewrite, so the files have to be where the URLs are (ADR 0034). `next build` runs it.
 *
 *   node scripts/markdown-files.ts
 */
import { cpSync, existsSync, renameSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const out = resolve(import.meta.dirname, '../out')
const from = resolve(out, 'llms.mdx')

if (!existsSync(resolve(from, 'index.md'))) {
  throw new Error('out/llms.mdx/index.md is missing. Run `next build` first.')
}
renameSync(resolve(from, 'index.md'), resolve(out, 'docs.md'))
// Merges into out/docs, where the HTML pages already are.
cpSync(from, resolve(out, 'docs'), { recursive: true })
rmSync(from, { recursive: true })
console.log('markdown: out/llms.mdx moved to out/docs/<page>.md and out/docs.md')
