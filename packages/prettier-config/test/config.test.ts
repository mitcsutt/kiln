import { format } from 'prettier'
import { describe, expect, it } from 'vitest'

import config from '../index.js'

function formatTs(source: string) {
  return format(source, { ...config, parser: 'typescript' })
}

describe('@mitcsutt/kiln-prettier-config', () => {
  it('matches the style set in ADR 0007', () => {
    expect(config).toEqual({
      semi: false,
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
    })
  })

  it('uses single quotes and no semicolons', async () => {
    expect(await formatTs('const greeting = "hello";\n')).toBe("const greeting = 'hello'\n")
  })

  it('adds trailing commas when wrapping past 100 columns', async () => {
    const source = `call(${['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india'].map((name) => `${name}Value`).join(', ')});\n`
    expect(await formatTs(source)).toBe(
      [
        'call(',
        '  alphaValue,',
        '  bravoValue,',
        '  charlieValue,',
        '  deltaValue,',
        '  echoValue,',
        '  foxtrotValue,',
        '  golfValue,',
        '  hotelValue,',
        '  indiaValue,',
        ')',
        '',
      ].join('\n'),
    )
  })

  it('keeps lines up to 100 columns on one line', async () => {
    const line = `const value = '${'x'.repeat(84)}'`
    expect(line).toHaveLength(100)
    expect(await formatTs(`${line}\n`)).toBe(`${line}\n`)
  })
})
