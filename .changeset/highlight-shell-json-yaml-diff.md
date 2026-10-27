---
'@mitcsutt/kiln-ui': minor
---

`highlight` from `@mitcsutt/kiln-ui/highlight` now understands shell (`bash`, `sh`, `shell`, `shellscript`, `zsh`), `json`, `yaml` (or `yml`) and `diff`, as well as JavaScript and TypeScript. Keys in JSON and YAML are coloured as types, shell flags as constants, and a diff's added lines as strings and removed lines as constants, with its headers and hunk ranges set apart. Each grammar still loads only when a block in that language is first highlighted.
