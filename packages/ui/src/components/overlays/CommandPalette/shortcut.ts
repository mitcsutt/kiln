/**
 * Keyboard shortcuts written as `mod+shift+l`: parsing, matching a keydown, and showing them.
 * Not exported from the package.
 *
 * `mod` is Command on Apple platforms and Control elsewhere. The other modifiers are `ctrl`,
 * `alt`, `shift` and `meta`. The key is the last part: a letter, a digit or a key name
 * (`enter`, `escape`, `arrowup`, `backspace`, `plus`…).
 */

export interface ParsedShortcut {
  meta: boolean
  ctrl: boolean
  alt: boolean
  shift: boolean
  key: string
}

export function isApplePlatform(): boolean {
  return typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function parseShortcut(shortcut: string, apple: boolean): ParsedShortcut {
  const parts = shortcut
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
  const parsed: ParsedShortcut = { meta: false, ctrl: false, alt: false, shift: false, key: '' }
  parts.forEach((part, index) => {
    if (index === parts.length - 1) parsed.key = part === 'plus' ? '+' : part
    else if (part === 'mod') parsed[apple ? 'meta' : 'ctrl'] = true
    else if (part === 'ctrl' || part === 'control') parsed.ctrl = true
    else if (part === 'alt' || part === 'option') parsed.alt = true
    else if (part === 'shift') parsed.shift = true
    else if (part === 'meta' || part === 'cmd' || part === 'command') parsed.meta = true
  })
  return parsed
}

/** Whether a keydown is exactly this shortcut: the same key and no other modifier held. */
export function matchesShortcut(event: KeyboardEvent, shortcut: ParsedShortcut): boolean {
  if (
    event.metaKey !== shortcut.meta ||
    event.ctrlKey !== shortcut.ctrl ||
    event.altKey !== shortcut.alt ||
    event.shiftKey !== shortcut.shift
  ) {
    return false
  }
  const key = shortcut.key
  if (event.key.toLowerCase() === key) return true
  // Option and Shift change `event.key` (⌥K is "˚"), so letters and digits also match the code.
  if (/^[a-z]$/.test(key)) return event.code === `Key${key.toUpperCase()}`
  if (/^[0-9]$/.test(key)) return event.code === `Digit${key}`
  return false
}

const KEY_NAMES: Record<string, [glyph: string, spoken: string, aria: string]> = {
  enter: ['↵', 'Enter', 'Enter'],
  escape: ['Esc', 'Escape', 'Escape'],
  esc: ['Esc', 'Escape', 'Escape'],
  backspace: ['⌫', 'Backspace', 'Backspace'],
  delete: ['Del', 'Delete', 'Delete'],
  tab: ['Tab', 'Tab', 'Tab'],
  space: ['Space', 'Space', 'Space'],
  arrowup: ['↑', 'Up arrow', 'ArrowUp'],
  arrowdown: ['↓', 'Down arrow', 'ArrowDown'],
  arrowleft: ['←', 'Left arrow', 'ArrowLeft'],
  arrowright: ['→', 'Right arrow', 'ArrowRight'],
  '+': ['+', 'Plus', 'Plus'],
}

export interface ShortcutLabel {
  /** One entry per key, in order, as printed on the keycap. */
  keys: string[]
  /** Read aloud: "Command Shift L". */
  spoken: string
  /** For `aria-keyshortcuts`: "Meta+Shift+L". */
  aria: string
}

export function describeShortcut(shortcut: string, apple: boolean): ShortcutLabel {
  const parsed = parseShortcut(shortcut, apple)
  const keys: string[] = []
  const spoken: string[] = []
  const aria: string[] = []
  const add = (glyph: string, word: string, name: string) => {
    keys.push(glyph)
    spoken.push(word)
    aria.push(name)
  }
  if (apple) {
    if (parsed.ctrl) add('⌃', 'Control', 'Control')
    if (parsed.alt) add('⌥', 'Option', 'Alt')
    if (parsed.shift) add('⇧', 'Shift', 'Shift')
    if (parsed.meta) add('⌘', 'Command', 'Meta')
  } else {
    if (parsed.ctrl) add('Ctrl', 'Control', 'Control')
    if (parsed.meta) add('Meta', 'Meta', 'Meta')
    if (parsed.alt) add('Alt', 'Alt', 'Alt')
    if (parsed.shift) add('Shift', 'Shift', 'Shift')
  }
  const named = KEY_NAMES[parsed.key]
  if (named) add(...named)
  else if (parsed.key !== '') {
    const name = parsed.key.charAt(0).toUpperCase() + parsed.key.slice(1)
    add(name, name, name)
  }
  return { keys, spoken: spoken.join(' '), aria: aria.join('+') }
}
