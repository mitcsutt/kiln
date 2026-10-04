/*
 * Kiln's stylesheets are imported for their side effects: `import '@mitcsutt/kiln-ui/styles.css'`.
 * TypeScript 6 checks that every side-effect import resolves (`noUncheckedSideEffectImports`),
 * and a stylesheet only resolves through an ambient declaration. Next.js and Vite's client types
 * declare the same module, so this changes nothing where one of them is loaded. `index.ts`
 * references this file, so it ships beside the declarations.
 */
declare module '*.css' {}
