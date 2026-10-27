import { withKilnDocs } from '@mitcsutt/kiln-docs/next'

// A static export in `out/`, served by Cloudflare Workers static assets (ADR 0034), with every
// page also served as Markdown at `/docs/<page>.md` (`withKilnDocs` and `kiln-docs postbuild`).
export default withKilnDocs({
  reactStrictMode: true,
  // The Kiln packages are consumed as TypeScript source inside the workspace (ADR 0005).
  transpilePackages: [
    '@mitcsutt/kiln-ui',
    '@mitcsutt/kiln-forms',
    '@mitcsutt/kiln-dnd',
    '@mitcsutt/kiln-charts',
  ],
  turbopack: {
    // kiln-docs' root layout imports kiln-ui's `theme-script` entry, whose `node` condition points
    // the server build at kiln-ui's dist/ (ADR 0023), which `next dev` doesn't build. Inside the
    // workspace it resolves the source, like every other kiln-ui entry.
    resolveAlias: { '@mitcsutt/kiln-ui/theme-script': '../../packages/ui/src/theme/script.ts' },
  },
})
