import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { ESLint } from 'eslint'

import kilnStructure from '../eslint.js'
import type { KilnStructureOptions } from '../types/eslint.js'

const FIXTURES = path.join(import.meta.dirname, 'fixtures')

/** The feature graph and groups both fixture apps declare. */
export const APP_OPTIONS = {
  features: { dashboard: ['contacts', 'campaigns'], campaigns: ['contacts'], contacts: [] },
  groups: { components: ['sections'] },
} satisfies KilnStructureOptions

export interface LintMessage {
  file: string
  line: number
  ruleId: string | null
  message: string
}

export interface LintOutcome {
  messages: LintMessage[]
  /** Error count per rule, for exact assertions. */
  counts: Record<string, number>
}

const tempDirs: string[] = []

/** Removes every temporary copy made by `lintApp`. */
export function cleanUp() {
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
}

/** Rewrites every text file under `dir` with `edit`. */
export function rewriteFiles(dir: string, edit: (text: string) => string) {
  for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue
    const file = path.join(entry.parentPath, entry.name)
    fs.writeFileSync(file, edit(fs.readFileSync(file, 'utf8')))
  }
}

/**
 * Copies a fixture app, lays an invalid case's files over it, and lints its source folder with
 * the preset. Each run gets its own copy, so project-structure's error cache can't leak between
 * cases.
 */
export async function lintApp(
  app: 'tanstack-app' | 'next-app',
  options: Omit<KilnStructureOptions, 'rootDir'>,
  overlay?: string,
  prepare?: (dir: string) => void,
): Promise<LintOutcome> {
  // The real path: macOS's temp folder is a symlink, and resolved imports use real paths.
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'kiln-structure-')))
  tempDirs.push(dir)
  fs.cpSync(path.join(FIXTURES, app), dir, { recursive: true })
  if (overlay) fs.cpSync(path.join(FIXTURES, 'invalid', overlay), dir, { recursive: true })
  prepare?.(dir)

  const eslint = new ESLint({
    cwd: dir,
    overrideConfigFile: true,
    overrideConfig: kilnStructure({ ...options, rootDir: dir }),
  })
  const results = await eslint.lintFiles([options.srcDir ?? 'src'])
  const messages = results.flatMap((result) =>
    result.messages.map((message) => ({
      file: path.relative(dir, result.filePath),
      line: message.line,
      ruleId: message.ruleId,
      message: message.message,
    })),
  )
  const counts: Record<string, number> = {}
  for (const { ruleId } of messages)
    counts[ruleId ?? 'fatal'] = (counts[ruleId ?? 'fatal'] ?? 0) + 1
  return { messages, counts }
}
