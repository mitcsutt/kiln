# 0027. Story tests share one page per worker instead of one per file

- **Status:** Accepted (amends [0018](0018-storybook-workbench.md))
- **Date:** 2026-10-05

## Context

[0018](0018-storybook-workbench.md) makes every story a browser test in Vitest browser mode, run once per built-in theme and mode in eight CI jobs. It left Vitest's default isolation on: each story file gets a fresh page, so the iframe, Storybook's runtime, React and the libraries load again for every file. That startup, not the rendering, axe or `play` functions, is most of the run:

- Locally, the 172 story files (620 tests) took 81.0 s isolated, and Vitest put 94% of it down to worker startup. With `--no-isolate` they took 20.5 s with the same 620 passes.
- On `main` (CI run 37265742053), the test step of the eight jobs took 148 to 223 s each.
- The docs examples, co-located with the components as stories, add about 218 files. With isolation each adds about half a second, which roughly doubles every job, from about 4 minutes to about 8. With the examples in, all 353 files ran in 26 s without isolation and in 197 to 235 s with it, again with identical results.

The risk of turning isolation off is state that one story file leaves behind for the next: portals and focus guards left in `body`, body styles such as Radix's `pointer-events: none` and scroll lock, focus, timers, and module-level singletons.

## Decision

The `storybook` project in `apps/storybook/vitest.config.ts` runs with `isolate: false`. Story files run one after another in a shared page per worker. The Node `tree` project and the packages' jsdom unit tests keep Vitest's default isolation.

This is safe because Storybook already cleans up between stories. `runStory` in Storybook's portable stories first runs the previous story's cleanups (unmount, then remove its container), then mounts the next story. Within a file, that's how every story has always handed over to the next. Without isolation the same cleanup runs across a file boundary, because the cleanup list is module state the files now share.

It was checked before switching, on all 620 tests:

- **Isolated against shared, test by test.** Every test had the same result in both modes, in every theme and mode (the eight combinations CI runs).
- **Shuffled order.** Three runs with `--sequence.shuffle` (seeds 1, 42 and 2026) took 18.2 to 20.8 s, and every test had the same result as the isolated run.
- **What reaches the next story.** A temporary probe recorded the page at the start of every story, after the previous story's cleanup: the children of `body`, the attributes on `body` and `html`, the focused element, and pending timers. In both modes, no story started with a node, body style, scroll lock or focus left by an earlier one, including after the Dialog, Sheet, Popover, DropdownMenu and Tooltip stories that leave an overlay open. The only things left were pending timers that don't touch the page. The first is TanStack Form's devtools event client, a module singleton that looks for a devtools bus once a second, gives up after five tries, and throttles its events with a 300 ms timer. The others are Radix's own short timers and the simulated 400 ms submit in the `useFormStatus` story, which settles into the unmounted form. Apart from that submit, all of them are also left between stories inside one file under isolation.
- **Module state.** Kiln's module-level state is constants and `WeakMap` caches keyed by the form or schema object, so nothing carries over between forms. The one exception is `warnOnce` in `forms`, which shows each dev warning once per page instead of once per file. No story checks for warnings.
- **Failures still fail.** A story with an image without `alt`, added for the check, failed its axe test without isolation.

## Consequences

- Each story job runs in about a quarter of the time on a local run, and adding the docs examples no longer doubles it. The eight-job matrix stays.
- A story or component that leaves something behind on unmount can now break a story in another file. That includes nodes appended to `body` outside React, listeners or timers not cleared on unmount, attributes set on `html` or `body`, and stubbed globals. Clean up in the component's unmount or in a cleanup the story's `beforeEach` returns, not by turning isolation back on.
- A failure that shows up only in the full run, or only in some orders, points to such a leak. To find it, rerun with `--sequence.shuffle --sequence.seed=<n>` to reproduce the order, and with `--isolate` to confirm the failure goes away under isolation. For example: `pnpm --filter @mitcsutt/kiln-storybook exec vitest run --project storybook --isolate`.
