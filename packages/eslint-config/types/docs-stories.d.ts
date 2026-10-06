import type { ESLint, Linter, Rule } from 'eslint'

/** `kiln/docs-story`: a story tagged `docs` is code a reader can copy. */
export declare const docsStory: Rule.RuleModule

/** The plugin that carries `kiln/docs-story`. */
export declare const plugin: ESLint.Plugin

declare const config: Linter.Config[]
export default config
