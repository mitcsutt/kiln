---
'@mitcsutt/kiln-ui': minor
---

`CodeBlock` can highlight code. Pass `tokens`, one array per line, and each token is coloured from the theme's own tokens, so highlighting follows every theme in light and dark. The new `@mitcsutt/kiln-ui/highlight` entry turns JavaScript, JSX, TypeScript and TSX into those tokens with Shiki, which is an optional peer dependency: install `shiki` to use it. Shiki and each grammar load only when `highlight` first runs, and the main entry doesn't change. Without `tokens`, `CodeBlock` renders as before.
