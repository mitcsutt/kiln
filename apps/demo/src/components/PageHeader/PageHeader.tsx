import { Page } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

import { ThemeFit } from '#components/ThemeFit'
import type { DemoTheme } from '#constants/demoThemes'

export interface PageHeaderProps {
  kicker: string
  title: string
  description: string
  /** The theme the page was designed around. */
  theme: DemoTheme
  actions?: ReactNode
}

/** Every page opens the same way: what it is, what to do here, and the theme it was made for. */
export function PageHeader({ kicker, title, description, theme, actions }: PageHeaderProps) {
  return (
    <Page.Header kicker={kicker} title={title} description={description} actions={actions}>
      <ThemeFit theme={theme} />
    </Page.Header>
  )
}
