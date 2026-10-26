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

  it('tags shell commands, flags, keywords and comments', async () => {
    const tokens = typed(
      await highlight(
        "# Install\npnpm add shiki --save-dev\nif [ -f .env ]; then echo 'ready'; fi",
        'bash',
      ),
    )
    expect(tokens).toContainEqual(['# Install', 'comment'])
    expect(tokens).toContainEqual(['pnpm', 'function'])
    expect(tokens).toContainEqual(['--save-dev', 'constant'])
    expect(tokens).toContainEqual(['if', 'keyword'])
    expect(tokens).toContainEqual(["'ready'", 'string'])
  })

  it('tags JSON keys as types, with their quotes, and values by kind', async () => {
    const tokens = typed(await highlight('{ "name": "kiln", "count": 3, "ok": true }', 'json'))
    expect(tokens).toContainEqual(['"name"', 'type'])
    expect(tokens).toContainEqual(['"kiln"', 'string'])
    expect(tokens).toContainEqual(['3', 'constant'])
    expect(tokens).toContainEqual(['true', 'constant'])
  })

  it('tags YAML keys as types, like JSON keys', async () => {
    const tokens = typed(
      await highlight('# CI\njobs:\n  test:\n    runs-on: ubuntu-latest\n    timeout: 10', 'yaml'),
    )
    expect(tokens).toContainEqual(['# CI', 'comment'])
    expect(tokens).toContainEqual(['runs-on', 'type'])
    expect(tokens).toContainEqual(['ubuntu-latest', 'string'])
    expect(tokens).toContainEqual(['10', 'constant'])
  })

  it('tags a diff by line: headers, hunk ranges, added and removed', async () => {
    const lines = await highlight(
      '--- a/theme.css\n+++ b/theme.css\n@@ -1 +1 @@\n-  color: red;\n+  color: blue;\n unchanged',
      'diff',
    )
    const tokens = typed(lines)
    expect(tokens).toContainEqual(['--- a/theme.css', 'keyword'])
    expect(tokens).toContainEqual(['@@ -1 +1 @@', 'function'])
    expect(tokens).toContainEqual(['-  color: red;', 'constant'])
    expect(tokens).toContainEqual(['+  color: blue;', 'string'])
    expect(lines?.[5]).toEqual([{ content: ' unchanged' }])
  })

  it('accepts the usual aliases for the shell, JSON, YAML and diff', async () => {
    for (const language of ['bash', 'sh', 'shell', 'shellscript', 'zsh', 'Bash']) {
      expect(typed(await highlight('# note', language))).toContainEqual(['# note', 'comment'])
    }
    for (const language of ['yaml', 'yml', 'YAML']) {
      expect(typed(await highlight('# note', language))).toContainEqual(['# note', 'comment'])
    }
    expect(typed(await highlight('[1]', 'JSON'))).toContainEqual(['1', 'constant'])
    expect(typed(await highlight('+ added', 'Diff'))).toContainEqual(['+ added', 'string'])
  })

  it('leaves a language it does not know to the caller', async () => {
    await expect(highlight('body { color: red }', 'css')).resolves.toBeUndefined()
  })
})
