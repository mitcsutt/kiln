import { RuleTester } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, it } from 'vitest'

import { docsStory } from '../docs-stories.js'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

/** A stories file: imports, then a meta, then the stories given. */
function stories(body: string, imports = "import { Button, Inline } from '@acme/ui'"): string {
  return [
    "import type { Meta, StoryObj } from '@storybook/react-vite'",
    imports,
    '',
    "const meta = { title: 'Actions/Button', component: Button } satisfies Meta<typeof Button>",
    'export default meta',
    'type Story = StoryObj<typeof meta>',
    '',
    body,
  ].join('\n')
}

const DOCS_STORY = `/** Primary actions are solid. */
export const Hierarchy: Story = {
  tags: ['docs'],
  render: () => (
    <Inline gap={3}>
      <Button>Publish</Button>
    </Inline>
  ),
}`

tester.run('kiln/docs-story', docsStory, {
  valid: [
    { name: 'a docs story with a caption, no args and package imports', code: stories(DOCS_STORY) },
    {
      name: 'a docs story that uses hooks in a named render function',
      code: stories(
        `/** Press it to see it load. */
export const Loading: Story = {
  tags: ['docs'],
  render: function Loading() {
    const [busy, setBusy] = useState(false)
    return <Button loading={busy} onClick={() => setBusy(true)}>Save</Button>
  },
}`,
        "import { Button } from '@acme/ui'\nimport { useState } from 'react'",
      ),
    },
    {
      name: 'a docs story that reaches a top-level helper importing from packages',
      code: stories(
        `function Row() {
  return <Inline gap={3}><Button>Save</Button></Inline>
}

/** A row of buttons. */
export const InARow: Story = { tags: ['docs'], render: () => <Row /> }`,
      ),
    },
    {
      name: 'workbench stories, which the rule leaves alone',
      code: stories(
        `export const Playground: Story = { args: { children: 'Send' } }
export const States: Story = {
  render: (args) => <div style={{ display: 'flex' }}><Grid {...args} /></div>,
}`,
        "import { Button } from '@acme/ui'\nimport { Grid } from '#stories/kit'",
      ),
    },
  ],
  invalid: [
    {
      name: 'the docs tag on the meta',
      code: [
        "import type { Meta } from '@storybook/react-vite'",
        "import { Button } from '@acme/ui'",
        "export default { title: 'Actions/Button', component: Button, tags: ['docs'] } satisfies Meta<typeof Button>",
      ].join('\n'),
      errors: [{ messageId: 'meta' }],
    },
    {
      name: 'a docs story without a caption',
      code: stories(DOCS_STORY.replace('/** Primary actions are solid. */\n', '')),
      errors: [{ messageId: 'jsdoc' }],
    },
    {
      name: 'a docs story with a line comment instead of JSDoc',
      code: stories(DOCS_STORY.replace('/** Primary actions are solid. */', '// Solid.')),
      errors: [{ messageId: 'jsdoc' }],
    },
    {
      name: 'a docs story without a render function',
      code: stories("/** Args only. */\nexport const Solid: Story = { tags: ['docs'], args: {} }"),
      errors: [{ messageId: 'render' }],
    },
    {
      name: 'a docs story whose render takes args',
      code: stories(
        "/** From args. */\nexport const Solid: Story = { tags: ['docs'], render: (args) => <Button {...args} /> }",
      ),
      errors: [{ messageId: 'render' }],
    },
    {
      name: 'a Playground tagged docs',
      code: stories(
        "/** Every prop. */\nexport const Playground: Story = { tags: ['docs'], render: () => <Button>Send</Button> }",
      ),
      errors: [{ messageId: 'playground' }],
    },
    {
      name: 'a docs story that reaches a # import',
      code: stories(
        DOCS_STORY,
        "import { Button } from '@acme/ui'\nimport { Inline } from '#components/Inline'",
      ),
      errors: [{ messageId: 'importPath', data: { name: 'Inline', source: '#components/Inline' } }],
    },
    {
      name: 'a docs story that reaches a relative import through a helper',
      code: stories(
        `function Row() {
  return <Inline gap={3}><Button>Save</Button></Inline>
}

/** A row of buttons. */
export const InARow: Story = { tags: ['docs'], render: () => <Row /> }`,
        "import { Inline } from '@acme/ui'\nimport { Button } from './Button'",
      ),
      errors: [{ messageId: 'importPath', data: { name: 'Button', source: './Button' } }],
    },
    {
      name: 'a docs story that lays out with style',
      code: stories(
        "/** Side by side. */\nexport const Row: Story = { tags: ['docs'], render: () => <div style={{ display: 'flex' }}><Button>Send</Button></div> }",
      ),
      errors: [{ messageId: 'style' }],
    },
  ],
})
