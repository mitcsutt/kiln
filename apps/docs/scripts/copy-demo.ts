// Copies the built demo app (apps/demo/dist) into public/demo-app, so the static export serves
// it at /demo-app/ and the /demo page can frame it (ADR 0046). `--optional` (for `next dev`)
// skips quietly when the demo hasn't been built; a production build fails instead.
import { cpSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const source = join(root, '../demo/dist')
const target = join(root, 'public/demo-app')
const optional = process.argv.includes('--optional')

if (!existsSync(join(source, 'index.html'))) {
  const message = 'The demo app is not built. Run `pnpm --filter @mitcsutt/kiln-demo build` first.'
  if (optional) {
    console.warn(`${message} /demo will show an empty frame.`)
    process.exit(0)
  }
  console.error(message)
  process.exit(1)
}

rmSync(target, { recursive: true, force: true })
cpSync(source, target, { recursive: true })
console.log('Copied the demo app to public/demo-app.')
