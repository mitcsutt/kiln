import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The route files a site keeps in `app/`: the route handlers re-export what `createDocsSite()`
 * returns, and the layouts and pages call their entry's factory with the site. A site
 * writes them by hand from the README until `kiln-docs init` writes them (ADR 0046). Each carries a
 * stamp, the hash of the template it was written from, so a later `kiln-docs sync` can refresh
 * the ones a site hasn't edited and leave the rest alone, and `postbuild` can fail when one is
 * missing.
 *
 * Each route handler holds `export const dynamic = 'force-static'` itself, because Next.js ignores
 * re-exported segment config.
 */

const site = "import { site } from '@/lib/site'\n"
const forceStatic = "export const dynamic = 'force-static'\n"
/** The root layout's stylesheets: kiln-ui's, then the chrome's. A site adds its themes' between. */
const styles = "import '@mitcsutt/kiln-ui/styles.css'\nimport '@mitcsutt/kiln-docs/styles.css'\n"

/** The templates by their path inside `app/`, without their stamps. */
const TEMPLATES: Readonly<Record<string, string>> = {
  'api/search/route.ts': `${site}\n${forceStatic}\nexport const { GET } = site.routes.search\n`,
  'llms.txt/route.ts': `${site}\n${forceStatic}\nexport const { GET } = site.routes.llmsTxt\n`,
  'llms-full.txt/route.ts': `${site}\n${forceStatic}\nexport const { GET } = site.routes.llmsFullTxt\n`,
  'llms.mdx/[...slug]/route.ts': `${site}\n${forceStatic}\nexport const { GET, generateStaticParams } = site.routes.pageMarkdown\n`,
  'sitemap.ts': `${site}\n${forceStatic}\nexport default site.routes.sitemap\n`,
  'robots.ts': `${site}\n${forceStatic}\nexport default site.routes.robots\n`,
  'layout.tsx': `${styles}import { createRootLayout } from '@mitcsutt/kiln-docs/layout'\n${site}\nexport const metadata = site.metadata\n\nexport default createRootLayout(site)\n`,
  'not-found.tsx': "export { NotFound as default } from '@mitcsutt/kiln-docs/not-found'\n",
  'docs/layout.tsx': `import { createDocsLayout } from '@mitcsutt/kiln-docs/docs-layout'\n${site}\nexport default createDocsLayout(site)\n`,
  'docs/[[...slug]]/page.tsx': `import { createDocsPage } from '@mitcsutt/kiln-docs/docs-page'\n${site}\nexport const { generateStaticParams, generateMetadata } = site\n\nexport default createDocsPage(site)\n`,
}

/** The stamp's format, which changes only if the stamp line itself does. */
const STAMP_FORMAT = 'v1'

const STAMP = /^\/\/ kiln-docs route (v\d+) ([0-9a-f]{12})\b[^\n]*\n/

const hashOf = (body: string) => createHash('sha256').update(body).digest('hex').slice(0, 12)

/** A template with its stamp line on top. */
export function stamped(body: string): string {
  return `// kiln-docs route ${STAMP_FORMAT} ${hashOf(body)}: written by @mitcsutt/kiln-docs, which updates it while it's unedited.\n${body}`
}

export interface RouteFile {
  /** Its path inside the site's `app/` folder. */
  path: string
  /** The file as a site writes it, stamp included. */
  content: string
}

/** Every route file, as the current kiln-docs writes it. */
export const ROUTE_FILES: readonly RouteFile[] = Object.entries(TEMPLATES).map(([path, body]) => ({
  path,
  content: stamped(body),
}))

export interface RouteStamp {
  format: string
  hash: string
  /** Whether the file has changed since it was stamped. */
  edited: boolean
}

/** A route file's stamp, or undefined when it has none. */
export function readStamp(content: string): RouteStamp | undefined {
  const match = STAMP.exec(content)
  if (!match) return undefined
  const [line, format = '', hash = ''] = match
  return { format, hash, edited: hashOf(content.slice(line.length)) !== hash }
}

/**
 * Where a route file stands: `current` as the current kiln-docs writes it; `stale` when it's
 * unedited but from an older template, which `sync` may replace; `edited` when the site changed
 * it or wrote it without a stamp, which `sync` leaves alone; `missing` when it isn't there.
 */
export type RouteState = 'current' | 'stale' | 'edited' | 'missing'

/** Each route file's state in a site's `app/` folder (`app` or `src/app`). */
export function checkRouteFiles(appDir: string): { path: string; state: RouteState }[] {
  return ROUTE_FILES.map(({ path, content }) => {
    const file = join(appDir, path)
    if (!existsSync(file)) return { path, state: 'missing' }
    const written = readFileSync(file, 'utf8')
    if (written === content) return { path, state: 'current' }
    const stamp = readStamp(written)
    return { path, state: !stamp || stamp.edited ? 'edited' : 'stale' }
  })
}
