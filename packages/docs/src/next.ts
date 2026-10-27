import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'
// Node resolves `next`'s subpaths by file: it has no `exports` map.
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

type Rewrites = Awaited<ReturnType<NonNullable<NextConfig['rewrites']>>>

/**
 * Where `next dev` finds each page's Markdown. The static export can't rewrite, so `kiln-docs
 * postbuild` moves the route handler's files to these URLs instead (ADR 0034).
 */
export const MARKDOWN_REWRITES = [
  { source: '/docs.md', destination: '/llms.mdx/index.md' },
  { source: '/docs/:path*.md', destination: '/llms.mdx/:path*.md' },
]

/**
 * A docs site's `next.config.mjs`: `export default withKilnDocs({ … })`. It adds fumadocs-mdx,
 * transpiles kiln-docs, which the workspace consumes as TypeScript source, and builds a static
 * export in `out/` (ADR 0034). Under `next dev`, which isn't an export, it rewrites each page's
 * `.md` URL to the route that serves it, after the site's own rewrites.
 */
export function withKilnDocs(config: NextConfig = {}): (phase: string) => NextConfig {
  return (phase) => {
    const dev = phase === PHASE_DEVELOPMENT_SERVER
    const transpilePackages = [
      ...new Set([...(config.transpilePackages ?? []), '@mitcsutt/kiln-docs']),
    ]
    const site: NextConfig = { ...config, transpilePackages }
    if (dev) {
      const own = config.rewrites
      site.rewrites = async () => {
        const rewrites: Rewrites = (await own?.()) ?? []
        if (Array.isArray(rewrites)) return [...rewrites, ...MARKDOWN_REWRITES]
        return { ...rewrites, afterFiles: [...(rewrites.afterFiles ?? []), ...MARKDOWN_REWRITES] }
      }
    } else {
      site.output = 'export'
    }
    return createMDX()(site)
  }
}
