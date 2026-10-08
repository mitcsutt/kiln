# 0035. CodeBlock highlights code through an opt-in Shiki entry

- **Status:** Accepted (amends [0019](0019-docs-site.md))
- **Date:** 2026-10-08

## Context

[0019](0019-docs-site.md) made every code sample on the docs site a kiln-ui `CodeBlock`, "unhighlighted by design", and turned Fumadocs' Shiki pass off. In use, the docs' TSX examples and API signatures read as a flat wall of text, and consumers asked for a `CodeBlock` that can highlight JavaScript, JSX, TypeScript and TSX.

What highlighting has to respect:

- **Themes.** Kiln has six presets, each with light and dark values, and consumers write their own. A fixed highlighter theme (GitHub, Nord) would clash with all of them.
- **Bundle size.** Shiki's grammars are about 185 KB each for JavaScript, JSX, TypeScript and TSX. The main entry must not grow, and a consumer who never highlights must not install or download any of it.
- **Server rendering.** kiln-ui carries no `'use client'`, so `CodeBlock` renders inside a consumer's client component. Highlighting has to work where the consumer's code is: in a server component or at build time, or in the browser.
- **Existing consumers** must see no change unless they ask for highlighting.

Options considered:

- **Fumadocs' `rehype-code`.** It only covers fenced code in MDX. The docs' examples and API signatures come from source, not fences. It also emits Shiki's HTML, which would replace `CodeBlock`'s lines, line numbers and copy button.
- **A small regex highlighter such as sugar-high.** About 1 KB, synchronous, JavaScript and TypeScript only. It is not already in the tree, and it gets less right than a TextMate grammar (generics, JSX inside expressions, template literals).
- **Shiki, as an optional entry.** It's already in the workspace through `fumadocs-core`. Its JavaScript regex engine needs no WebAssembly, and its grammars load one at a time.

## Decision

- **`CodeBlock` takes `tokens`.** It's data, not a function: one array of `{ content, type }` per line, where `type` is one of `keyword`, `string`, `comment`, `constant`, `function`, `type`, `tag`, `attribute` or `punctuation`. Data crosses the server-client boundary, so a server component can highlight and pass the tokens to a client wrapper. Without `tokens`, `CodeBlock` renders exactly as before. `language` stays a display label, and doesn't turn anything on.
- **Token colours come from the theme.** Each type maps to a contract token in `CodeBlock.module.css`: keywords and tags `--color-accent-text`, strings `--tone-positive-text`, constants `--tone-caution-text`, functions and types `--tone-info-text`, attributes and punctuation `--color-ink-muted`, comments `--color-ink-subtle`. Every theme already sets those in both modes, so highlighting follows the theme and the colour mode, a custom theme included, with no new tokens. On a highlighted line the tokens take the line's highlight ink.
- **`@mitcsutt/kiln-ui/highlight`** exports `highlight(code, language)`, which resolves to tokens or, for a language it doesn't know, to `undefined`. It understands `js`, `javascript`, `jsx`, `ts`, `typescript` and `tsx`, in any case. It runs Shiki's core with the JavaScript regex engine and a small theme whose stand-in colours encode the token types, which it reads back from Shiki's output. Shiki, the engine and each grammar are loaded with dynamic `import()` on first use, so importing `highlight` costs almost nothing until it's called.
- **Shiki is an optional peer dependency** (`^4.0.0`) of kiln-ui, and a devDependency for its tests. A consumer who highlights installs `shiki`. Everyone else installs nothing new. The library build keeps it external like every peer.
- **The docs highlight on the server.** The MDX `pre` component, `Example` and `ApiSignature` are async server components that call `highlight` and pass the tokens to the client `CodeBlock`. The site still sends no highlighter to the browser, and Fumadocs' Shiki pass stays off. CSS, JSON and shell blocks stay plain.

## Consequences

- A consumer opts in per block: `tokens={await highlight(source, 'tsx')}` in a server component, or the same call in an effect in the browser, where Shiki and the grammar load as a separate chunk on first use.
- The main entry doesn't change size. The `highlight` entry is a few hundred bytes plus Shiki, which only loads when it runs.
- Adding a language means a grammar loader and an alias in `src/highlight/index.ts`. Each grammar is a separate chunk, so a new language costs nothing until it's used.
- Highlighting is only as good as the scope rules in `highlight`. A grammar scope it doesn't map renders as plain text, which is the safe failure.
- The rendered page carries the tokens in its RSC payload, so a highlighted docs page is somewhat larger than a plain one. That costs less than shipping a highlighter.
