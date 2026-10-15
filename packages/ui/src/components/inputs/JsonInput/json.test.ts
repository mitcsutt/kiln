import { formatJson, minifyJson, parseJson, positionOf, tokenizeJson } from './json'

describe('parseJson', () => {
  it('parses valid JSON to the same value as JSON.parse', () => {
    const text = '{"route": "Ridge loop", "stops": [1, 2.5, -3e2], "live": true, "note": null}'
    expect(parseJson(text)).toMatchObject({ ok: true, value: JSON.parse(text) as unknown })
  })

  it.each([
    ['{"a": 1,}', 'Remove this comma: nothing follows it', 1, 8],
    ['[1, 2,\n]', 'Remove this comma: nothing follows it', 1, 6],
    ['{"a": 1\n "b": 2}', 'Expected “,” or “}”, not “"”', 2, 2],
    ['{a: 1}', 'Expected a property name in double quotes', 1, 2],
    ["{'a': 1}", 'Expected a property name in double quotes', 1, 2],
    ["['a']", 'Strings need double quotes', 1, 2],
    ['{"a" 1}', 'Expected “:” after the property name', 1, 6],
    ['{"a": }', 'Expected a value, not “}”', 1, 7],
    ['{"a": 1', 'This object isn’t closed with “}”', 1, 1],
    ['[1, 2', 'This array isn’t closed with “]”', 1, 1],
    ['{"a": "open\n}', 'This string isn’t closed before the end of the line', 1, 7],
    ['"tab\there"', 'Strings can’t contain control characters: escape them', 1, 5],
    ['"\\x"', "“\\x” isn't an escape JSON knows", 1, 2],
    ['"\\u12"', 'A \\u escape needs four hex digits', 1, 2],
    ['01', 'This isn’t a valid number', 1, 1],
    ['1.', 'This isn’t a valid number', 1, 1],
    ['tru', 'Expected a value, not “t”', 1, 1],
    ['{} {}', 'Unexpected text after the JSON value', 1, 4],
    ['   ', 'Expected a value, but the text ends here', 1, 4],
  ])('reports %j as “%s” at %i:%i', (text, message, line, column) => {
    const parsed = parseJson(text)
    expect(parsed).toMatchObject({ ok: false, error: { message, line, column } })
  })

  it('counts lines and columns from 1', () => {
    expect(positionOf('ab\ncd', 4)).toEqual({ line: 2, column: 2 })
    expect(positionOf('ab', 0)).toEqual({ line: 1, column: 1 })
  })
})

describe('formatJson and minifyJson', () => {
  const source = '{"b":[1,{"c":true}],"a":{},"big":12345678901234567890,"price":1.50,"e":[]}'

  it('indents with two spaces by default and keeps numbers as written', () => {
    expect(formatJson(source)).toBe(
      [
        '{',
        '  "b": [',
        '    1,',
        '    {',
        '      "c": true',
        '    }',
        '  ],',
        '  "a": {},',
        '  "big": 12345678901234567890,',
        '  "price": 1.50,',
        '  "e": []',
        '}',
      ].join('\n'),
    )
  })

  it('indents with four spaces or tabs, and sorts keys on request', () => {
    expect(formatJson('{"b":1,"a":[2]}', { indent: 4, sortKeys: true })).toBe(
      '{\n    "a": [\n        2\n    ],\n    "b": 1\n}',
    )
    expect(formatJson('{"a":1}', { indent: 'tab' })).toBe('{\n\t"a": 1\n}')
  })

  it('sorts by the decoded key', () => {
    expect(minifyJson('{"\\u0062":1,"a":2}', { sortKeys: true })).toBe('{"a":2,"\\u0062":1}')
  })

  it('minifies', () => {
    expect(minifyJson('{\n  "a": [1, 2],\n  "b": "x y"\n}')).toBe('{"a":[1,2],"b":"x y"}')
  })

  it('leaves invalid text alone', () => {
    expect(formatJson('{"a": 1,}')).toBeUndefined()
    expect(minifyJson('[')).toBeUndefined()
  })
})

describe('tokenizeJson', () => {
  it('types keys, strings, literals and punctuation, one array per line', () => {
    expect(tokenizeJson('{\n  "id": "INV-2041",\n  "paid": false\n}')).toEqual([
      [{ content: '{', type: 'punctuation' }],
      [
        { content: '  ' },
        { content: '"id"', type: 'type' },
        { content: ':', type: 'punctuation' },
        { content: ' ' },
        { content: '"INV-2041"', type: 'string' },
        { content: ',', type: 'punctuation' },
      ],
      [
        { content: '  ' },
        { content: '"paid"', type: 'type' },
        { content: ':', type: 'punctuation' },
        { content: ' ' },
        { content: 'false', type: 'constant' },
      ],
      [{ content: '}', type: 'punctuation' }],
    ])
  })

  it('still highlights text that is not valid yet, and spells out every line', () => {
    const text = '{"note": "unfinished\n  oops 12,\n\n'
    const lines = tokenizeJson(text)
    expect(lines.map((line) => line.map((token) => token.content).join(''))).toEqual(
      text.split('\n'),
    )
    expect(lines[0]?.at(-1)).toEqual({ content: '"unfinished', type: 'string' })
    expect(lines[1]).toContainEqual({ content: '12', type: 'constant' })
  })
})
