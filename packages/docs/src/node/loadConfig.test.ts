import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { loadSiteConfig } from './loadConfig.ts'

let site: string

function write(files: Record<string, string>) {
  for (const [path, content] of Object.entries(files)) writeFileSync(join(site, path), content)
}

// A site with kiln-docs installed, as pnpm links a workspace package.
beforeEach(() => {
  site = mkdtempSync(join(tmpdir(), 'kiln-docs-config-'))
  mkdirSync(join(site, 'node_modules/@mitcsutt'), { recursive: true })
  symlinkSync(resolve(import.meta.dirname, '../..'), join(site, 'node_modules/@mitcsutt/kiln-docs'))
})

afterEach(() => {
  rmSync(site, { recursive: true, force: true })
})

describe('loadSiteConfig', () => {
  it("loads a TypeScript config, bundling the site's own files", async () => {
    write({
      // An extensionless import and type syntax: neither loads in plain Node 22.12.
      'themes.ts': "export const THEMES: readonly string[] = ['paper', 'flightdeck']\n",
      'site.config.ts': [
        "import { defineSite, type SiteConfig } from '@mitcsutt/kiln-docs/config'",
        "import { THEMES } from './themes'",
        '',
        "const theme: SiteConfig['theme'] = { picker: THEMES, default: 'paper' }",
        "export default defineSite({ name: 'Toolbelt', theme } as SiteConfig)",
      ].join('\n'),
    })
    await expect(loadSiteConfig(join(site, 'site.config.ts'))).resolves.toEqual({
      name: 'Toolbelt',
      theme: { picker: ['paper', 'flightdeck'], default: 'paper' },
    })
  })

  it('cleans up the bundle it loads', async () => {
    write({ 'site.config.ts': "export default { name: 'Toolbelt' }\n" })
    await loadSiteConfig(join(site, 'site.config.ts'))
    const bundles = join(site, 'node_modules/.cache/kiln-docs')
    expect(existsSync(bundles) ? readdirSync(bundles) : []).toEqual([])
  })

  it('refuses a tsconfig path alias', async () => {
    write({ 'site.config.ts': "import { name } from '@/lib/name'\nexport default { name }\n" })
    await expect(loadSiteConfig(join(site, 'site.config.ts'))).rejects.toThrow(
      '@/lib/name is a tsconfig path alias',
    )
  })

  it("refuses kiln-ui's root entry", async () => {
    write({
      'site.config.ts': "import { THEMES } from '@mitcsutt/kiln-ui'\nexport default { THEMES }\n",
    })
    await expect(loadSiteConfig(join(site, 'site.config.ts'))).rejects.toThrow(
      "kiln-ui's root entry imports CSS",
    )
  })

  it('fails on a config with no default export', async () => {
    write({ 'site.config.ts': "export const name = 'Toolbelt'\n" })
    await expect(loadSiteConfig(join(site, 'site.config.ts'))).rejects.toThrow(
      'has no default export',
    )
  })
})
