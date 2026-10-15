import { describeShortcut, matchesShortcut, parseShortcut } from './shortcut'

const keydown = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init)

describe('parseShortcut', () => {
  it('reads mod as Command on Apple platforms and Control elsewhere', () => {
    expect(parseShortcut('mod+k', true)).toMatchObject({ meta: true, ctrl: false, key: 'k' })
    expect(parseShortcut('mod+k', false)).toMatchObject({ meta: false, ctrl: true, key: 'k' })
    expect(parseShortcut('Ctrl + Alt + Plus', false)).toMatchObject({
      ctrl: true,
      alt: true,
      key: '+',
    })
  })
})

describe('matchesShortcut', () => {
  const modK = parseShortcut('mod+k', false)

  it('matches the exact keys only', () => {
    expect(matchesShortcut(keydown({ key: 'k', ctrlKey: true }), modK)).toBe(true)
    expect(matchesShortcut(keydown({ key: 'K', ctrlKey: true }), modK)).toBe(true)
    expect(matchesShortcut(keydown({ key: 'k', ctrlKey: true, shiftKey: true }), modK)).toBe(false)
    expect(matchesShortcut(keydown({ key: 'k' }), modK)).toBe(false)
    expect(matchesShortcut(keydown({ key: 'j', ctrlKey: true }), modK)).toBe(false)
  })

  it('falls back to the key code when a modifier changes the character', () => {
    const optionK = parseShortcut('alt+k', true)
    expect(matchesShortcut(keydown({ key: '˚', code: 'KeyK', altKey: true }), optionK)).toBe(true)
    const shift1 = parseShortcut('shift+1', false)
    expect(matchesShortcut(keydown({ key: '!', code: 'Digit1', shiftKey: true }), shift1)).toBe(
      true,
    )
  })
})

describe('describeShortcut', () => {
  it('uses symbols in Apple’s modifier order on a Mac', () => {
    expect(describeShortcut('mod+shift+l', true)).toEqual({
      keys: ['⇧', '⌘', 'L'],
      spoken: 'Shift Command L',
      aria: 'Shift+Meta+L',
    })
  })

  it('spells modifiers out elsewhere, and names special keys', () => {
    expect(describeShortcut('mod+shift+l', false)).toEqual({
      keys: ['Ctrl', 'Shift', 'L'],
      spoken: 'Control Shift L',
      aria: 'Control+Shift+L',
    })
    expect(describeShortcut('alt+enter', false).keys).toEqual(['Alt', '↵'])
    expect(describeShortcut('f2', false).keys).toEqual(['F2'])
  })
})
