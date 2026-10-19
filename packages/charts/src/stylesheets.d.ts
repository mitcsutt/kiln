/*
 * The stylesheet is imported for its side effects: `import '@mitcsutt/kiln-charts/styles.css'`.
 * TypeScript 6 checks that every side-effect import resolves (`noUncheckedSideEffectImports`), and
 * a stylesheet only resolves through an ambient declaration. `index.ts` references this file, so
 * it ships beside the declarations.
 */
declare module '@mitcsutt/kiln-charts/styles.css' {}
