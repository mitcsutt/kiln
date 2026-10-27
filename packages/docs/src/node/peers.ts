import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** The peers whose installed versions `postbuild` checks: the fumadocs pair (ADR 0045). */
export const CHECKED_PEERS = ['fumadocs-core', 'fumadocs-mdx'] as const

/**
 * Whether `version` is in a `~X.Y.Z` range (the same minor, at least that patch) or is the
 * exact version given. The fumadocs peers use these forms only.
 */
export function inRange(version: string, range: string): boolean {
  const parse = (text: string) => /^(\d+)\.(\d+)\.(\d+)$/.exec(text)?.slice(1).map(Number)
  const tilde = range.startsWith('~')
  const want = parse(tilde ? range.slice(1) : range)
  const have = parse(version)
  if (!want || !have) throw new Error(`kiln-docs: can't compare ${version} with ${range}.`)
  const [major, minor, patch] = want as [number, number, number]
  const [haveMajor, haveMinor, havePatch] = have as [number, number, number]
  if (!tilde) return haveMajor === major && haveMinor === minor && havePatch === patch
  return haveMajor === major && haveMinor === minor && havePatch >= patch
}

/** The version of `name` the site at `root` has installed, as Node would find it from there. */
export function installedVersion(root: string, name: string): string | undefined {
  for (let dir = root; ; dir = dirname(dir)) {
    const manifest = join(dir, 'node_modules', name, 'package.json')
    if (existsSync(manifest)) {
      return (JSON.parse(readFileSync(manifest, 'utf8')) as { version: string }).version
    }
    if (dirname(dir) === dir) return undefined
  }
}

/** kiln-docs' own peer ranges. */
function peerRanges(): Record<string, string> {
  const manifest = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
  ) as { peerDependencies?: Record<string, string> }
  return manifest.peerDependencies ?? {}
}

/**
 * Fails when the site has a fumadocs peer outside the range kiln-docs was tested with. pnpm only
 * warns about an unmet peer, and an untested pair can build a site that's subtly wrong.
 */
export function checkPeers(root: string, ranges = peerRanges()): string[] {
  return CHECKED_PEERS.flatMap((name) => {
    const range = ranges[name]
    if (!range) return []
    const version = installedVersion(root, name)
    if (!version) return [`${name} isn't installed. kiln-docs needs ${name}@${range}.`]
    return inRange(version, range)
      ? []
      : [`${name}@${version} is installed, but kiln-docs is tested with ${name}@${range}.`]
  })
}
