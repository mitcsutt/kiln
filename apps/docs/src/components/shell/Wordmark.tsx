import NextLink from 'next/link'
import styles from './Wordmark.module.css'

/**
 * The Kiln wordmark: set in the current theme's display face, so it changes with the
 * theme like everything else. The fired mark is a square that stands on its own shadow.
 */
export function Wordmark() {
  return (
    <NextLink href="/" className={styles.wordmark}>
      <span className={styles.mark} aria-hidden="true" />
      <span className={styles.name}>Kiln</span>
    </NextLink>
  )
}
