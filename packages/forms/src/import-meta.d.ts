// `import.meta.env` as Vite/Vitest define it (only the flag this package reads). Matches Vite's
// own declaration shape so apps that also load `vite/client` types merge cleanly.
interface ImportMetaEnv {
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
