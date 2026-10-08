import { highlight } from './index'

function typed(lines: Awaited<ReturnType<typeof highlight>>) {
  return (lines ?? []).flat().flatMap((token) => (token.type ? [[token.content, token.type]] : []))
}

describe('highlight', () => {
  it('tags TSX by what each token is, one array per line', async () => {
    const code = [
      "import { Button } from '@mitcsutt/kiln-ui'",
      '',
      '// Saves the draft',
      'export function Save({ count }: { count: number }) {',
      '  return <Button variant="solid" onClick={() => save(42)}>Save</Button>',
      '}',
      '',
    ].join('\n')
    const lines = await highlight(code, 'tsx')
    expect(lines).toHaveLength(6)
    expect(lines?.map((line) => line.map((token) => token.content).join(''))).toEqual(
      code.trimEnd().split('\n'),
    )
    expect(lines?.[1]).toEqual([])
    const tokens = typed(lines)
    expect(tokens).toContainEqual(['import', 'keyword'])
    expect(tokens).toContainEqual(["'@mitcsutt/kiln-ui'", 'string'])
    expect(tokens).toContainEqual(['// Saves the draft', 'comment'])
    expect(tokens).toContainEqual(['Save', 'function'])
    expect(tokens).toContainEqual(['number', 'type'])
    expect(tokens).toContainEqual(['Button', 'type'])
    expect(tokens).toContainEqual(['variant', 'attribute'])
    expect(tokens).toContainEqual(['42', 'constant'])
  })

  it('reads lowercase HTML tags in JSX as tags', async () => {
    expect(typed(await highlight('const a = <div className="row" />', 'jsx'))).toContainEqual([
      'div',
      'tag',
    ])
  })

  it('accepts the usual aliases in any case', async () => {
    for (const language of ['js', 'JavaScript', 'ts', 'TypeScript', 'JSX', 'tsx']) {
      expect(typed(await highlight('const total = 3', language))).toContainEqual([
        'const',
        'keyword',
      ])
    }
  })

  it('leaves a language it does not know to the caller', async () => {
    await expect(highlight('body { color: red }', 'css')).resolves.toBeUndefined()
  })
})
