'use client'

import { CodeBlock } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'
import styles from './Preview.module.css'

/**
 * `padded` (default) for most components, `centered` for a lone control or overlay
 * trigger, `bleed` for frames like AppShell that bring their own edges.
 */
export type PreviewLayout = 'padded' | 'centered' | 'bleed'

/**
 * A live example and the code that renders it. `data-kiln-component` stops Prose from
 * styling the example's insides, as it does for any Kiln component.
 */
export function Preview({
  code,
  layout = 'padded',
  children,
}: {
  code: string
  layout?: PreviewLayout
  children: ReactNode
}) {
  return (
    <figure className={styles.preview} data-kiln-component="preview">
      <div className={styles.stage} data-layout={layout}>
        {children}
      </div>
      <CodeBlock code={code} language="TSX" className={styles.code} />
    </figure>
  )
}
