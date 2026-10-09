import { decisionsMarkdown } from './to-markdown'

describe('decisionsMarkdown', () => {
  it('numbers the two choices and marks the chosen one', () => {
    const page = [
      'Which is clearer?',
      '',
      '<DecisionPair>',
      '<Choice title="A folder per module" chosen={true}>',
      '',
      '```txt',
      'hooks/useSelection/',
      '```',
      '',
      '</Choice>',
      '<Choice title="Flat files">',
      '',
      'Loose files.',
      '',
      '</Choice>',
      '</DecisionPair>',
      '',
      '**Why:** one shape.',
    ].join('\n')
    expect(decisionsMarkdown(page)).toBe(
      [
        'Which is clearer?',
        '',
        '**1. A folder per module** (chosen)',
        '',
        '```txt\nhooks/useSelection/\n```',
        '',
        '**2. Flat files**',
        '',
        'Loose files.',
        '',
        '',
        '**Why:** one shape.',
      ].join('\n'),
    )
  })

  it('dedents the processed Markdown and leaves tags in code alone', () => {
    const processed =
      '<DecisionPair>\n  <Choice title="One" chosen="true">\n    ```ts\n    const a = 1\n    ```\n  </Choice>\n</DecisionPair>\n\n```mdx\n<Choice title="Kept">\n```'
    expect(decisionsMarkdown(processed)).toBe(
      '**1. One** (chosen)\n\n```ts\nconst a = 1\n```\n\n\n```mdx\n<Choice title="Kept">\n```',
    )
  })
})
