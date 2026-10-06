# Handoff: themes without the second-order AI tells

- **Branch:** `feat/themes-without-ai-tells`
- **Date:** 2026-10-06
- **Status:** implemented, verified locally, committed and pushed. No PR is open yet.

## The task

The owner felt Kiln's themes still read as AI-generated ("AI slop"), even though DESIGN.md already banned the well-known tells. The brief had four parts:

1. Research what makes a website look AI-generated, using articles, forums, GitHub and tools, and write the findings up as a document.
2. Work out what makes a design look clean, distinct and intentional instead.
3. Update the themes based on the findings. They could change as much as needed, as long as they still feel like one family on a page.
4. Look at cheap services and tools, and answer whether Claude Design is better suited to this work than Claude Code.

## What was done

### Research

[`docs/research/ai-design-tells.md`](../research/ai-design-tells.md) has about 120 sources. Its main findings:

- The old tells (Inter, purple, gradient text, icon cards) are no longer what gives a site away. Models told to avoid them converge on a second set: a cream or warm-paper canvas with a serif, near-black with one ember or acid accent, mint with forest green, hard-offset "neo-brutalist" shadows, monospace as decoration, and fonts from the model's own "distinctive" list.
- The old Paper, Monograph, Ledger and Fiesta themes each matched one of those.
- What works is a specific real-world reference for each theme, applied consistently, with a reason for every choice.
- On tools: Claude Design is included in Pro and Max, but it doesn't export design tokens, reviewers report a recognisable house style, and its usage allowance runs out quickly. It is useful for exploring layouts, but Claude Code is the right tool for writing token themes. Fontshare fonts are often not licensed for bundling in an npm package.

### Decision

[ADR 0028](../adr/0028-theme-family-without-ai-tells.md) records it. The owner picked these options as the work went on:

- **Reworked:**
  - **`paper`**: an office that prints for everyone. Grey recycled stock, white sheets and blue-black ink, set in **Golos Text**, with Atkinson Hyperlegible Mono for code. Golos replaced Atkinson Hyperlegible Next because the owner found its slashed zeros noisy, and Atkinson has no plain-zero alternate.
  - **`ledger`**: a columnar accounting pad. Green rules on white, banknote green, red negatives, and figures set in Archivo, condensed through its width axis.
- **Added:**
  - **`flightdeck`**: a glass-cockpit display in B612 and B612 Mono. Cyan is the accent, a selected row is a neutral reverse-video box, and green, amber and red are status. The owner rejected magenta, which was the first draft.
  - **`riso`**: a two-drum risograph zine in fluorescent pink and blue on white, set in Shantell Sans. It uses screen tints instead of borders, and the hard offset appears only on floating layers.
- **Kept unchanged:** `monograph` and `fiesta`, at the owner's request, so the release is not breaking. Their fonts moved out of the base stylesheet into `tokens/fonts-monograph.css`, `fonts-martian-mono.css` and `fonts-fiesta.css`.
- **Enforcement:** [`packages/ui/src/themes/tells.test.ts`](../../packages/ui/src/themes/tells.test.ts) enforces the following on paper, ledger, flightdeck and riso:
  - no banned font family
  - no warm-cream light canvas
  - no ember, terracotta or indigo accent

  Monograph and Fiesta are listed as `LEGACY` and exempt.

- **Docs:** DESIGN.md §2 has a new "Second-order tells" section, and §4 covers all six themes (§4.7 is now "Writing your own theme").
- **Changeset:** `.changeset/themes-without-ai-tells.md`, a minor bump for `@mitcsutt/kiln-ui`.

### Verification (local, last full run before commit)

| Command                                    | Result                                                                                                                                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`                           | pass (8/8)                                                                                                                                                                                                                                              |
| `pnpm test`                                | pass: ui 761, forms 1020 (1 expected fail, 10 skipped), docs pass                                                                                                                                                                                       |
| `pnpm test:react18`                        | pass                                                                                                                                                                                                                                                    |
| `pnpm build`, `check:package`, `size`      | pass                                                                                                                                                                                                                                                    |
| `pnpm check:links`                         | pass (1023 links)                                                                                                                                                                                                                                       |
| `pnpm changeset status`                    | minor bump for `@mitcsutt/kiln-ui`                                                                                                                                                                                                                      |
| `pnpm test:storybook` × 6 themes × 2 modes | all 12 pass, 355 files and 852 tests each                                                                                                                                                                                                               |
| `pnpm lint`                                | the root task failed locally only because of an untracked, locked worktree under `.claude/worktrees/` (all 861 flagged files are there). `eslint . --ignore-pattern '.claude/**'` exits 0 and `prettier --check .` passes. CI won't see that directory. |

## Where it's at, and what's next

1. **Open the PR** from `feat/themes-without-ai-tells`. A suggested title is `feat(ui): add Flightdeck and Riso themes and rework Paper and Ledger away from AI tells`. Flag ADR 0028 in the description, as CLAUDE.md requires for a new ADR.
2. **Watch CI.** The Storybook matrix now has 12 jobs, one per theme and mode.
3. **Visual review.** Before-and-after screenshots were made locally during the work (Storybook stories in every theme and mode) and are not in the repo. To regenerate them, run Storybook (`pnpm --filter @mitcsutt/kiln-storybook dev`) and use the toolbar's theme switcher, including "All themes, side by side".
4. **Known limits, accepted by the owner:**
   - Riso's Shantell Sans has no tabular figures, so its figures don't align in columns.
   - B612 ships a Latin subset only.
   - Golos Text ships no italic, so italics are synthesised.
   - Ledger's red money-column rule is not done, because it needs a new optional token.
5. **Not done:** publishing and deploying, which are separate human steps.
