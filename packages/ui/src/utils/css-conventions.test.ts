import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const COMPONENTS = resolve(__dirname, '../components')

function cssModules(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? cssModules(p) : p.endsWith('.module.css') ? [p] : []
  })
}

describe('component CSS conventions', () => {
  const files = cssModules(COMPONENTS)

  it('never reads a private --_var with a fallback (define its default on the element instead)', () => {
    // `var(--_x, fallback)` assumes --_x is unset, but private vars inherit: any ancestor
    // component that defines --_x (Stack's --_gap, Button's --_ink…) silently leaks in.
    const offenders = files.flatMap((f) =>
      [...readFileSync(f, 'utf8').matchAll(/var\(--_[a-z0-9-]+,/g)].map(
        (m) => `${String(f.split('components/')[1])}: ${m[0]}`,
      ),
    )
    expect(offenders).toEqual([])
  })

  it('keeps component CSS unlayered', () => {
    const layered = files.filter((f) => /@layer\s/.test(readFileSync(f, 'utf8')))
    expect(layered).toEqual([])
  })

  it('lets `hidden` win on every layout component whose root sets display', () => {
    // Author `display` beats the UA `[hidden] { display: none }`, so `<Stack hidden>` would
    // stay on screen. Each root that sets display needs `.root[hidden]`.
    const layout = files.filter((f) => f.includes('/layout/') && !f.includes('/_story/'))
    const offenders = layout.flatMap((f) => {
      const css = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      const root = /^\.([a-zA-Z][\w-]*)\s*\{([^}]*)\}/m.exec(css)
      if (!root || !/(^|[\s;])display\s*:/.test(root[2] ?? '')) return []
      const hidden = new RegExp(`\\.${String(root[1])}\\[hidden\\]\\s*\\{[^}]*display\\s*:\\s*none`)
      return hidden.test(css) ? [] : [`${String(f.split('components/')[1])}: .${String(root[1])}`]
    })
    expect(offenders).toEqual([])
  })

  it('keeps navigation text off the caption steps (DESIGN.md §2 Type)', () => {
    // Nav labels are read and scanned like body copy. `--text-xs` and `--text-2xs` floor at
    // 11px and are for captions, badges and metadata; a compact label may floor at 0.75rem.
    const navText: Record<string, string> = {
      'navigation/NavLinks/NavLinks.module.css': 'link',
      'navigation/Tabs/Tabs.module.css': 'trigger',
      'navigation/BottomNav/BottomNav.module.css': 'link',
    }
    const offenders = Object.entries(navText).flatMap(([file, className]) => {
      const css = readFileSync(join(COMPONENTS, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      const subject = new RegExp(`\\.${className}(?![\\w-])`)
      return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(([, selector = '', body = '']) => {
        if (!subject.test(selector)) return []
        return [...body.matchAll(/font-size\s*:\s*([^;]+)/g)]
          .map(([, value = '']) => value.trim())
          .filter((value) => {
            if (!/var\(--text-2?xs\)/.test(value)) return false
            const floor = /^max\(var\(--text-xs\),\s*([\d.]+)rem\)$/.exec(value)
            return !floor || Number(floor[1]) < 0.75
          })
          .map((value) => `${file}: ${selector.trim()} { font-size: ${value} }`)
      })
    })
    expect(offenders).toEqual([])
  })
})
