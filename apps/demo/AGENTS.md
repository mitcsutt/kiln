# apps/demo: Slipcast, the Kiln demo app

Slipcast is a small pottery co-op app built with every component and hook the Kiln packages export. It has two jobs:

- **Show Kiln working together inside an app.** The docs site frames it at `/demo` ([ADR 0050](../../docs/adr/0050-demo-app.md)).
- **Act as the first consumer.** It reaches Kiln only through the public entries an app uses, and its folders follow `@mitcsutt/kiln-structure` ([ADR 0037](../../docs/adr/0037-app-structure.md)).

It is private and never published. Everything it shows is mock data behind short `delay()` calls. It makes no requests.

## The coverage rule

**Every component and hook a Kiln package exports appears in this app, on a page where an app would really use it.** `scripts/check-coverage.ts` enforces this. It runs in `pnpm lint`, so CI checks it, and in the pre-commit hook whenever a package's public barrel changes.

- **A component or hook is added to a package:** use it somewhere it belongs. Pick the area whose theme suits it (below), and give it realistic content. A page that lists components to tick them off is not a use.
- **One is removed or renamed:** delete or update its use here. The check also fails when an exemption names an export that no longer exists.
- **There's no honest place for it:** add it to `scripts/coverage-exemptions.ts` with the reason. The check fails when an exempt export is used after all, so the list can't go stale.

The check counts named value imports from `@mitcsutt/kiln-ui`, `@mitcsutt/kiln-ui/highlight`, `@mitcsutt/kiln-forms`, `@mitcsutt/kiln-forms/dnd`, `@mitcsutt/kiln-dnd` and `@mitcsutt/kiln-charts`. It also counts kit shorthand JSX: `<form.TextField>` counts as `FormTextField`. Icons and types are not counted. `node scripts/check-coverage.ts --list` prints where each export is used.

## Areas and themes

Each area is designed around one of the four themes in [ADR 0045](../../docs/adr/0045-four-themes-each-with-a-goal.md). The header switches the whole app, and each page header shows a "Made for" preview of its own theme.

| Area      | Feature folder       | Theme      | What it shows                                                                                            |
| --------- | -------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| Overview  | `features/overview`  | Paper      | A summary drawn from the other features' data                                                            |
| Studio    | `features/studio`    | Paper      | Members table, a stepped join form, settings with autosave and a custom field and layout                 |
| Books     | `features/books`     | Ledger     | Stats, charts, transactions, budget tree table, and an invoice form with a drag-reorder repeater         |
| Kiln room | `features/firings`   | Flightdeck | Live readings on a draggable grid, the loading schedule with every kiln-dnd primitive, and slot booking  |
| Community | `features/community` | Riso       | Workshops with booking, the gallery wall submission, and an open studio planner with a board and schemas |

## Rules

- **No styling of its own.** No `style`, no `className` and no CSS Modules: every pixel comes from the packages. ESLint enforces this. When a page needs a visual the components can't express, that's a gap to fix in the package.
- **Public entries only.** No `src/` deep imports, no `testing` entries and no `@tanstack/react-form`. ESLint enforces this too.
- **kiln-structure applies.** Every module is a folder with a main file of the same name and an `index.ts` of named re-exports. Imports use `#…` subpaths, or `./` for a sibling or a child; `../` is out. The feature graph in the root `eslint.config.js` sets which features can import which.
- **Routes are thin.** A file in `src/routes` declares the TanStack route and its loader, then renders a feature page. `src/routeTree.gen.ts` is generated and gitignored.
- **Mock loading is real loading.** Loaders `await` mock fetchers, and the route's `pendingComponent` shows `PageSkeleton`. Use this for anything a real app would fetch.
- Content follows the story rules in [`packages/ui/AGENTS.md`](../../packages/ui/AGENTS.md): invented but specific, sentence case, no lorem ipsum, no emoji. It must look right in all four themes in both modes.

## Commands

```bash
pnpm --filter @mitcsutt/kiln-demo dev              # http://localhost:5174
pnpm --filter @mitcsutt/kiln-demo lint             # ESLint (structure included) and the coverage check
pnpm --filter @mitcsutt/kiln-demo typecheck
pnpm --filter @mitcsutt/kiln-demo build            # dist/, which the docs build copies to /demo-app/
node apps/demo/scripts/check-coverage.ts --list    # every export and where it's used
```

`?theme=riso` (or `paper`, `ledger`, `flightdeck`) in the URL opens the app in that theme. The docs frame uses it.
