import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { must } from '#test/must'

/*
 * DESIGN.md §2: the second-order AI tells, enforced. Models that are told to avoid Inter and
 * indigo converge on the next most common look instead (docs/research/ai-design-tells.md):
 * a warm cream canvas, an ember or terracotta accent, and a short list of "distinctive" fonts.
 * No new-design built-in theme may use them.
 */
const read = (path: string) =>
  readFileSync(resolve(__dirname, path), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

const THEMES = ['paper', 'ledger', 'flightdeck', 'riso'] as const

// Kept exactly as before for compatibility (ADR 0028); they predate the second-order rules and
// are exempt. Their stylesheets, and the font files only they use, are not checked.
const LEGACY = ['monograph', 'fiesta'] as const
const LEGACY_FONT_FILES = ['fonts-monograph.css', 'fonts-fiesta.css', 'fonts-martian-mono.css']

const BANNED_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Montserrat',
  'Space Grotesk',
  'Space Mono',
  'Geist',
  'DM Sans',
  'DM Serif',
  'Manrope',
  'Plus Jakarta Sans',
  'Outfit',
  'Sora',
  'Syne',
  'Satoshi',
  'Cabinet Grotesk',
  'Clash Display',
  'General Sans',
  'Instrument Sans',
  'Instrument Serif',
  'Fraunces',
  'Playfair Display',
  'Cormorant',
  'Lora',
  'EB Garamond',
  'Newsreader',
  'Bricolage Grotesque',
  'IBM Plex',
  'JetBrains Mono',
  'Fira Code',
]

/** The light half of `--name: light-dark(oklch(L C H), …)` as [L, C, H]. */
function lightOklch(css: string, name: string): [number, number, number] {
  const match = new RegExp(
    `${name}:\\s*light-dark\\(\\s*oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)`,
  ).exec(css)
  if (!match) throw new Error(`${name} is not light-dark(oklch(…), …)`)
  return [Number(must(match[1])), Number(must(match[2])), Number(must(match[3]))]
}

describe('no second-order AI tells in the new-design built-in themes', () => {
  const fontFiles = readdirSync(resolve(__dirname, '../tokens')).filter(
    (f) => f.startsWith('fonts') && !LEGACY_FONT_FILES.includes(f),
  )
  const sources = [
    ...THEMES.map((theme) => [`themes/${theme}.css`, read(`./${theme}.css`)] as const),
    ...fontFiles.map((file) => [`tokens/${file}`, read(`../tokens/${file}`)] as const),
  ]

  it.each(sources)('%s names no banned font family', (_, css) => {
    const families = [...css.matchAll(/'([^']+)'/g)].map((m) => must(m[1]))
    const banned = families.filter((family) =>
      BANNED_FONTS.some((b) => family === b || family.startsWith(`${b} `)),
    )
    expect(banned).toEqual([])
  })

  it.each(THEMES)('%s: the light canvas is not warm cream', (theme) => {
    const [l, c, h] = lightOklch(read(`./${theme}.css`), '--color-canvas')
    const cream = l > 0.85 && c > 0.008 && h >= 40 && h <= 100
    expect({ theme, l, c, h, cream }).toMatchObject({ cream: false })
  })

  it.each(THEMES)('%s: the accent is not ember, terracotta or indigo', (theme) => {
    const [, c, h] = lightOklch(read(`./${theme}.css`), '--color-accent')
    const ember = c > 0.08 && h >= 25 && h <= 60
    const indigo = c > 0.08 && h > 262 && h <= 300
    expect({ theme, c, h, ember, indigo }).toMatchObject({ ember: false, indigo: false })
  })
})

it('the exempt legacy themes are exactly the ones kept for compatibility', () => {
  expect(LEGACY).toEqual(['monograph', 'fiesta'])
})
