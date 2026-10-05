# Kiln Storybook

The developer workbench for `@mitcsutt/kiln-ui` and `@mitcsutt/kiln-forms`. It loads the stories that live next to each component (`<Name>.stories.tsx`), plus the docs examples beside them (`<Owner>.examples.tsx`, [ADR 0026](../../docs/adr/0026-docs-examples-in-storybook.md)), and is never published. Guides and API docs live on the [docs site](https://kiln.mitchellsutton.com). The decisions behind it are in [ADR 0018](../../docs/adr/0018-storybook-workbench.md).

| Command (from the repo root)                             | What it does                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm --filter @mitcsutt/kiln-storybook dev`             | Starts Storybook on port 6006                                                 |
| `pnpm test:storybook`                                    | Runs every story as a browser test: it renders, its `play` passes, axe passes |
| `pnpm turbo run build --filter=@mitcsutt/kiln-storybook` | Builds the static site into `storybook-static/`                               |
| `pnpm --filter @mitcsutt/kiln-storybook check:static`    | Serves that build at `/storybook/` and loads a story in Chromium              |

The tests need Playwright's Chromium once: `pnpm --filter @mitcsutt/kiln-storybook exec playwright install chromium`. They start in Paper, light. Set `STORYBOOK_THEME` (`paper`, `monograph`, `ledger`, `fiesta`) and `STORYBOOK_MODE` (`light`, `dark`) to run them in another theme or mode. CI runs every combination.

`tree.test.ts` keeps story titles on the shared docs tree ([ADR 0010](../../docs/adr/0010-information-architecture.md)), checks that every component has a `Playground` story, and checks that every examples file sits under its owner's title plus `/Examples`.
