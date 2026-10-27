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
})
