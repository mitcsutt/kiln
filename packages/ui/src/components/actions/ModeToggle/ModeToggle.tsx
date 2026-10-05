import { forwardRef, type ForwardedRef, type ReactNode } from 'react'
import { useTheme, type ColorMode } from '#theme'
import { MoonIcon, SunIcon, SystemIcon } from '#icons'
import type { Size } from '#utils/tokens'
import { IconButton, type IconButtonProps } from '#components/actions/IconButton'
import { SegmentedControl } from '#components/actions/SegmentedControl'

export type ModeToggleVariant = 'icon' | 'segmented'

const ORDER: readonly ColorMode[] = ['light', 'dark', 'system']

const MODE_META: Record<ColorMode, { label: string; icon: ReactNode }> = {
  light: { label: 'Light', icon: <SunIcon /> },
  dark: { label: 'Dark', icon: <MoonIcon /> },
  system: { label: 'System', icon: <SystemIcon /> },
}

export interface ModeToggleProps {
  /**
   * `icon` (default): one IconButton that cycles light → dark → system.
   * `segmented`: all three modes visible at once, for settings pages and footers.
   */
  variant?: ModeToggleVariant
  size?: Size
  /** Segmented only: show icons without labels (labels stay as accessible names). */
  iconOnly?: boolean
  /** Icon only: button styling, forwarded to IconButton. Default `ghost`. */
  buttonVariant?: IconButtonProps['variant']
  /** Accessible name for the segmented group. Default "Colour mode". */
  'aria-label'?: string
  className?: string
  id?: string
}

/**
 * Switches the colour mode between light, dark and the system setting, through the theme provider.
 *
 * @remarks
 * `ModeToggle` reads and sets the mode from `useTheme()`, so it needs a `ThemeProvider` above it,
 * and it throws without one: a toggle that silently does nothing is worse than a loud error. The
 * choice is remembered, and `themeScript` applies it before the first paint on the next visit.
 *
 * @privateRemarks
 * Reads and sets the colour mode from `useTheme()`. **Requires `<ThemeProvider>`** —
 * like `useTheme`, it throws outside one, because a mode toggle that silently does
 * nothing is worse than a loud error.
 *
 * The icon shows the *current* mode; the accessible name says what it is and what
 * a press will switch to.
 */
export const ModeToggle = forwardRef<HTMLElement, ModeToggleProps>(function ModeToggle(
  {
    variant = 'icon',
    size = 'md',
    iconOnly = false,
    buttonVariant = 'ghost',
    'aria-label': ariaLabel,
    className,
    id,
  },
  ref,
) {
  const { mode, setMode } = useTheme()

  if (variant === 'segmented') {
    return (
      <SegmentedControl
        ref={ref as ForwardedRef<HTMLDivElement>}
        id={id}
        className={className}
        aria-label={ariaLabel ?? 'Colour mode'}
        size={size}
        iconOnly={iconOnly}
        value={mode}
        onValueChange={(v) => {
          setMode(v as ColorMode)
        }}
        options={ORDER.map((m) => ({
          value: m,
          label: MODE_META[m].label,
          icon: MODE_META[m].icon,
        }))}
      />
    )
  }

  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length] ?? 'light'
  return (
    <IconButton
      ref={ref as ForwardedRef<HTMLButtonElement>}
      id={id}
      className={className}
      variant={buttonVariant}
      size={size}
      label={
        ariaLabel ??
        `Colour mode: ${MODE_META[mode].label}. Switch to ${MODE_META[next].label.toLowerCase()}`
      }
      title={`Colour mode: ${MODE_META[mode].label}`}
      icon={MODE_META[mode].icon}
      data-mode-value={mode}
      onClick={() => {
        setMode(next)
      }}
    />
  )
})
