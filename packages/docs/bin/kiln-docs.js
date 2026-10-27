#!/usr/bin/env node
// The workspace's `kiln-docs` bin, a committed shim so pnpm can link it before anything is built.
// It runs the TypeScript source, which Node loads as it is (ADR 0045). The published package's
// `bin` points at the built CLI in `dist` instead.
import '../src/node/cli.ts'
