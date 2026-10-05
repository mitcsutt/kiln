import { useCallback, useId, useState, type ReactNode } from 'react'
import { useSelector } from '@tanstack/react-form'
import { ErrorIcon, Fieldset, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#components/fields/FieldView'
import { pickErrors } from '#runtime/errors'
import { FieldPresentation } from '#components/fields/FieldPresentation'
import { areErrorsVisible, isQuietMeta } from '#runtime/reveal'
import type { VisibilityMeta } from '#runtime/visibility'
import { formatErrorText, getFormRuntime, isInactive, useResolvedForm } from '#runtime/formRuntime'
import { FieldScope } from '#components/layouts/FieldScope'
import type { ScopeNamesProps } from '#components/layouts/internal/types'

export interface FormSentenceProps extends ScopeNamesProps {
  /** The group's name (a visually hidden legend), e.g. "Reading goal". */
  label: string
  children: ReactNode
}

interface MetaLike extends VisibilityMeta {
  errorMap?: Record<string, unknown>
}

/** One field's visible error, rendered under the sentence and referenced by the control. */
function SentenceError({ name, id }: { name: string; id: string }) {
  const form = useResolvedForm()
  const runtime = getFormRuntime(form)
  // Like a field's own error: no alert after a submit or a quiet scoped attempt.
  const quiet = useSelector(
    form.store,
    (state) =>
      state.submissionAttempts > 0 ||
      isQuietMeta((state.fieldMeta as Record<string, unknown>)[name]),
  )
  const text = useSelector(form.store, (state) => {
    const meta = (state.fieldMeta as Record<string, MetaLike | undefined>)[name]
    if (!meta || isInactive(runtime, name)) return ''
    const first = pickErrors(meta.errorMap)[0]
    if (!first || !areErrorsVisible(runtime, meta, state.submissionAttempts > 0)) return ''
    return formatErrorText(runtime, first)
  })
  if (text === '') return null
  const label = runtime.fields.get(name)?.getLabel()
  return (
    <Text as="p" id={id} size="sm" tone="critical" role={quiet ? undefined : 'alert'}>
      <Inline as="span" gap={1} align="center" wrap={false}>
        <ErrorIcon size="sm" />
        <span>{label ? `${label}: ${text}` : text}</span>
      </Inline>
    </Text>
  )
}

/**
 * Mad-libs (§9.10): fields inline in a sentence. Provides `FieldPresentation { layout: 'inline',
 * labelHidden, errorPlacement: 'external' }`; the group is a `fieldset` with a visually hidden
 * legend; visible error messages are listed under the sentence, each referenced by its control's
 * `aria-describedby`. For short, low-stakes forms only.
 */
function FormSentenceInner({ label, scopeNames, children }: FormSentenceProps) {
  const baseId = useId()
  const [names, setNames] = useState<readonly string[]>([])
  const describedBy = useCallback((name: string) => `${baseId}${name}-error`, [baseId])
  return (
    <FieldScope names={scopeNames} onNamesChange={setNames}>
      <FieldPresentation
        layout="inline"
        labelHidden
        errorPlacement="external"
        describedBy={describedBy}
      >
        <Fieldset legend={label} legendHidden>
          <Stack gap={3}>
            <Text as="div">{children}</Text>
            {names.length > 0 ? (
              <Stack gap={1}>
                {names.map((name) => (
                  <SentenceError key={name} name={name} id={describedBy(name)} />
                ))}
              </Stack>
            ) : null}
          </Stack>
        </Fieldset>
      </FieldPresentation>
    </FieldScope>
  )
}

/**
 * A short form written as a sentence, with its fields inline and its errors listed underneath.
 *
 * @remarks
 * `FormSentence` sets fields inside a sentence. Each field's label is hidden visually but kept for
 * screen readers, and errors are listed below the sentence rather than breaking it, each linked to
 * its field.
 *
 * @example In a schema
 * Text between fields is a `text` content node:
 *
 * ```json
 * {
 *   "layout": "sentence",
 *   "label": "Departure reminder",
 *   "children": [
 *     { "content": "text", "text": "Remind me at " },
 *     { "kind": "time", "name": "time", "label": "Time" },
 *     { "content": "text", "text": "." }
 *   ]
 * }
 * ```
 */
export function FormSentence(props: FormSentenceProps) {
  return (
    <FieldViewListBoundary>
      <FormSentenceInner {...props} />
    </FieldViewListBoundary>
  )
}
