import { build, type Plugin } from 'esbuild'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { SiteConfig } from '../config.ts'

const NODE_LOADABLE =
  "A site's config is Node-loadable (ADR 0045): the kiln-docs bin loads it outside the site's bundler."

/** Fails the build on an import plain Node can't load, naming what to import instead. */
const nodeLoadable: Plugin = {
  name: 'kiln-docs:node-loadable',
  setup(config) {
    config.onResolve({ filter: /^@\// }, ({ path }) => ({
      errors: [
        {
          text: `${path} is a tsconfig path alias, which only the site's bundler resolves. Import it by its relative path. ${NODE_LOADABLE}`,
        },
      ],
    }))
    config.onResolve({ filter: /^@mitcsutt\/kiln-ui$/ }, () => ({
      errors: [
        {
          text: `kiln-ui's root entry imports CSS, so plain Node can't load it. Import from a Node-loadable kiln-ui entry instead (ADR 0023). ${NODE_LOADABLE}`,
        },
      ],
    }))
  },
}

/**
 * Loads a site's `site.config.ts` in plain Node. esbuild, which fumadocs-mdx already depends on,
 * bundles the config's own files and strips their types, so this works from Node 22.12, before
 * Node strips types by default. Packages stay external and load from the site's `node_modules`.
 */
export async function loadSiteConfig(file: string): Promise<SiteConfig> {
  const path = resolve(file)
  const { outputFiles } = await build({
    entryPoints: [path],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    target: 'node22.12',
    packages: 'external',
    logLevel: 'silent',
    plugins: [nodeLoadable],
  })
  // Written beside the config, under its `node_modules`, so the packages it imports resolve as
  // they do from the config itself.
  const out = join(
    dirname(path),
    'node_modules/.cache/kiln-docs',
    `${basename(path)}.${process.pid}.${Date.now()}.mjs`,
  )
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, outputFiles[0]?.text ?? '')
  try {
    const module = (await import(pathToFileURL(out).href)) as { default?: SiteConfig }
    if (!module.default) throw new Error(`kiln-docs: ${file} has no default export.`)
    return module.default
  } finally {
    rmSync(out, { force: true })
  }
}
