# @mitcsutt/kiln-prettier-config

The shared [Prettier](https://prettier.io/) config for Kiln and the projects that use it: single quotes, no semicolons, trailing commas everywhere, a 100-column print width and 2-space indentation.

## Install

```sh
pnpm add -D @mitcsutt/kiln-prettier-config prettier
```

## Usage

Point Prettier at it from `package.json`:

```json
{
  "prettier": "@mitcsutt/kiln-prettier-config"
}
```

To change an option, extend it from a config file instead:

```js
// prettier.config.js
import kiln from '@mitcsutt/kiln-prettier-config'

export default {
  ...kiln,
  proseWrap: 'always',
}
```

## Docs

Full documentation lives on the [Kiln docs site](https://kiln.mitchellsutton.com).

## Licence

[MIT](LICENSE)
