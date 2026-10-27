import { CalendarIcon, TargetIcon, TrendingUpIcon, UsersIcon, ZapIcon } from '@mitcsutt/kiln-ui'
import type { ComponentType } from 'react'

import type { DemoTheme } from '#constants/demoThemes'

export interface NavPage {
  to: string
  label: string
}

export interface NavArea {
  id: string
  label: string
  /** The shortest label, for the phone's bottom bar. */
  short: string
  icon: ComponentType
  /** The theme the area was designed around (ADR 0045). */
  theme: DemoTheme
  pages: NavPage[]
}

/** Every page in the app, grouped by area, in the order the navigation shows them. */
export const NAV_AREAS: NavArea[] = [
  {
    id: 'overview',
    label: 'Overview',
    short: 'Home',
    icon: TargetIcon,
    theme: 'paper',
    pages: [{ to: '/', label: 'Today at the studio' }],
  },
  {
    id: 'studio',
    label: 'Studio admin',
    short: 'Studio',
    icon: UsersIcon,
    theme: 'paper',
    pages: [
      { to: '/studio', label: 'Members' },
      { to: '/studio/join', label: 'Membership application' },
      { to: '/studio/settings', label: 'Settings' },
    ],
  },
  {
    id: 'books',
    label: 'Books',
    short: 'Books',
    icon: TrendingUpIcon,
    theme: 'ledger',
    pages: [
      { to: '/books', label: 'Ledger' },
      { to: '/books/new-invoice', label: 'New invoice' },
    ],
  },
  {
    id: 'firings',
    label: 'Kiln room',
    short: 'Kilns',
    icon: ZapIcon,
    theme: 'flightdeck',
    pages: [
      { to: '/firings', label: 'Live firings' },
      { to: '/firings/schedule', label: 'Loading schedule' },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    short: 'Events',
    icon: CalendarIcon,
    theme: 'riso',
    pages: [
      { to: '/community', label: 'Workshops and gallery' },
      { to: '/community/plan', label: 'Open studio planning' },
    ],
  },
]
