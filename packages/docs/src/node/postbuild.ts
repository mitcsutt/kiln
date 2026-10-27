import { cpSync, existsSync, renameSync, rmSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { close, createIndex } from 'pagefind'
import { DEFAULT_SEARCH_PROVIDER, SEARCH_ROUTE, type SiteConfig } from '../config.ts'
import { PAGEFIND_DIR, PAGEFIND_GLOB, PAGEFIND_ROOT } from '../pagefind.ts'
import { checkPeers } from './peers.ts'
import { checkRouteFiles } from './routes.ts'
import { checkThemeCss } from './themeCss.ts'

/** A site's `app/` folder: `src/app` when it has one, as Kiln's does, else `app`. */
export function appDirOf(root: string): string {
  const src = join(root, 'src/app')
  return existsSync(src) ? src : join(root, 'app')
}

/**
 * Moves each page's Markdown from the route handler's output (`out/llms.mdx/<page>.md`) to the URL
 * readers use, `out/docs/<page>.md`, with the docs index at `out/docs.md`. A static export can't
 * rewrite, so the files have to be where the URLs are (ADR 0034).
 */
export function moveMarkdown(out: string): void {
  const from = join(out, 'llms.mdx')
  if (!existsSync(join(from, 'index.md'))) {
    throw new Error(`${join(from, 'index.md')} is missing. Run \`next build\` first.`)
  }
  renameSync(join(from, 'index.md'), join(out, 'docs.md'))
  // Merges into out/docs, where the HTML pages already are.
  cpSync(from, join(out, 'docs'), { recursive: true })
  rmSync(from, { recursive: true })
}

/** The files of Pagefind's own search UIs, which `writeFiles` writes beside the index. */
const PAGEFIND_UI_FILES = [
  'pagefind-ui.js',
  'pagefind-ui.css',
  'pagefind-modular-ui.js',
  'pagefind-modular-ui.css',
  'pagefind-component-ui.js',
  'pagefind-component-ui.css',
  'pagefind-highlight.js',
]

/**
 * Indexes the export's docs pages with Pagefind into `out/pagefind/`, each page from its article
 * (ADR 0048), and deletes what the search route wrote, which a build under Pagefind doesn't use.
 * Returns how many pages it indexed.
 */
export async function indexPages(out: string): Promise<number> {
  const problem = (errors: string[]) => new Error(`Pagefind failed: ${errors.join('; ')}`)
  try {
    const { index, errors } = await createIndex({ rootSelector: PAGEFIND_ROOT })
    if (!index) throw problem(errors)
    const added = await index.addDirectory({ path: out, glob: PAGEFIND_GLOB })
    if (added.errors.length) throw problem(added.errors)
    if (!added.page_count) {
      throw new Error(`Pagefind found no docs pages in ${out}. Run \`next build\` first.`)
    }
    const written = await index.writeFiles({ outputPath: join(out, PAGEFIND_DIR) })
    if (written.errors.length) throw problem(written.errors)
    // The header queries Pagefind's JS API, so its prebuilt search UIs aren't deployed.
    for (const file of PAGEFIND_UI_FILES) rmSync(join(out, PAGEFIND_DIR, file), { force: true })
    rmSync(join(out, SEARCH_ROUTE), { force: true })
    return added.page_count
  } finally {
    await close()
  }
}

export interface PostbuildOptions {
  /** The site's root. */
  root: string
  /** The site's config, from its `site.config.ts`. */
  config: Pick<SiteConfig, 'theme'> & { search?: Pick<SiteConfig['search'], 'provider'> }
  /** The static export, `out` in the site's root by default. */
  out?: string
}

/**
 * `kiln-docs postbuild`, after `next build`: moves the Markdown files into place, indexes the
 * pages with Pagefind when it's the site's search provider, then fails on a missing route file, a
 * theme the site offers with no CSS in the export, or a fumadocs peer outside the tested pair
 * (ADR 0045). Returns what it did, for the log.
 */
export async function postbuild({
  root,
  config,
  out = join(root, 'out'),
}: PostbuildOptions): Promise<string[]> {
  const site = resolve(root)
  const app = appDirOf(site)
  moveMarkdown(out)
  const pagefind = (config.search?.provider ?? DEFAULT_SEARCH_PROVIDER) === 'pagefind'
  const indexed = pagefind ? await indexPages(out) : 0
  const problems = [
    ...checkRouteFiles(app)
      .filter((file) => file.state === 'missing')
      .map(
        (file) =>
          `${relative(site, join(app, file.path))} is missing. Write it from the kiln-docs README.`,
      ),
    ...checkThemeCss(site, out, config),
    ...checkPeers(site),
  ]
  if (problems.length) {
    throw new Error(
      `kiln-docs postbuild found ${String(problems.length)} problem(s):\n- ${problems.join('\n- ')}`,
    )
  }
  const stale = checkRouteFiles(app).filter((file) => file.state === 'stale')
  return [
    `moved ${relative(site, join(out, 'llms.mdx'))} to ${relative(site, join(out, 'docs'))}/<page>.md and ${relative(site, join(out, 'docs.md'))}`,
    ...(pagefind
      ? [
          `indexed ${String(indexed)} pages with Pagefind in ${relative(site, join(out, PAGEFIND_DIR))}`,
        ]
      : []),
    'route files, theme CSS and fumadocs peers checked',
    ...stale.map((file) => `${file.path} is from an older kiln-docs, and unedited`),
  ]
}
