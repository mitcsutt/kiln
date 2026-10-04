import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'

/** A layout region that knows which fields it contains (§9.0). */
export interface ScopeHandle {
  id: string
  /** Static names (schema) ∪ every name ever mounted inside (remembered after it hides). */
  names(): readonly string[]
  /** Called when `names()` changes. */
  subscribe: (cb: () => void) => () => void
  /** Makes the region visible (selects the tab, opens the item, goes to the step). */
  reveal?: () => void
}

/** Internal scope node: a handle plus registration and its parent. */
export interface ScopeNode extends ScopeHandle {
  parent: ScopeNode | null
  /** Registers a mounted field name; returns the unregister function. */
  register(name: string): () => void
  /** Names of fields currently mounted inside. */
  mountedNames(): readonly string[]
  /** @internal */
  setStatic(names: readonly string[] | undefined): void
  /** @internal */
  setReveal(reveal: (() => void) | undefined): void
}

function createScope(id: string, parent: ScopeNode | null): ScopeNode {
  const mounted = new Map<string, number>()
  const seen = new Set<string>()
  let staticNames: readonly string[] = []
  let cache: readonly string[] | null = null
  const listeners = new Set<() => void>()
  const changed = () => {
    cache = null
    for (const listener of [...listeners]) listener()
  }
  const node: ScopeNode = {
    id,
    parent,
    names() {
      cache ??= [...new Set([...staticNames, ...seen])]
      return cache
    },
    mountedNames() {
      return [...mounted.keys()]
    },
    subscribe(cb) {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    register(name) {
      mounted.set(name, (mounted.get(name) ?? 0) + 1)
      const isNew = !seen.has(name)
      seen.add(name)
      if (isNew) changed()
      return () => {
        const count = (mounted.get(name) ?? 1) - 1
        if (count <= 0) mounted.delete(name)
        else mounted.set(name, count)
      }
    },
    setStatic(names) {
      const next = names ?? []
      if (next.length === staticNames.length && next.every((name, i) => name === staticNames[i]))
        return
      staticNames = next
      changed()
    },
    setReveal(reveal) {
      node.reveal = reveal
    },
  }
  return node
}

const ScopeContext = createContext<ScopeNode | null>(null)

export interface FieldScopeProps {
  /** Makes this region visible; focus management calls it before focusing a field inside. */
  reveal?: () => void
  /** Static names (schema mode) governed even before their fields mount. */
  names?: readonly string[]
  /** Called whenever the set of names changes. */
  onNamesChange?: (names: readonly string[]) => void
  children: ReactNode
}

/** Collects the names of fields mounted inside it; nested scopes form the reveal chain (§5.6). */
export function FieldScope({ reveal, names, onNamesChange, children }: FieldScopeProps) {
  const parent = useContext(ScopeContext)
  const id = useId()
  const [node] = useState(() => createScope(id, parent))
  node.setReveal(reveal)
  useLayoutEffect(() => {
    node.setStatic(names)
  }, [node, names])
  useEffect(() => {
    if (!onNamesChange) return
    onNamesChange(node.names())
    return node.subscribe(() => {
      onNamesChange(node.names())
    })
  }, [node, onNamesChange])
  return <ScopeContext.Provider value={node}>{children}</ScopeContext.Provider>
}

/** The nearest scope, or `null`. */
export function useFieldScope(): ScopeHandle | null {
  return useContext(ScopeContext)
}

/** The nearest scope node (internal: bindings register through it). */
export function useScopeNode(): ScopeNode | null {
  return useContext(ScopeContext)
}

/** The scope chain from the outermost scope to `node`. */
export function scopeChain(node: ScopeNode | null): ScopeNode[] {
  const chain: ScopeNode[] = []
  for (let current = node; current; current = current.parent) chain.unshift(current)
  return chain
}
