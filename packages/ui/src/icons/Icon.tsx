import { forwardRef, type SVGProps } from 'react'
import { cx } from '#utils/cx'
import styles from './Icon.module.css'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'inherit'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** `inherit` (default) sizes to the surrounding font-size (1em). */
  size?: IconSize
  /** Accessible name. Omit for decorative icons (the default) — they're aria-hidden. */
  label?: string
}

/**
 * Base for the library's own glyphs. 20×20 grid, stroke weight is a theme token
 * (`--icon-stroke`), so Fiesta icons are chunky and Monograph icons are fine-lined.
 * Consumers may pass any SVG/icon node where a component accepts `icon` props.
 */
export function createIcon(displayName: string, paths: React.ReactNode) {
  const Component = forwardRef<SVGSVGElement, IconProps>(function Icon(
    { size = 'inherit', label, className, ...rest },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cx(styles.icon, className)}
        data-size={size}
        aria-hidden={label ? undefined : true}
        aria-label={label}
        role={label ? 'img' : undefined}
        focusable="false"
        {...rest}
      >
        {paths}
      </svg>
    )
  })
  Component.displayName = displayName
  return Component
}
