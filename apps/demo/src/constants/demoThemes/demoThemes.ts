import type { BuiltInThemeName } from '@mitcsutt/kiln-ui'

/** The four built-in themes the demo switches between, each with its goal (ADR 0045). */
export type DemoTheme = Extract<BuiltInThemeName, 'paper' | 'ledger' | 'flightdeck' | 'riso'>

export interface DemoThemeInfo {
  label: string
  /** The kind of product to choose it for. */
  goal: string
  /** How it should feel. */
  feel: string
}

export const DEMO_THEMES: Record<DemoTheme, DemoThemeInfo> = {
  paper: {
    label: 'Paper',
    goal: 'Admin, internal tools and forms',
    feel: 'Clear and out of the way',
  },
  ledger: { label: 'Ledger', goal: 'Numbers people have to trust', feel: 'Precise and calm' },
  flightdeck: {
    label: 'Flightdeck',
    goal: 'Operating something live',
    feel: 'Alert, fast, in control',
  },
  riso: {
    label: 'Riso',
    goal: 'Products for people, not operators',
    feel: 'Warm, playful, handmade',
  },
}

export const DEMO_THEME_NAMES = Object.keys(DEMO_THEMES) as DemoTheme[]

export function isDemoTheme(value: unknown): value is DemoTheme {
  return typeof value === 'string' && value in DEMO_THEMES
}
