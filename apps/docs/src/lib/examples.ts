import docs from '../../.generated/example-docs.json'
import sources from '../../.generated/example-sources.json'

const map = sources as Record<string, string | undefined>

/** A docs story as `<Examples of>` lists it (`scripts/stories-examples.ts`). */
export interface DocsStory {
  name: string
  title: string
  description: string
  layout?: 'centered' | 'bleed' | 'frame'
}

const lists = docs as Record<string, DocsStory[] | undefined>

/**
 * An example's id in the generated registry (`scripts/generate-examples.ts`).
 * `<Example of="Button" name="Hierarchy" />` is the `Hierarchy` docs story of
 * `Button.stories.tsx`, and `Usage` when `name` is left out. A guide is named by its page path
 * (`of="forms/getting-started/first-form"`). ADR 0028 has the convention.
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

/** The docs stories of a stories file, in file order, by its `of`. */
export function docsStories(of: string): DocsStory[] {
  const list = lists[of]
  if (!list) {
    throw new Error(`<Examples of="${of}" />: no stories file named ${of} has docs stories`)
  }
  return list
}

/** Every stories file with docs stories, by `of`. */
export function docsStoriesOwners(): string[] {
  return Object.keys(lists)
}

/**
 * What `<Examples of="Button" />` stands for: every docs story of the file, in file order, each
 * with its JSDoc caption above it. The first follows the page's lead without a heading, as
 * Storybook's Docs page shows its primary story; each later one gets an `##` heading. The MDX
 * plugin (`src/mdx/remark-examples.ts`) and the Markdown for agents (`toMarkdown`) both expand it.
 */
export function examplesMarkdown(of: string): string {
  return docsStories(of)
    .map(({ name, title, description, layout }, index) =>
      [
        index > 0 ? `## ${title}` : '',
        description,
        `<Example of="${of}" name="${name}"${layout ? ` layout="${layout}"` : ''} />`,
      ]
        .filter(Boolean)
        .join('\n\n'),
    )
    .join('\n\n')
}
