import sources from '../../.generated/example-sources.json'

const map = sources as Record<string, string | undefined>

export function getExampleSource(name: string): string {
  const source = map[name]
  if (source === undefined) throw new Error(`No example at examples/${name}.tsx`)
  return source
}
