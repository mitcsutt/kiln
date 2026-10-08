---
'@mitcsutt/kiln-eslint-config': minor
---

`react` lets an element with `role="region"` take `tabIndex`, so a named scroll region can be focused and scrolled from the keyboard without an `eslint-disable`. Other non-interactive roles still can't.

**Upgrade note:** unused `eslint-disable` comments are errors in this config, so an existing `// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex` above a `role="region"` element now fails lint. Delete the comment; the rule no longer reports there.
