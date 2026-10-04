import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from 'react'

const counts = new Map<string, number>()

const onRender: ProfilerOnRenderCallback = (id) => {
  counts.set(id, (counts.get(id) ?? 0) + 1)
}

/** Counts commits of its subtree under `id` (React `<Profiler>`; works in dev/test builds). */
export function RenderCounter({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  )
}

/** How many times the `RenderCounter` with this id committed since the last reset. */
export function countRenders(id: string): number {
  return counts.get(id) ?? 0
}

/** Clears every counter (call after mount to count only interaction renders). */
export function resetRenderCounts(): void {
  counts.clear()
}
