import { extractExample } from './extract-example.ts'
import { docsStoriesOf, readDocsStories, sentenceCase } from './stories-examples.ts'

const file = 'packages/ui/src/components/actions/Button/Button.stories.tsx'

const STORIES = `import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Inline } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { StatesGrid } from '#stories/_kit'

const meta = {
  title: 'UI/Actions/Button',
  component: Button,
  args: { children: 'Send invoice' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** Every prop as a control. */
export const Playground: Story = {}

function Row() {
  return (
    <Inline gap={3}>
      <Button>Publish</Button>
    </Inline>
  )
}

/**
 * One solid button per view: it _is_ the primary action.
 *
 * Secondary actions are \`outline\`.
 */
export const Hierarchy: Story = {
  tags: ['docs'],
  render: () => <Row />,
}

export const States: Story = { render: () => <StatesGrid cells={[]} /> }

/** Press it to see it load. */
export const LoadingAndDisabled: Story = {
  name: 'Loading and disabled states',
  tags: ['docs'],
  render: function LoadingAndDisabled() {
    const [busy, setBusy] = useState(false)
    return <Button loading={busy} onClick={() => setBusy(true)}>Save</Button>
  },
}
`

describe('readDocsStories', () => {
  const { title, stories, examples } = readDocsStories(file, STORIES)

  it('reads only the stories tagged docs, in file order, with their captions', () => {
    expect(title).toBe('UI/Actions/Button')
    expect(stories).toEqual([
      {
        name: 'Hierarchy',
        title: 'Hierarchy',
        description:
          'One solid button per view: it _is_ the primary action.\n\nSecondary actions are `outline`.',
      },
      {
        name: 'LoadingAndDisabled',
        title: 'Loading and disabled states',
        description: 'Press it to see it load.',
      },
    ])
  })

  it('slices each docs story like an examples export, with the helpers it reaches', async () => {
    expect(await extractExample(file, examples, 'Hierarchy')).toBe(
      `import { Button, Inline } from '@mitcsutt/kiln-ui'

function Row() {
  return (
    <Inline gap={3}>
      <Button>Publish</Button>
    </Inline>
  )
}

export function Hierarchy() {
  return <Row />
}
`,
    )
    const loading = await extractExample(file, examples, 'LoadingAndDisabled')
    expect(loading).toContain("import { useState } from 'react'")
    expect(loading).toContain('export function LoadingAndDisabled() {')
    expect(loading).not.toContain('#stories/_kit')
  })

  it('leaves the workbench stories and the meta out', () => {
    expect(examples).not.toMatch(/export const|export default|StatesGrid cells/)
  })

  it('fails on a meta tagged docs, since each docs story is chosen on its own', () => {
    const tagged = STORIES.replace('component: Button,', "component: Button,\n  tags: ['docs'],")
    expect(() => readDocsStories(file, tagged)).toThrow(/tag each docs story 'docs', not the meta/)
  })

  it('fails on a docs story without a render, or with a render that takes args', () => {
    const argsOnly = `${STORIES}\n/** Args. */\nexport const Solid: Story = { tags: ['docs'], args: {} }\n`
    expect(() => readDocsStories(file, argsOnly)).toThrow(/Solid needs a `render` function/)
    const withArgs = `${STORIES}\n/** Args. */\nexport const Solid: Story = { tags: ['docs'], render: (args) => <Button {...args} /> }\n`
    expect(() => readDocsStories(file, withArgs)).toThrow(/Solid's `render` takes args/)
  })
})

describe('docsStoriesOf', () => {
  it('names a stories file beside an export after it', () => {
    expect(docsStoriesOf(file, 'UI/Actions/Button')).toBe('Button')
    expect(
      docsStoriesOf(
        'packages/forms/src/components/fields/FormTextField/FormTextField.stories.tsx',
        'Forms/Fields/TextField',
      ),
    ).toBe('FormTextField')
  })

  it('names a guide by the page path of its title', () => {
    expect(
      docsStoriesOf(
        'packages/forms/src/stories/recipes/AccountSettings.stories.tsx',
        'Forms/Getting started/Account settings',
      ),
    ).toBe('forms/getting-started/account-settings')
    expect(
      docsStoriesOf('packages/ui/src/docs/patterns/Dashboard.stories.tsx', 'UI/Patterns/Dashboard'),
    ).toBe('ui/patterns/dashboard')
  })
})

describe('sentenceCase', () => {
  it('turns an export name into a heading', () => {
    expect(sentenceCase('IconsAndLinks')).toBe('Icons and links')
    expect(sentenceCase('InAForm')).toBe('In a form')
    expect(sentenceCase('ExportAsCSV')).toBe('Export as CSV')
    expect(sentenceCase('Usage')).toBe('Usage')
  })
})
