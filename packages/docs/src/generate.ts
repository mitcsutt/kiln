import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { DEFAULT_CONTENT_DIR, DEFAULT_GENERATED_DIR } from './config.ts'
import { indexPages, shadowedMessage, slugOf } from './slugs.ts'

/** A file a site's generator writes: a page or a `meta` file. */
export interface GeneratedFile {
  /** Its path inside the generated-pages folder: `plugins/git/index.md`, `plugins/meta.json`. */
  path: string
  content: string
}

export interface WriteGeneratedOptions {
  /** The site's root, which the folders below are relative to. The working directory by default. */
  root?: string
  /** Where the hand-written pages are. */
  contentDir?: string
  /** The generated-pages folder: emptied, then written. */
  dir?: string
}

export interface WriteGeneratedReport {
  /** The files written, by their path inside the folder. */
  written: string[]
  /** The files left out, each with the hand-written file that shadows it. */
  skipped: { path: string; shadowedBy: string }[]
}

const PAGE = /\.mdx?$/
const META = /(^|\/)meta\.(json|ya?ml)$/

/** A relative path with `/` separators that stays inside its folder. */
function isInside(path: string): boolean {
  return (
    !isAbsolute(path) &&
    !path.includes('\\') &&
    path.split('/').every((part) => part !== '' && part !== '.' && part !== '..')
  )
}

/** Whether `child` is `parent` or inside it. */
function within(child: string, parent: string): boolean {
  const path = relative(parent, child)
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path))
}

/** Every file under `dir`, by its path inside it with `/` separators. */
function filesIn(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join('/'))
}

/**
 * Writes a site's generated pages before `next build`, into their own folder (`.generated/pages`
 * by default), and empties that folder and nothing else first. Precedence is by slug (ADR 0046):
 * a page whose slug a hand-written page already has is skipped and reported, whatever the
 * extension of either, and two generated pages with one slug throw before anything is written.
 * A `meta` file is skipped when a hand-written one has its path.
 */
export function writeGenerated(
  files: readonly GeneratedFile[],
  {
    root = process.cwd(),
    contentDir = DEFAULT_CONTENT_DIR,
    dir = DEFAULT_GENERATED_DIR,
  }: WriteGeneratedOptions = {},
): WriteGeneratedReport {
  const site = resolve(root)
  const content = resolve(site, contentDir)
  const out = resolve(site, dir)
  if (out === site || !within(out, site)) {
    throw new Error(`kiln-docs: the generated-pages folder ${dir} must be inside the site's root.`)
  }
  if (within(out, content) || within(content, out)) {
    throw new Error(
      `kiln-docs: the generated-pages folder ${dir} and the hand-written pages in ${contentDir} must be apart.`,
    )
  }
  for (const file of files) {
    if (!isInside(file.path) || !(PAGE.test(file.path) || META.test(file.path))) {
      throw new Error(
        `kiln-docs: ${file.path} isn't a generated page: it's a .md, .mdx or meta file's path inside the folder.`,
      )
    }
  }

  const pages = files.filter((file) => PAGE.test(file.path))
  indexPages(
    pages.map((file) => file.path),
    'the generated pages',
  )
  const metas = files.filter((file) => META.test(file.path))
  const seen = new Set<string>()
  for (const meta of metas) {
    if (seen.has(meta.path)) throw new Error(`kiln-docs: ${meta.path} is generated twice.`)
    seen.add(meta.path)
  }

  const handWritten = filesIn(content)
  const handWrittenPages = indexPages(
    handWritten.filter((path) => PAGE.test(path)),
    contentDir,
  )
  const handWrittenMetas = new Set(handWritten.filter((path) => META.test(path)))

  const report: WriteGeneratedReport = { written: [], skipped: [] }
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  for (const file of files) {
    const shadowedBy = PAGE.test(file.path)
      ? handWrittenPages.get(slugOf(file.path))
      : handWrittenMetas.has(file.path)
        ? file.path
        : undefined
    if (shadowedBy !== undefined) {
      console.warn(shadowedMessage(file.path, `${contentDir}/${shadowedBy}`))
      report.skipped.push({ path: file.path, shadowedBy })
      continue
    }
    const target = join(out, file.path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, file.content)
    report.written.push(file.path)
  }
  return report
}
