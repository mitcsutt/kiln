import { useMemo, type Ref, type RefCallback } from 'react'

/** Point several refs (callback or object) at one node. */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as { current: T | null }).current = node
    }
  }
}

/** `mergeRefs`, memoised so the callback (and each ref) stays stable across renders. */
export function useMergedRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo -- the refs themselves are the deps: a changed ref gets a new callback, so React re-attaches the node
  return useMemo(() => mergeRefs(...refs), refs)
}

/** Join id lists for `aria-describedby`, dropping blanks and duplicates. */
export function joinIds(...ids: (string | false | null | undefined)[]): string | undefined {
  const seen = new Set<string>()
  for (const group of ids) {
    if (!group) continue
    for (const id of group.split(/\s+/)) if (id) seen.add(id)
  }
  return seen.size > 0 ? [...seen].join(' ') : undefined
}
