# @mitcsutt/kiln-tsconfig

## 0.2.0

### Minor Changes

- b1ea52d: Add a `react-app` preset: `react` and `app` in one. Extending `["app", "react"]` reaches `base.json` twice, which makes esbuild (under Vite and Vitest) print `Base config file "./base.json" forms cycle` on every run; `react-app` reaches it once.
