import { cpSync, existsSync, renameSync, rmSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import type { SiteConfig } from '../config.ts'
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

export interface PostbuildOptions {
  /** The site's root. */
  root: string
  /** The site's config, from its `site.config.ts`. */
  config: Pick<SiteConfig, 'theme'>
  /** The static export, `out` in the site's root by default. */
  out?: string
}

/**
 * `kiln-docs postbuild`, after `next build`: moves the Markdown files into place, then fails on a
 * missing route file, a theme the site offers with no CSS in the export, or a fumadocs peer
 * outside the tested pair (ADR 0045). Returns what it did, for the log.
 */
export function postbuild({ root, config, out = join(root, 'out') }: PostbuildOptions): string[] {
  const site = resolve(root)
  const app = appDirOf(site)
  moveMarkdown(out)
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
    'route files, theme CSS and fumadocs peers checked',
    ...stale.map((file) => `${file.path} is from an older kiln-docs, and unedited`),
  ]
}
