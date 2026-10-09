'use client'

import { Badge, Grid, Text } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'
import styles from './DecisionPair.module.css'

/**
 * Two ways to lay out the same code, side by side, like an eye test: "which is clearer, 1 or 2?"
 * Holds two `<Choice>` blocks, one of them `chosen`. They sit in two columns from `md` up, and
 * stack on a phone with the numbers kept.
 */
export function DecisionPair({ children }: { children: ReactNode }) {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={5} className={styles.pair}>
      {children}
    </Grid>
  )
}

/**
 * One side of a `<DecisionPair>`: a short title and the code or tree it stands for. The chosen
 * side carries the accent keyline and says so in words, so the choice doesn't rest on colour.
 */
export function Choice({
  title,
  chosen = false,
  children,
}: {
  title: string
  chosen?: boolean
  children: ReactNode
}) {
  return (
    <figure className={styles.choice} data-chosen={chosen || undefined}>
      <figcaption className={styles.caption}>
        <span className={styles.number} aria-hidden="true" />
        <Text as="span" weight="strong" className={styles.title}>
          {title}
        </Text>
        <Badge tone={chosen ? 'positive' : 'neutral'} variant={chosen ? 'soft' : 'outline'}>
          {chosen ? 'Chosen' : 'Not chosen'}
        </Badge>
      </figcaption>
      <div className={styles.body}>{children}</div>
    </figure>
  )
}
