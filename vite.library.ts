/**
 * The library build every Kiln runtime package shares (ADR 0005). A package's
 * `vite.config.ts` is one call:
 *
 *   export default defineLibraryConfig({ root: import.meta.dirname, ... })
 *
 * It produces what publishing needs and nothing the workspace needs (the workspace
 * consumes `src/` directly):
 *
 * - ESM only, one output file per source module (`preserveModules`), so bundlers can
 *   drop what a consumer doesn't import. Source maps alongside.
 * - Everything in `dependencies` and `peerDependencies` stays external.
 * - CSS Modules get stable, readable class names: `<prefix><file>__<local>`. Every
 *   module's CSS lands in one `styles.css`, after the package's base stylesheet.
 * - Global stylesheets (the base and any opt-in presets) are bundled by hand: imports
 *   inlined, asset URLs pointed at the copied asset folder, then minified. Vite's
 *   library mode would inline fonts as base64, and a theme's unused faces must never
 *   be downloaded.
 * - Declarations come from `tsc -p tsconfig.build.json`, with every specifier rewritten
 *   to a relative `.js` path so they resolve under `moduleResolution: node16` as well as
 *   `bundler`.
 */
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, join, posix, relative, resolve, sep } from 'node:path'

import react from '@vitejs/plugin-react'
import { transform } from 'lightningcss'
import { defineConfig, type Plugin, type UserConfig } from 'vite'

export interface LibraryOptions {
  /** The package directory (pass `import.meta.dirname`). */
  root: string
  /** The JavaScript entry. Default `src/index.ts`. */
  entry?: string
  /** Prefix for generated CSS Module class names, e.g. `kiln-`. */
  classPrefix?: string
  /**
   * The base stylesheet, bundled and placed before the component CSS in `styles.css`.
   * Omit for a package with no CSS.
   */
  baseStylesheet?: string
  /** Extra standalone stylesheets: output path (under `dist/`) → source file. */
  stylesheets?: Record<string, string>
  /** A folder copied to `dist/` as is (fonts and their licences). URLs into it are rewritten. */
  assets?: string
}

const require = createRequire(import.meta.url)

interface PackageJson {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

function externals(root: string): RegExp[] {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as PackageJson
  const names = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]
  return names.map((name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}($|/)`))
}

/** POSIX relative path that always starts with `./` or `../`. */
function relativeSpecifier(from: string, to: string): string {
  const rel = relative(from, to).split(sep).join(posix.sep)
  return rel.startsWith('.') ? rel : `./${rel}`
}

/**
 * Inline `@import`s and point `url()`s into `assets` at the copied folder, as seen from
 * `outFile`. The stylesheets are plain CSS with relative imports, so this stays small.
 */
function bundleCss(
  file: string,
  outFile: string,
  assetsDir: string | undefined,
  assetsOut: string,
  seen = new Set<string>(),
): string {
  if (seen.has(file)) return ''
  seen.add(file)
  const css = readFileSync(file, 'utf8')
  return css
    .replace(/@import\s+['"]([^'"]+)['"]\s*;/g, (_, spec: string) =>
      bundleCss(resolve(dirname(file), spec), outFile, assetsDir, assetsOut, seen),
    )
    .replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (match, spec: string) => {
      if (!assetsDir || /^(data:|https?:|#)/.test(spec)) return match
      const target = resolve(dirname(file), spec)
      if (!target.startsWith(assetsDir + sep)) return match
      const copied = join(assetsOut, relative(assetsDir, target))
      return `url(${relativeSpecifier(dirname(outFile), copied)})`
    })
}

function minifyCss(code: string, filename: string): string {
  const { code: out } = transform({ filename, code: Buffer.from(code), minify: true })
  return out.toString()
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

/** Rewrite one declaration specifier to the relative `.js` path of the file it names. */
function resolveDeclarationSpecifier(spec: string, fromFile: string, outDir: string): string {
  let base: string
  if (spec.startsWith('#')) base = join(outDir, spec.slice(1))
  else if (spec.startsWith('.')) base = resolve(dirname(fromFile), spec)
  else return spec
  for (const [declaration, runtime] of [
    [`${base}.d.ts`, `${base}.js`],
    [join(base, 'index.d.ts'), join(base, 'index.js')],
  ] as const) {
    if (existsSync(declaration)) return relativeSpecifier(dirname(fromFile), runtime)
  }
  throw new Error(
    `Can't resolve "${spec}" from ${relative(outDir, fromFile)} in the emitted declarations`,
  )
}

function emitDeclarations(root: string, outDir: string): void {
  const tsc = require.resolve('typescript/bin/tsc', { paths: [root] })
  execFileSync(process.execPath, [tsc, '-p', join(root, 'tsconfig.build.json')], {
    cwd: root,
    stdio: 'inherit',
  })
  for (const file of walk(outDir).filter((f) => f.endsWith('.d.ts'))) {
    const source = readFileSync(file, 'utf8')
    const rewritten = source.replace(
      /(from\s+|import\s*\(\s*)(['"])([^'"]+)\2/g,
      (_, lead: string, quote: string, spec: string) =>
        `${lead}${quote}${resolveDeclarationSpecifier(spec, file, outDir)}${quote}`,
    )
    if (rewritten !== source) writeFileSync(file, rewritten)
  }
}

function libraryAssets(options: Required<Pick<LibraryOptions, 'root'>> & LibraryOptions): Plugin {
  const { root } = options
  const outDir = join(root, 'dist')
  const assetsDir = options.assets ? resolve(root, options.assets) : undefined
  const assetsOut = assetsDir ? join(outDir, basename(assetsDir)) : outDir
  return {
    name: 'kiln:library-assets',
    apply: 'build',
    // After Vite's own CSS plugin, so the component stylesheet already exists.
    enforce: 'post',
    generateBundle(_, bundle) {
      if (options.baseStylesheet) {
        const styles = Object.values(bundle).find(
          (file) => file.type === 'asset' && file.fileName === 'styles.css',
        )
        const base = minifyCss(
          bundleCss(
            resolve(root, options.baseStylesheet),
            join(outDir, 'styles.css'),
            assetsDir,
            assetsOut,
          ),
          'styles.css',
        )
        const components = styles?.type === 'asset' ? String(styles.source) : ''
        if (styles?.type === 'asset') styles.source = base + components
        else this.emitFile({ type: 'asset', fileName: 'styles.css', source: base })
      }
      for (const [fileName, source] of Object.entries(options.stylesheets ?? {})) {
        const css = bundleCss(resolve(root, source), join(outDir, fileName), assetsDir, assetsOut)
        this.emitFile({ type: 'asset', fileName, source: minifyCss(css, fileName) })
      }
    },
    writeBundle() {
      if (assetsDir) cpSync(assetsDir, assetsOut, { recursive: true })
      emitDeclarations(root, outDir)
    },
  }
}

export function defineLibraryConfig(options: LibraryOptions): UserConfig {
  const { root, entry = 'src/index.ts', classPrefix = '' } = options
  return defineConfig({
    root,
    plugins: [react(), libraryAssets(options)],
    css: {
      modules: {
        generateScopedName: (local, file) =>
          `${classPrefix}${basename(file).replace(/\.module\.css$/, '')}__${local}`,
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      cssCodeSplit: false,
      sourcemap: true,
      lib: {
        entry: resolve(root, entry),
        formats: ['es'],
        cssFileName: 'styles',
      },
      rolldownOptions: {
        external: externals(root),
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
      },
    },
  })
}
