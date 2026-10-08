import { createMDX } from 'fumadocs-mdx/next'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

/** @type {(phase: string) => import('next').NextConfig} */
export default function config(phase) {
  const dev = phase === PHASE_DEVELOPMENT_SERVER
  return createMDX()({
    reactStrictMode: true,
    // kiln-ui and kiln-forms are consumed as TypeScript source inside the workspace (ADR 0005).
    transpilePackages: ['@mitcsutt/kiln-ui', '@mitcsutt/kiln-forms'],
    // The build is a static site in `out/`, served by Cloudflare Workers static assets (ADR 0034).
    // Every page is also raw Markdown at `/docs/<page>.md`, for agents and for readers who want
    // the source. A static export can't rewrite, so the build moves the route handler's files
    // there (scripts/markdown-files.ts), and `next dev`, which isn't an export, rewrites to it.
    ...(dev
      ? {
          rewrites() {
            return Promise.resolve([
              { source: '/docs.md', destination: '/llms.mdx/index.md' },
              { source: '/docs/:path*.md', destination: '/llms.mdx/:path*.md' },
            ])
          },
        }
      : { output: 'export' }),
  })
}
