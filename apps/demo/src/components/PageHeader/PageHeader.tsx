import { SectionHeader, Stack } from '@mitcsutt/kiln-ui'
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
    <Stack gap={4}>
      <SectionHeader
        level={1}
        size="2xl"
        kicker={kicker}
        title={title}
        description={description}
        actions={actions}
      />
      <ThemeFit theme={theme} />
    </Stack>
  )
}
