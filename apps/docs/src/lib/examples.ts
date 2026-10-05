import sources from '../../.generated/example-sources.json'

const map = sources as Record<string, string | undefined>

/**
 * An example's id in the generated registry (`scripts/generate-examples.ts`).
 * `<Example of="Button" name="Hierarchy" />` is the `Hierarchy` export of `Button.examples.tsx`,
 * the file beside `Button`, and `Usage` when `name` is left out; a guide's file is named by its
 * path (`of="forms/getting-started/first-form"`). ADR 0025 has the convention.
 */
export function exampleId({ of, name }: { of?: string; name?: string }): string {
  if (!of) throw new Error('An <Example /> needs `of`: an export, or a guide by its path.')
  return `${of}#${name ?? 'Usage'}`
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
