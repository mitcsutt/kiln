# 0010. One nested tree for docs and Storybook

- **Status:** Accepted, amended by [0036](0036-ai-tooling-page.md)
- **Date:** 2026-10-04

## Context

In the source Storybook, top-level groups were component categories (Actions, Display, Forms…). The hierarchy was flat, and you couldn't tell which package a story belonged to. "Forms" was also ambiguous: it meant both the input controls in `ui` and the form library.

## Decision

The docs sidebar and Storybook share one tree, nested **by package first**:

```
UI/
  Foundations/  Actions/  Inputs/  Layout/  Display/  Navigation/
  Feedback/  Overlays/  Typography/  Themes/  Patterns/
Forms/
  Getting started/  Fields/  Layouts/  Hooks/  Schema/
Tooling/
  ESLint config  Prettier config  TSConfig
```

- `UI/Inputs` is the unbound controls and `*Field` wrappers in `kiln-ui`. At the top level, `Forms` always means `kiln-forms`.
- Story titles follow the tree (`UI/Actions/Button`, `Forms/Fields/TextField`).
- Source folders mirror the groups (`packages/ui/src/components/<group>/<Name>/`).
- A new package adds its own top-level node.

## Consequences

- Moving something in one place means moving it in the other. A check in CI (or a shared manifest) keeps the two trees in sync.
