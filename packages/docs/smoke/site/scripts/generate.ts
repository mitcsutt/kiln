// The site's generator, run before `next build`: one page per plugin, from data/plugins.json, as
// toolbelt writes pages from its manifests. `plugins/git` is hand-written too, so it's skipped.
import { readFileSync } from 'node:fs'
import { writeGenerated } from '@mitcsutt/kiln-docs/generate'

interface Plugin {
  name: string
  description: string
}

const plugins = JSON.parse(readFileSync('data/plugins.json', 'utf8')) as Plugin[]

const files = [
  {
    path: 'plugins/index.md',
    content: `---\ntitle: Plugins\ndescription: Every plugin in the kit.\n---\n\n${plugins
      .map((plugin) => `- [${plugin.name}](/docs/plugins/${plugin.name}): ${plugin.description}`)
      .join('\n')}\n`,
  },
  { path: 'plugins/meta.json', content: `${JSON.stringify({ title: 'Plugins' })}\n` },
  ...plugins.map((plugin) => ({
    path: `plugins/${plugin.name}.md`,
    content: `---\ntitle: ${plugin.name}\ndescription: ${plugin.description}\nplugin: ${plugin.name}\n---\n\n**Plugin:** \`${plugin.name}\`. Install it with \`install <name>\`.\n\n${plugin.description}\n`,
  })),
]

const { written, skipped } = writeGenerated(files)
console.log(`generated ${String(written.length)} file(s)`)
for (const { path, shadowedBy } of skipped) console.log(`skipped ${path}: ${shadowedBy} wins`)
