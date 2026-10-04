import { Badge, VisuallyHidden } from '@mitcsutt/kiln-ui'
import { useFormRuntime } from '#core/runtime/formRuntime'
import type { ScopeHandle } from '#core/scope/FieldScope'
import { useScopeErrors } from '#core/scope/useScopeErrors'

/**
 * The visible-error count of a scope, for a tab or accordion trigger: a critical `Badge`
 * (hidden from AT) plus `messages.errorCount(n)` for screen readers. Renders nothing at 0.
 */
export function ErrorBadge({ scope }: { scope: ScopeHandle | null }) {
  const count = useScopeErrors(scope)
  const messages = useFormRuntime().options.messages
  if (count === 0) return null
  return (
    <>
      <Badge tone="critical" size="sm" aria-hidden="true">
        {count}
      </Badge>
      <VisuallyHidden>{` ${messages.errorCount(count)}`}</VisuallyHidden>
    </>
  )
}
