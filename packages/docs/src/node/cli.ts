#!/usr/bin/env node
import { join } from 'node:path'
import { checkLinks } from './checkLinks.ts'
import { loadSiteConfig } from './loadConfig.ts'
import { postbuild } from './postbuild.ts'

const USAGE = `Usage: kiln-docs <command>, from the site's root

  postbuild     after \`next build\`: moves the Markdown files into place, and checks the route
                files, the themes' CSS and the fumadocs peers
  check-links   serves the export with Wrangler, and fails on a broken internal link or anchor`

/** The `kiln-docs` bin. Every command runs from the site's root, beside its `site.config.ts`. */
async function main(command: string | undefined): Promise<number> {
  const root = process.cwd()
  const config = () => loadSiteConfig(join(root, 'site.config.ts'))
  switch (command) {
    case 'postbuild': {
      for (const line of postbuild({ root, config: await config() })) {
        console.log(`kiln-docs postbuild: ${line}`)
      }
      return 0
    }
    case 'check-links': {
      const { checked, problems } = await checkLinks({ root, url: (await config()).url })
      if (problems.length) {
        console.error(`Broken internal links (${String(problems.length)}):`)
        for (const problem of problems) console.error(`  ${problem}`)
        return 1
      }
      console.log(`Checked ${String(checked)} internal links: none broken.`)
      return 0
    }
    default:
      console.error(USAGE)
      return 2
  }
}

try {
  process.exitCode = await main(process.argv[2])
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
// Wrangler's process group is stopped, but a stray handle mustn't hold the command open.
process.exit()
