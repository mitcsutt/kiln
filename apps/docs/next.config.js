import { createMDX } from 'fumadocs-mdx/next'

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // kiln-ui and kiln-forms are consumed as TypeScript source inside the workspace (ADR 0005).
  transpilePackages: ['@mitcsutt/kiln-ui', '@mitcsutt/kiln-forms'],
  rewrites() {
    return Promise.resolve([
      // Every page as raw Markdown, for agents and for readers who want the source.
      { source: '/docs.md', destination: '/llms.mdx' },
      { source: '/docs/:path*.md', destination: '/llms.mdx/:path*' },
    ])
  },
}

export default createMDX()(config)
