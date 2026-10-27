// A Claude Code PostToolUse hook (.claude/settings.json): after an edit to a package's index.ts,
// run the demo coverage check and hand any failure back to the agent (exit 2 with stderr), so an
// added or removed export is caught while the change is being made, not at commit (ADR 0050).
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const input = JSON.parse(readFileSync(0, 'utf8')) as { tool_input?: { file_path?: string } }
const file = input.tool_input?.file_path ?? ''

if (!/\/packages\/[^/]+\/src\/(?:.*\/)?index\.ts$/.test(file)) process.exit(0)

const check = spawnSync(process.execPath, [join(import.meta.dirname, 'check-coverage.ts')], {
  encoding: 'utf8',
})
if (check.status === 0) process.exit(0)
process.stderr.write(`${check.stdout}${check.stderr}`)
process.exit(2)
