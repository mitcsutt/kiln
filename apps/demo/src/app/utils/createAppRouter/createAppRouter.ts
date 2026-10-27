import { createHashHistory, createRouter } from '@tanstack/react-router'

import { routeTree } from '#routeTree'

/**
 * Hash history, so the build is plain static files that work at any path, including inside the
 * docs site. Loaders answer from fixtures after a delay; `pendingMs: 0` shows each page's skeleton
 * straight away, as a real app would on a slow connection.
 */
export function createAppRouter() {
  return createRouter({
    routeTree,
    history: createHashHistory(),
    defaultPendingMs: 0,
    defaultPendingMinMs: 300,
    scrollRestoration: true,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
