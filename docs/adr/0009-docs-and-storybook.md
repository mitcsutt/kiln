# 0009. Fumadocs for public docs, Storybook as workbench

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

The source documents everything in Storybook. That works for development, but it isn't a public docs site. There's also a planned **form/schema builder** that should live inside the docs as a real interactive app. Options considered:

- **Docusaurus**: mature, but its own SPA conventions make an app-like builder awkward.
- **Fumadocs (Next.js)**: docs are ordinary Next.js pages, so a builder is just another route. It has built-in search, MDX and `llms.txt` support.
- **Starlight (Astro)**: excellent docs UX, but React runs in islands, which makes a rich builder second-class.
- **Custom TanStack Start site**: total control, but search, sidebars and the content pipeline would all have to be rebuilt.

## Decision

- **Public docs:** Fumadocs on Next.js in `apps/docs`, built with `kiln-ui` itself. Every component page shows a live preview, a props table generated from the types, and copyable code.
- **Developer workbench:** Storybook in `apps/storybook`, for isolated states, interaction tests and a11y checks. It carries no long-form prose.
- **Hosting (later):** Vercel, at `kiln.mitchellsutton.com`, with Storybook at `/storybook`. Both build as deployable artefacts in this work, and deploying them is a separate step.

## Consequences

- There are two places for examples, so the information architecture (0010) keeps them structurally identical, and docs content is the single source for skills (0011).
- The future builder is an ordinary route that uses `kiln-forms/schema`. It needs no plugin system.
