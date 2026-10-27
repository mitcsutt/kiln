import { NotFound as NotFoundCopy } from '../components/NotFound.tsx'
import { DocsShell } from '../components/shell/DocsShell.tsx'

/** `app/not-found.tsx`: the 404 page, in the chrome. */
export function NotFound() {
  return (
    <DocsShell>
      <NotFoundCopy />
    </DocsShell>
  )
}
