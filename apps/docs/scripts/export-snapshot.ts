/**
 * What `compare-export.ts` compares in a static export of the docs site: the parts a reader or
 * an agent gets, read so that a refactor which serves the same site compares equal (ADR 0045,
 * "Kiln's no-regression check").
 *
 * - Each page's HTML as a summary: its title, meta tags, `id`s, `href`s, class names, visible
 *   text, `data-theme`, `data-mode` and head script. CSS Module class names carry a hash of the
 *   module (`DocsShell-module__NlLXgG__shell`), which changes when a module moves or is edited,
 *   so the hash is normalised. Hashed build assets under `/_next/` aren't compared.
 * - Two things a build renders differently each time are left out of a page's summary: the text
 *   of a `<time datetime>`, which a live example reads from the clock at build time, and the
 *   token spans inside a highlighted code block. Shiki stops tokenising a line after 500 ms, so
 *   under build load a line can come out as one token; the code's text is still compared.
 * - The search index's documents, as a set: their internal ids follow the order pages were
 *   indexed in.
 * - Each theme selector's CSS rules, as a set, wherever the build put them.
 */
import { NodeType, parse, type HTMLElement, type Node } from 'node-html-parser'

/** `DocsShell-module__NlLXgG__shell` → `DocsShell-module__*__shell`. */
export function normaliseClassNames(text: string): string {
  return text.replace(/-module__[\w-]+?__(?=[A-Za-z])/g, '-module__*__')
}

/** `/_next/static/chunks/0ore98esculfj.css` → `/_next/static/*.css`: hashed build assets. */
export function normaliseAssets(text: string): string {
  return text.replace(
    /\/_next\/static\/[\w./-]*?([\w-]+)(\.\w+)(?=["'?\s),\\])/g,
    '/_next/static/*$2',
  )
}

export interface PageSummary {
  title: string
  /** Each `<meta>` as its attributes, `name=value` in name order. */
  meta: string[]
  ids: string[]
  /** Every `href` but the hashed build assets under `/_next/`. */
  hrefs: string[]
  /**
   * Each element's class attribute, in document order, with module hashes normalised. Code
   * tokens (`data-token`) are left out.
   */
  classes: string[]
  /**
   * The text a reader sees: everything outside scripts, styles and templates, with runs of
   * whitespace collapsed. A `<time datetime>`'s text is left out.
   */
  text: string
  theme: string
  mode: string
  /** The inline scripts in `<head>`: the theme script that runs before first paint. */
  headScripts: string[]
}

const HIDDEN = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT'])

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === NodeType.ELEMENT_NODE
}

function visibleText(node: Node, out: string[]): void {
  if (isElement(node)) {
    if (HIDDEN.has(node.tagName)) return
    if (node.tagName === 'TIME' && node.hasAttribute('datetime')) return
    for (const child of node.childNodes) visibleText(child, out)
    return
  }
  if (node.nodeType === NodeType.TEXT_NODE) out.push(node.text)
}

function attributes(element: HTMLElement): string {
  return Object.entries(element.attributes)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, value]) => `${name}=${value}`)
    .join(' ')
}

export function pageSummary(html: string): PageSummary {
  // `<pre>` is parsed as HTML, not kept as raw text, so a code block's text is its code.
  const root = parse(html, {
    comment: false,
    blockTextElements: { script: true, noscript: true, style: true },
  })
  const document = root.querySelector('html')
  const head = root.querySelector('head')
  const body = root.querySelector('body')
  const text: string[] = []
  if (body) visibleText(body, text)
  return {
    title: head?.querySelector('title')?.text ?? '',
    meta: root.querySelectorAll('meta').map(attributes),
    ids: root.querySelectorAll('[id]').map((element) => element.getAttribute('id') ?? ''),
    hrefs: root
      .querySelectorAll('[href]')
      .map((element) => element.getAttribute('href') ?? '')
      .filter((href) => !href.startsWith('/_next/')),
    classes: root
      .querySelectorAll('[class]')
      .filter((element) => !element.hasAttribute('data-token'))
      .map((element) => normaliseClassNames(element.getAttribute('class') ?? '')),
    text: text.join('').replace(/\s+/g, ' ').trim(),
    theme: document?.getAttribute('data-theme') ?? '',
    mode: document?.getAttribute('data-mode') ?? '',
    headScripts: (head?.querySelectorAll('script') ?? [])
      .filter((script) => !script.hasAttribute('src'))
      .map((script) => script.text),
  }
}

/** Sorts an object's keys at every depth, so equal values serialise alike. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical((value as Record<string, unknown>)[key])]),
    )
  }
  return value
}

/**
 * The documents in the exported Orama index (`/api/search`), each as canonical JSON, sorted:
 * the set of things a search can find, without the internal ids the indexing order assigns.
 */
export function searchDocuments(json: string): string[] {
  const index = JSON.parse(json) as { docs?: { docs?: Record<string, unknown> } }
  const docs = index.docs?.docs
  if (!docs) throw new Error('The search index has no documents (`docs.docs`)')
  return Object.values(docs)
    .map((doc) => JSON.stringify(canonical(doc)))
    .sort()
}

/**
 * The CSS rules whose selector names a `data-theme`, grouped by theme (`*` for a bare
 * `[data-theme]`). Each rule is its at-rule context, selector and declarations, with module
 * hashes normalised. Built CSS is minified, so `[data-theme=riso]` loses its quotes.
 */
export function themeRules(css: string): Map<string, string[]> {
  const rules = new Map<string, string[]>()
  const add = (context: string[], selector: string, body: string) => {
    const themes = new Set(
      [...selector.matchAll(/\[data-theme(?:[~|^$*]?=["']?([^"'\]]+)["']?)?\]/g)].map(
        (match) => match[1] ?? '*',
      ),
    )
    for (const theme of themes) {
      const list = rules.get(theme) ?? []
      list.push(normaliseClassNames([...context, `${selector.trim()}{${body.trim()}}`].join(' ')))
      rules.set(theme, list)
    }
  }
  // A small walk over the braces: an at-rule block is context, any other block is a rule, and
  // a block nested inside a rule is part of its body.
  const context: string[] = []
  let rule: { selector: string; body: string; depth: number } | undefined
  let prelude = ''
  const append = (text: string) => {
    if (rule) rule.body += text
    else prelude += text
  }
  for (let index = 0; index < css.length; index++) {
    const char = css.charAt(index)
    if (char === '"' || char === "'") {
      let close = css.indexOf(char, index + 1)
      while (close !== -1 && css.charAt(close - 1) === '\\') close = css.indexOf(char, close + 1)
      const stop = close === -1 ? css.length : close + 1
      append(css.slice(index, stop))
      index = stop - 1
      continue
    }
    if (char === '/' && css.charAt(index + 1) === '*') {
      const end = css.indexOf('*/', index + 2)
      index = end === -1 ? css.length : end + 1
      continue
    }
    if (rule) {
      if (char === '}' && rule.depth === 0) {
        add(context, rule.selector, rule.body)
        rule = undefined
        continue
      }
      if (char === '{') rule.depth++
      if (char === '}') rule.depth--
      rule.body += char
      continue
    }
    if (char === '{') {
      const head = prelude.trim()
      prelude = ''
      if (head.startsWith('@')) context.push(head)
      else rule = { selector: head, body: '', depth: 0 }
    } else if (char === '}') {
      context.pop()
      prelude = ''
    } else if (char === ';') {
      // A statement at-rule (`@import …;`, `@layer a, b;`) or a declaration in `@font-face`.
      prelude = ''
    } else {
      prelude += char
    }
  }
  for (const list of rules.values()) list.sort()
  return rules
}

/** What one sorted list has that the other doesn't, counting repeats. */
export function listDifference(
  expected: readonly string[],
  actual: readonly string[],
): { missing: string[]; extra: string[] } {
  const counts = new Map<string, number>()
  for (const item of expected) counts.set(item, (counts.get(item) ?? 0) + 1)
  const extra: string[] = []
  for (const item of actual) {
    const count = counts.get(item) ?? 0
    if (count) counts.set(item, count - 1)
    else extra.push(item)
  }
  const missing = [...counts].flatMap(([item, count]) => Array<string>(count).fill(item))
  return { missing, extra }
}
