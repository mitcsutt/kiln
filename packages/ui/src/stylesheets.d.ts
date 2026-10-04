/*
 * Kiln's stylesheets are imported for their side effects: `import '@mitcsutt/kiln-ui/styles.css'`.
 * TypeScript 6 checks that every side-effect import resolves (`noUncheckedSideEffectImports`),
 * and a stylesheet only resolves through an ambient declaration. These name Kiln's own
 * stylesheets only. A `*.css` wildcard would tie with a bundler's `*.module.css` (TypeScript
 * picks between wildcards by prefix length alone), and could hide the class names of a
 * consumer's CSS Modules. `index.ts` references this file, so it ships beside the declarations.
 */
declare module '@mitcsutt/kiln-ui/styles.css' {}
declare module '@mitcsutt/kiln-ui/themes/*.css' {}
