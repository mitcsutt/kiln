'use client'

import NextLink from 'next/link'
import { useSiteConfig } from '../SiteConfig.tsx'
import styles from './Wordmark.module.css'

/**
 * The site's wordmark: its name set in the current theme's display face, so it changes with the
 * theme like everything else. The fired mark is a square that stands on its own shadow.
 */
export function Wordmark() {
  const site = useSiteConfig()
  return (
    <NextLink href="/" className={styles.wordmark}>
      <span className={styles.mark} aria-hidden="true" />
      <span className={styles.name}>{site.name}</span>
    </NextLink>
  )
}
