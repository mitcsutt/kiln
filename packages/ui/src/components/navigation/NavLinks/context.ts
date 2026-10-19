import { Children, createContext, isValidElement, type KeyboardEvent, type ReactNode } from 'react'

export type NavLinksOrientation = 'horizontal' | 'vertical'
export type NavLinksSize = 'sm' | 'md'

/** The tree-style arrow keys of a vertical nav with groups. */
export type TreeKeyDown = (event: KeyboardEvent<HTMLElement>) => void

export interface NavLinksContextValue {
  orientation: NavLinksOrientation
  size: NavLinksSize
  /**
   * Where a group puts the arrow-key handler for the nav it's in. Groups bring it, so a nav
   * without them doesn't carry it.
   */
  treeKeysRef?: { current: TreeKeyDown | null }
}

export const NavLinksContext = createContext<NavLinksContextValue>({
  orientation: 'horizontal',
  size: 'md',
})

/** How an item or a nested group tells the groups around it that it's the current page. */
export interface NavLinksGroupContextValue {
  report: (id: string, active: boolean) => void
}

export const NavLinksGroupContext = createContext<NavLinksGroupContextValue | null>(null)

/**
 * Whether any element under `children` is marked `active`, read from the elements themselves, so
 * the server render already knows which groups hold the current page. Items wrapped in your own
 * components are caught on the client, when they report in.
 */
export function holdsActive(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement<{ active?: unknown; children?: ReactNode }>(child)) return false
    return child.props.active === true || holdsActive(child.props.children)
  })
}
