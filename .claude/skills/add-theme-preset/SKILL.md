---
name: add-theme-preset
description: Use when adding a new built-in theme preset to @mitcsutt/kiln-ui in this repository, like Monograph, Ledger or Fiesta. Covers the preset stylesheet, its fonts, the package exports, the build and size config, the theme registry, Storybook, the docs site, CI and the changeset. Not for writing a consumer's own theme outside Kiln.
---

# Add a built-in theme preset

A preset is one CSS file, plus a name in each list that Storybook, the docs and CI use to show every theme. No component file changes. If one has to, the theme needs a component token instead.

## Read first

- [`DESIGN.md`](../../../DESIGN.md) §1, §2 and §3: one idea per theme, the anti-slop rules and the token contract. §4.6 is the short version of these steps.
- [`packages/ui/AGENTS.md`](../../../packages/ui/AGENTS.md), "Themes".
- [ADR 0003](../../../docs/adr/0003-theming-model.md): presets are opt-in stylesheets, and the default stylesheet contains none.

## Steps

1. **Stylesheet.** Copy `packages/ui/src/themes/paper.css` to `src/themes/<name>.css`. Change the selector to `[data-theme='<name>']`, drop the `:where(:root)` default, and set every value. Keep every contract token, in light and dark. `themes/themes.test.ts` fails if the theme sets a token the others neither set nor reset.
2. **Fonts.** New faces go in `src/assets/fonts/` with their OFL licence, plus an `@font-face` file the preset imports (like `tokens/fonts-fiesta.css`), so the base stylesheet doesn't grow.
3. **Package.** Add `./themes/<name>.css` to `exports` (with `kiln-dist` pointing at `./dist/themes/<name>.css` and `default` at the source file, like the other presets) and `publishConfig.exports` in `packages/ui/package.json`, and to the `--exclude-entrypoints` list in its `check:package` script. Add it to the stylesheets in `packages/ui/vite.config.ts` and give it a budget in `packages/ui/size.config.json`.
4. **Registry.** Add the name to `THEMES` and `THEME_META` in `src/theme/themes.ts`, and to the `THEMES` list in `src/themes/themes.test.ts`.
5. **Storybook.** Import the stylesheet in `apps/storybook/.storybook/preview.tsx`, and add a story for it in `packages/ui/src/docs/themes/Themes.stories.tsx`.
6. **Docs.** Import the stylesheet in `apps/docs/src/app/layout.tsx`. Add `apps/docs/content/docs/ui/themes/<name>.mdx` (copy `ledger.mdx`) and list it in that folder's `meta.json`. `ui/index.mdx` says "all four": update the count. Add the new page to the `setup-and-theming` skill's `references` in `apps/docs/src/skills/manifest.ts`, which ships every theme page, then run `pnpm generate:skills`.
7. **CI.** Add the name to the `theme` matrix of the `storybook-test` job in `.github/workflows/ci.yml`.
8. **Docs that list the themes:** DESIGN.md §4, `packages/ui/README.md` and the root `README.md`.
9. **Changeset:** `pnpm changeset`, a `minor` bump for `@mitcsutt/kiln-ui`.

## Check it

```bash
pnpm --filter @mitcsutt/kiln-ui test
pnpm --filter @mitcsutt/kiln-ui check:package
pnpm --filter @mitcsutt/kiln-docs test
STORYBOOK_THEME=<name> STORYBOOK_MODE=light pnpm test:storybook
STORYBOOK_THEME=<name> STORYBOOK_MODE=dark pnpm test:storybook
pnpm size
```

`git grep -il fiesta` lists every place an existing preset is named, if one of the steps above has moved.
