/** Props every scope-bearing layout accepts for schema mode. */
export interface ScopeNamesProps {
  /**
   * @internal Schema mode: the field names this region governs, known statically, so counts,
   * `When` pruning and step validation work before (or without) the fields mounting.
   */
  scopeNames?: readonly string[]
}

export type HeadingLevel = 2 | 3 | 4
