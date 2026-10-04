export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type HeadingSize =
  'display-lg' | 'display-md' | 'display-sm' | '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm'

/** What each level looks like when no `size` is given. */
export const DEFAULT_HEADING_SIZE: Record<HeadingLevel, HeadingSize> = {
  1: 'display-md',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'md',
}
