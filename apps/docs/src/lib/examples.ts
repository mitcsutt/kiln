import sources from '../../.generated/example-sources.json'

const map = sources as Record<string, string | undefined>

/**
 * An example's id in the generated registry (`scripts/generate-examples.ts`).
 * `<Example of="Button" name="Hierarchy" />` is the `Hierarchy` export of `Button.examples.tsx`,
 * the file beside `Button`, and `Usage` when `name` is left out; a guide's file is named by its
 * path (`of="forms/getting-started/schemas"`). `<Example name="ui/actions/button/hierarchy" />`
 * is `examples/ui/actions/button/hierarchy.tsx`, until it moves beside its code (ADR 0025).
 */
export function exampleId({ of, name }: { of?: string; name?: string }): string {
  if (of) return `${of}#${name ?? 'Usage'}`
  if (!name) throw new Error('An <Example /> needs `of`, or the `name` of a file in examples/.')
  return name
}

export function getExampleSource(id: string): string {
  const source = map[id]
  if (source === undefined) throw new Error(`No example ${id}`)
  return source
}

/** Every example's id. */
export function exampleIds(): string[] {
  return Object.keys(map)
}
