import { defineSite, type SiteConfig } from './config.ts'
import { testConfig } from './fixtures.ts'

/** `testConfig` with `changes` on top, as a site might write it. */
const site = (changes: Record<string, unknown>) => ({ ...testConfig, ...changes }) as SiteConfig

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ADR 0046: defineSite is strict, so a key from an older shape fails loudly instead of being
// ignored.
describe('defineSite', () => {
  it('returns the config as it is', () => {
    const config = site({ theme: { fixed: 'flightdeck', modeToggle: false } })
    expect(defineSite(config)).toBe(config)
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('rejects a key SiteConfig has no place for, naming it', () => {
    expect(() => defineSite(site({ baseUrl: '/' }))).toThrow(
      "kiln-docs: site.config.ts has a key SiteConfig doesn't: baseUrl. Remove it; SiteConfig in @mitcsutt/kiln-docs/config lists the keys a site sets.",
    )
  })

  it('rejects unknown keys at any depth, naming every one', () => {
    expect(() =>
      defineSite(
        site({
          repository: { url: 'https://github.com/example/toolbelt', branch: 'main' },
          nav: { sections: [{ href: '/docs/a', label: 'A', icon: 'a' }], links: [] },
          footer: { text: 'MIT', links: [], copyright: 'me' },
          markdown: { llms: { intro: '', sections: {}, full: true } },
          variants: { router: { label: 'Router', values: {}, default: 'next' } },
        }),
      ),
    ).toThrow(
      "has keys SiteConfig doesn't: repository.branch, nav.sections[0].icon, nav.links, footer.copyright, markdown.llms.full, variants.router.default. Remove them;",
    )
  })

  it("rejects a picker's keys on a fixed theme, and a fixed theme's on a picker", () => {
    expect(() => defineSite(site({ theme: { fixed: 'flightdeck', default: 'paper' } }))).toThrow(
      "doesn't: theme.default.",
    )
    expect(() =>
      defineSite(site({ theme: { picker: ['paper'], default: 'paper', modeToggle: false } })),
    ).toThrow("doesn't: theme.modeToggle.")
  })

  it('rejects a theme that is both fixed and a picker', () => {
    expect(() =>
      defineSite(site({ theme: { fixed: 'flightdeck', picker: ['paper'], default: 'paper' } })),
    ).toThrow('sets both theme.fixed and theme.picker')
  })

  it("rejects a picker that doesn't offer its default", () => {
    expect(() => defineSite(site({ theme: { picker: ['riso'], default: 'paper' } }))).toThrow(
      "kiln-docs: site.config.ts starts the picker on paper, which theme.picker doesn't offer.",
    )
  })

  it("warns about a theme that's neither kiln-ui's nor the site's own", () => {
    defineSite(site({ theme: { fixed: 'acme' } }))
    expect(console.warn).toHaveBeenCalledExactlyOnceWith(
      "kiln-docs: the acme theme isn't one of kiln-ui's. If the site's own stylesheet defines it, list it in theme.custom.",
    )
    vi.mocked(console.warn).mockClear()
    defineSite(site({ theme: { picker: ['paper', 'harbour'], default: 'paper' } }))
    expect(console.warn).toHaveBeenCalledOnce()
  })

  it("takes a theme listed in theme.custom as the site's own", () => {
    defineSite(site({ theme: { fixed: 'acme', custom: ['acme'] } }))
    defineSite(
      site({ theme: { picker: ['paper', 'harbour'], default: 'paper', custom: ['harbour'] } }),
    )
    expect(console.warn).not.toHaveBeenCalled()
  })
})
