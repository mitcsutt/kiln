import { useEffect, useMemo, useRef, type MouseEvent, type ReactNode } from 'react'
import { useSelector } from '@tanstack/react-form'
import { Alert, Link, List } from '@mitcsutt/kiln-ui'
import { normaliseErrors, pickErrors } from '#runtime/errors'
import { focusField, sortByDomOrder } from '#runtime/focus'
import {
  formatErrorText,
  getFormRuntime,
  isInactive,
  useResolvedForm,
  type AnyKitForm,
} from '#runtime/formRuntime'
import { shallowEqual } from '#utils/shallow'

export interface ErrorSummaryProps {
  /** Defaults to the form in context. */
  form?: AnyKitForm
  /** Default `messages.errorSummaryTitle` ("There is a problem"). */
  title?: ReactNode
  /** The title's heading level. Default 2. */
  headingLevel?: 2 | 3 | 4
}

const SEP = '\u0000'
const EMPTY: readonly string[] = []

interface Entry {
  name: string
  message: string
}

/**
 * The GOV.UK error summary (§6.4): after a submit attempt with errors, a critical `Alert`
 * (announced once per attempt) listing form errors, then a link per invalid field in DOM order.
 * Links move focus to the control (revealing its tab/step first).
 */
export function ErrorSummary({ form, title, headingLevel = 2 }: ErrorSummaryProps) {
  const resolved = useResolvedForm(form)
  const runtime = getFormRuntime(resolved)
  const alertRef = useRef<HTMLDivElement>(null)

  // The runtime is the form's store outside React, so registering in it is an effect's job.
  // eslint-disable-next-line react-hooks/immutability -- see above
  useEffect(() => {
    const entry = { mounted: true, focus: () => alertRef.current?.focus() }
    runtime.summary = entry
    return () => {
      if (runtime.summary === entry) runtime.summary = null
    }
  }, [runtime])

  const attempts = useSelector(resolved.store, (state) => state.submissionAttempts)
  const signature = useSelector(
    resolved.store,
    (state) => {
      if (state.submissionAttempts === 0) return EMPTY
      const out: string[] = []
      for (const error of normaliseErrors(
        Object.values(state.errorMap as Record<string, unknown>),
      )) {
        out.push(`${SEP}${formatErrorText(runtime, error)}`)
      }
      const fieldMeta = state.fieldMeta as Record<
        string,
        { errorMap?: Record<string, unknown> } | undefined
      >
      for (const [name, meta] of Object.entries(fieldMeta)) {
        if (!meta || isInactive(runtime, name)) continue
        const first = pickErrors(meta.errorMap)[0]
        if (first) out.push(`${name}${SEP}${formatErrorText(runtime, first)}`)
      }
      return out
    },
    { compare: shallowEqual },
  )

  const { formErrors, fieldErrors } = useMemo(() => {
    const formErrors: string[] = []
    const fields: Entry[] = []
    for (const item of signature) {
      const index = item.indexOf(SEP)
      const name = item.slice(0, index)
      const message = item.slice(index + 1)
      if (name === '') formErrors.push(message)
      else fields.push({ name, message })
    }
    const ordered = sortByDomOrder(
      fields.map((entry) => ({
        ...entry,
        element: () => runtime.fields.get(entry.name)?.element() ?? null,
      })),
    )
    return { formErrors: [...new Set(formErrors)], fieldErrors: ordered }
  }, [signature, runtime])

  if (attempts === 0 || (formErrors.length === 0 && fieldErrors.length === 0)) return null

  const messages = runtime.options.messages
  const onLinkClick = (name: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    void focusField(resolved, name)
  }

  return (
    <Alert
      key={attempts}
      ref={alertRef}
      tone="critical"
      tabIndex={-1}
      title={
        <span role="heading" aria-level={headingLevel}>
          {title ?? messages.errorSummaryTitle}
        </span>
      }
    >
      <List as="ol" divided={false} density="compact">
        {formErrors.map((message) => (
          <List.Item key={`form:${message}`}>{message}</List.Item>
        ))}
        {fieldErrors.map(({ name, message }) => {
          const registration = runtime.fields.get(name)
          const label = registration?.getLabel() ?? name
          const text = message === '' ? label : `${label}: ${message}`
          return (
            <List.Item key={name}>
              {registration ? (
                <Link href={`#${registration.id}`} onClick={onLinkClick(name)}>
                  {text}
                </Link>
              ) : (
                text
              )}
            </List.Item>
          )
        })}
      </List>
    </Alert>
  )
}
