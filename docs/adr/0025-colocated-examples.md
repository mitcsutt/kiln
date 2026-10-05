# 0025. Docs examples live beside their code, and each is sliced from its file

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

[0019](0019-docs-site.md) puts every live example in `apps/docs/examples/`, one file per example with a default export, named by its path (`ui/actions/button/hierarchy`). A generator indexes them, and each page renders the component and shows the whole file as its code. That has costs:

- The examples are typechecked and linted, but never run in a browser. Stories get interactions, axe and every theme and mode through `pnpm test:storybook`, so the code readers copy gets the weakest checks.
- Nothing near `Button` shows that its docs examples exist, and some content is written twice, once as a docs example and once as a story.
- One file per example means a helper or fixture used by two examples is copied into both files.

## Decision

**Examples sit beside the export they document.** This partly supersedes 0019's "Every live example is a typed file in `apps/docs/examples/`, named by its path".

- Each public export's examples go in `<Owner>.examples.tsx` beside it (`Button/Button.examples.tsx`, `core/hooks/useAutosave.examples.tsx`), where `<Owner>` is the export's name. Each named export is one example, and `Usage` is the default one. Guides with no single owner (getting started, schema guides, UI patterns) use `packages/<pkg>/src/docs/<guide>/<topic>.examples.tsx`, named by path and split by topic.
- Helpers are plain, unexported top-level declarations, written once and shared by the examples in the file. Example files hold only imports and declarations, import only from packages (no relative or `#` imports), and export only examples. Lint rules scoped to `*.examples.tsx` enforce this.
- Example files carry no `'use client'`, since the packages don't. The docs app's generated registry supplies the client boundary.
- Pages name examples by export, not path (`<Example of="Button" name="Hierarchy" />`), and the docs tree test checks that each one exists. Storybook indexes `*.examples.tsx`, so every docs example runs through interactions, axe and every theme and mode. Library builds exclude `*.examples.tsx`, as they exclude stories.

**The code shown is a slice of the file, not the whole file.** `apps/docs/scripts/extract-example.ts` takes a file and an export name and returns what a reader should copy:

- It starts from the export's declaration and follows every identifier it references, types included, to top-level declarations in the same file, until nothing new is reached. References are resolved with the TypeScript checker (`getSymbolAtLocation`), not by matching names, so a local that shadows a helper doesn't pull the helper in, and a helper that calls another helper brings both.
- The reached declarations are emitted as written, with their comments, in file order. Imports keep only the names the slice uses, and an import left with none is dropped. Prettier formats the result with the repo's config.
- A helper shared by several examples is repeated in each slice. That is intended: every slice works on its own when copied.
- The live preview renders the export itself. Only the code shown is sliced.

**Every slice is typechecked on its own.** The generator writes each slice to `apps/docs/.generated/examples/`, and the docs app's `tsconfig.json` includes that folder, so a slice missing something it needs fails `pnpm typecheck`.

**Rejected:** `// #region` markers, because they don't work out what an example depends on, so they rot; and stories as the docs source, because story bodies depend on `args`, decorators and `#` imports, and extracting them would be lossy.

## Consequences

- The extractor and the slice typecheck land first and run on today's `apps/docs/examples/` files, whose slice of `default` is the whole file minus `'use client'`. The shown code for all 218 examples is unchanged by that step.
- The rest lands in separate pull requests: the Storybook indexer, `<Example of name>` with its tree-test checks, the move out of `apps/docs/examples/` (after which the folder is deleted), and updates to the authoring guides and skills. Until the move, 0019's location stands for existing examples.
- Renaming or un-exporting an export means moving its examples file too. The tree test catches a miss.
- A top-level statement that isn't an import or a declaration, or an `export { … }` list, fails the generator with the file and line, since the slicer can't place it.
