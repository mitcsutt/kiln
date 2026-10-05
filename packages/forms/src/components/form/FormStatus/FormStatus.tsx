import { useSelector } from '@tanstack/react-form'
import { StatusDot, Text, type Tone } from '@mitcsutt/kiln-ui'
import {
  getFormRuntime,
  useResolvedForm,
  useRuntimeValue,
  type AnyKitForm,
} from '#runtime/formRuntime'

export type FormStatusKind = 'dirty' | 'saving' | 'saved' | 'error'

export interface FormStatusProps {
  /** Defaults to the form in context. */
  form?: AnyKitForm
  /** Which states to report. Default all. */
  show?: readonly FormStatusKind[]
}

const ALL: readonly FormStatusKind[] = ['dirty', 'saving', 'saved', 'error']
const TONE: Record<FormStatusKind, Tone> = {
  dirty: 'caution',
  saving: 'info',
  saved: 'positive',
  error: 'critical',
}

/**
 * A polite status line. Unsaved changes, saving, saved or couldn't save.
 *
 * @remarks
 * `FormStatus` says what's happening to the form's data in a polite live region, so screen readers
 * hear it without losing their place: "Unsaved changes", "Saving…", "Saved", "Couldn't save". It
 * pairs with {@link useAutosave | `useAutosave`}.
 *
 * @example In a schema
 * ```json
 * { "content": "status" }
 * ```
 *
 * @privateRemarks
 * A polite status line: "Unsaved changes", "Saving…", "Saved", "Couldn't save". Pairs with
 * `useAutosave`. The live region is always rendered so changes are announced.
 */
export function FormStatus({ form, show = ALL }: FormStatusProps) {
  const resolved = useResolvedForm(form)
  const runtime = getFormRuntime(resolved)
  const autosave = useRuntimeValue(runtime, (current) => current.autosave)
  const isDirty = useSelector(resolved.store, (state) => !state.isDefaultValue)
  const messages = runtime.options.messages

  let kind: FormStatusKind | null = null
  if (autosave === 'saving' && show.includes('saving')) kind = 'saving'
  else if (autosave === 'error' && show.includes('error')) kind = 'error'
  else if (isDirty && show.includes('dirty')) kind = 'dirty'
  else if (autosave === 'saved' && show.includes('saved')) kind = 'saved'

  const text =
    kind === 'saving'
      ? messages.saving
      : kind === 'error'
        ? messages.saveFailed
        : kind === 'dirty'
          ? messages.unsavedChanges
          : kind === 'saved'
            ? messages.saved
            : null

  return (
    <Text as="p" size="sm" tone="muted" role="status" data-status={kind ?? undefined}>
      {kind && text ? <StatusDot tone={TONE[kind]} label={text} size="sm" /> : null}
    </Text>
  )
}
