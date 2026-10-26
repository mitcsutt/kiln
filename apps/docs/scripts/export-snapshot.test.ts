import {
  listDifference,
  normaliseAssets,
  normaliseClassNames,
  pageSummary,
  searchDocuments,
  themeRules,
} from './export-snapshot.ts'

const page = (head: string, body: string) =>
  `<!DOCTYPE html><html lang="en" data-theme="paper" data-mode="system"><head>${head}</head><body>${body}</body></html>`

describe('normalising hashes', () => {
  it('drops the module hash from CSS Module class names, whatever characters it has', () => {
    expect(
      normaliseClassNames(
        'AppShell-module__yJRohW__shell VisuallyHidden-module__Pdu-Wq__hidden visibility-module__VjmdoW__hideAboveLg',
      ),
    ).toBe(
      'AppShell-module__*__shell VisuallyHidden-module__*__hidden visibility-module__*__hideAboveLg',
    )
  })

  it('leaves class names without a module hash alone', () => {
    expect(normaliseClassNames('prose kiln-root')).toBe('prose kiln-root')
  })

  it('drops the name of a hashed build asset, keeping its type', () => {
    expect(
      normaliseAssets(
        '<link href="/_next/static/chunks/0ore98esculfj.css"/><script src="/_next/static/chunks/turbopack-3i_dh67shb9yj.js" async="">',
      ),
    ).toBe('<link href="/_next/static/*.css"/><script src="/_next/static/*.js" async="">')
  })
})

describe('page summaries', () => {
  const html = page(
    '<meta charSet="utf-8"/><title>Button · Kiln</title><meta name="description" content="A button."/>' +
      '<link rel="stylesheet" href="/_next/static/chunks/0ore98esculfj.css"/>' +
      '<script>document.documentElement.dataset.theme="paper"</script>' +
      '<script src="/_next/static/chunks/a.js" async=""></script>',
    '<div class="AppShell-module__yJRohW__shell" id="top"><a href="/docs/ui">UI</a>' +
      '<p>Press <kbd>Enter</kbd>   to send.</p><style>.x{}</style>' +
      '<script>self.__next_f.push([1,"payload"])</script><template><p>hidden</p></template></div>',
  )

  it('reads what a reader gets from the page', () => {
    expect(pageSummary(html)).toEqual({
      title: 'Button · Kiln',
      meta: ['charSet=utf-8', 'content=A button. name=description'],
      ids: ['top'],
      hrefs: ['/docs/ui'],
      classes: ['AppShell-module__*__shell'],
      text: 'UIPress Enter to send.',
      theme: 'paper',
      mode: 'system',
      headScripts: ['document.documentElement.dataset.theme="paper"'],
    })
  })

  it('compares equal when only hashes differ', () => {
    const rehashed = html
      .replace('yJRohW', 'Q1w2E3')
      .replace('0ore98esculfj.css', 'zzzzzzzzzzzz.css')
      .replace('/_next/static/chunks/a.js', '/_next/static/chunks/b.js')
    expect(pageSummary(rehashed)).toEqual(pageSummary(html))
  })

  it('tells apart pages whose text, ids or head script differ', () => {
    const summary = pageSummary(html)
    expect(pageSummary(html.replace('to send', 'to save'))).not.toEqual(summary)
    expect(pageSummary(html.replace('id="top"', 'id="start"'))).not.toEqual(summary)
    expect(
      pageSummary(html.replace('theme="paper"</script>', 'theme="riso"</script>')),
    ).not.toEqual(summary)
  })
})

describe('what a build renders differently each time', () => {
  const code = (tokens: string) =>
    page(
      '',
      `<p>Updated <time dateTime="2026-10-26T22:25:46.699Z">10:25 pm</time></p><pre class="CodeBlock-module__Bpscrq__pre"><code>${tokens}</code></pre>`,
    )
  const split =
    '<span class="CodeBlock-module__Bpscrq__token" data-token="keyword">import</span> <span class="CodeBlock-module__Bpscrq__token" data-token="punctuation">{</span> Grid'
  const whole =
    '<span class="CodeBlock-module__Bpscrq__token" data-token="keyword">import { Grid</span>'

  it('reads a code block as its code, not as markup', () => {
    expect(pageSummary(code(split))).toMatchObject({
      text: 'Updated import { Grid',
      classes: ['CodeBlock-module__*__pre'],
    })
  })

  it('compares equal when a line was tokenised differently or the build clock moved', () => {
    expect(pageSummary(code(whole).replace('10:25', '10:32'))).toEqual(pageSummary(code(split)))
  })

  it('still compares the code', () => {
    expect(pageSummary(code(whole.replace('Grid', 'Stack')))).not.toEqual(pageSummary(code(split)))
  })
})

describe('the search index', () => {
  const index = (docs: Record<string, unknown>) =>
    JSON.stringify({ type: 'advanced', docs: { docs, count: Object.keys(docs).length } })
  const button = { id: '/docs/ui/button', type: 'page', content: 'Button', url: '/docs/ui/button' }
  const card = { url: '/docs/ui/card', content: 'Card', type: 'page', id: '/docs/ui/card' }

  it('reads the documents as a set, whatever ids the indexing order gave them', () => {
    expect(searchDocuments(index({ 1: button, 2: card }))).toEqual(
      searchDocuments(index({ 1: card, 2: button })),
    )
  })

  it('tells apart indexes with different documents', () => {
    expect(searchDocuments(index({ 1: button }))).not.toEqual(
      searchDocuments(index({ 1: { ...button, content: 'Buttons' } })),
    )
  })
})

describe('theme rules', () => {
  const css =
    '@layer kiln.theme{:root,[data-theme=paper]{--a:1}[data-theme=riso]{--a:2;content:"}"}' +
    '@supports (color:lab(0% 0 0)){[data-theme=riso]{--b:lab(1% 0 0)}}}' +
    "/* [data-theme=ledger]{} */.x{color:red}[data-theme='fiesta'] .Card-module__Ab12Cd__card{--c:3}" +
    '[data-theme]{color:var(--a)}@media (width>=40rem){[data-theme=paper]{&.y{--d:4}}}'

  it('groups each rule under the themes its selector names, with its context', () => {
    expect(Object.fromEntries(themeRules(css))).toEqual({
      paper: [
        '@layer kiln.theme :root,[data-theme=paper]{--a:1}',
        '@media (width>=40rem) [data-theme=paper]{&.y{--d:4}}',
      ],
      riso: [
        '@layer kiln.theme @supports (color:lab(0% 0 0)) [data-theme=riso]{--b:lab(1% 0 0)}',
        '@layer kiln.theme [data-theme=riso]{--a:2;content:"}"}',
      ],
      fiesta: ["[data-theme='fiesta'] .Card-module__*__card{--c:3}"],
      '*': ['[data-theme]{color:var(--a)}'],
    })
  })
})

describe('list difference', () => {
  it('counts repeats', () => {
    expect(listDifference(['a', 'a', 'b'], ['a', 'b', 'c'])).toEqual({
      missing: ['a'],
      extra: ['c'],
    })
  })
})
