import {
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import type { AnyFormApi, StandardSchemaV1 } from '@tanstack/react-form'
import {
  ActionBar,
  Button,
  Heading,
  Stack,
  Stepper,
  Text,
  type StepperStep,
} from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#core/binding/FieldView'
import { SubmitButton } from '#components/SubmitButton'
import { revealFieldErrors } from '#core/binding/useFieldBinding'
import { useIsomorphicLayoutEffect } from '#core/env'
import { focusFirstInvalid, invalidFields, nextFrame } from '#core/runtime/focus'
import { getFormRuntime, isInactive, toFormApi, useResolvedForm } from '#core/runtime/formRuntime'
import { issuePath } from '#core/runtime/paths'
import { FieldScope, useFieldScope } from '#core/scope/FieldScope'
import { useScopeErrors } from '#core/scope/useScopeErrors'
import { useAnnouncer } from '#layouts/internal/announcer'
import { useOrderedRegistry } from '#layouts/internal/registry'
import type { HeadingLevel, ScopeNamesProps } from '#layouts/internal/types'
import {
  FormStepsContext,
  type FormStepsContextValue,
  type StepEntry,
  type StepStatus,
  type StepsApi,
} from '#layouts/FormSteps/context'

export interface FormStepsProps {
  /** Accessible name for the step indicator. */
  label?: string
  /** Controlled current step — deep-linkable (a router search param). */
  value?: string
  defaultValue?: string
  onValueChange?: (step: string) => void
  /** `true` (default): going forward validates every step in between. */
  linear?: boolean
  /** `'auto'` (default) renders Back / Next / Submit in an `ActionBar`; `'none'` for custom chrome (`useFormSteps`). */
  nav?: 'auto' | 'none'
  backLabel?: string
  nextLabel?: string
  submitLabel?: string
  /** Heading level of each step's title. Default 3. */
  headingLevel?: HeadingLevel
  /** Below this breakpoint the Stepper collapses to one line: `messages.stepCompact` + the step title. */
  compactBelow?: 'sm' | 'md'
  children: ReactNode
}

export interface FormStepProps extends ScopeNamesProps {
  value: string
  title: ReactNode
  description?: ReactNode
  /** Extra validation for this step; issues are filtered to this step's fields. */
  schema?: StandardSchemaV1
  children: ReactNode
}

const NON_TEXT_INPUTS = new Set(['button', 'submit', 'reset', 'image', 'checkbox', 'radio', 'file'])

interface Latest {
  entries: readonly StepEntry[]
  current: string | undefined
  index: number
  linear: boolean
  controlled: boolean
  onValueChange: ((step: string) => void) | undefined
}

/**
 * Sets this step's schema issues in the `onSubmit` slot of its fields (and clears the ones it
 * set before). A field-level `onSubmit` error already in the slot is left alone.
 */
async function applyStepSchema(
  api: AnyFormApi,
  schema: StandardSchemaV1,
  names: readonly string[],
  own: Map<string, string>,
): Promise<void> {
  const result = await schema['~standard'].validate(api.state.values)
  const byName = new Map<string, string>()
  for (const issue of result.issues ?? []) {
    const path = issuePath(issue)
    if (names.includes(path) && !byName.has(path)) byName.set(path, issue.message)
  }
  for (const name of names) {
    const message = byName.get(name)
    const previous = own.get(name)
    if (message === undefined && previous === undefined) continue
    // An object, so the write inside the updater isn't narrowed away.
    const update = { applied: false }
    api.setFieldMeta(name, (prev) => {
      const slot: unknown = prev.errorMap.onSubmit
      if (slot !== undefined && slot !== previous) return prev
      update.applied = true
      return { ...prev, errorMap: { ...prev.errorMap, onSubmit: message } }
    })
    if (message === undefined || !update.applied) own.delete(name)
    else own.set(name, message)
  }
}

/**
 * A multi-step form (§9.8): a `Stepper` (`ol`, `aria-current="step"`), one step visible at a
 * time (the others mounted but `hidden`), and Back / Next / Submit. **Next** validates the
 * current step's fields (+ its `schema`), shows their errors and focuses the first invalid
 * one; when valid it moves to the next step, focuses its heading and announces it. The last
 * step's primary action submits the form. Steps register on mount, so a step wrapped in
 * `<When>` drops out of the sequence while hidden.
 */
function FormStepsRootInner({
  label,
  value,
  defaultValue,
  onValueChange,
  linear = true,
  nav = 'auto',
  backLabel,
  nextLabel,
  submitLabel,
  headingLevel = 3,
  compactBelow,
  children,
}: FormStepsProps) {
  const form = useResolvedForm()
  const runtime = getFormRuntime(form)
  const messages = runtime.options.messages
  const [entries, register] = useOrderedRegistry<StepEntry>()
  const [inner, setInner] = useState(defaultValue)
  const [announcer, announce] = useAnnouncer()
  const schemaErrors = useRef(new Map<string, string>())

  const controlled = value !== undefined
  const known = inner !== undefined && entries.some((entry) => entry.value === inner)
  const current = controlled ? value : known ? inner : (entries[0]?.value ?? inner)
  const index = entries.findIndex((entry) => entry.value === current)
  const count = entries.length

  const latest = useRef<Latest>({ entries, current, index, linear, controlled, onValueChange })
  useIsomorphicLayoutEffect(() => {
    latest.current = { entries, current, index, linear, controlled, onValueChange }
  })

  const commit = useCallback((next: string) => {
    if (next === latest.current.current) return
    flushSync(() => {
      if (!latest.current.controlled) setInner(next)
      latest.current.onValueChange?.(next)
    })
  }, [])

  /**
   * After moving: focus the new step's heading and announce "Step n of m: title". `commit`
   * flushes synchronously, so the step is normally visible already; a controlled host that
   * updates `value` later (a router) gets one frame.
   */
  const arrive = useCallback(
    async (step: string) => {
      const visible = () => {
        const entry = latest.current.entries.find((candidate) => candidate.value === step)
        const heading = entry?.heading()
        return Boolean(heading && !heading.closest('[hidden]'))
      }
      if (!visible()) await nextFrame()
      const all = latest.current.entries
      const position = all.findIndex((entry) => entry.value === step)
      const entry = all[position]
      if (!entry) return
      const heading = entry.heading()
      heading?.focus()
      const title = heading?.textContent.replace(/\s+/g, ' ').trim() ?? step
      announce(messages.stepOf(position + 1, all.length, title))
    },
    [announce, messages],
  )

  const validateStep = useCallback(
    async (entry: StepEntry): Promise<boolean> => {
      const api = toFormApi(form)
      const names = entry.scope
        .names()
        .filter((name) => runtime.fields.has(name) && !isInactive(runtime, name))
      // eslint-disable-next-line @typescript-eslint/await-thenable -- validateField returns a promise while async validators run
      await Promise.all(names.map((name) => api.validateField(name, 'submit')))
      // A scoped submit attempt: these errors become visible under any visibility policy, so
      // Next never blocks on an error the user can't see. Quiet: like a submit, no
      // per-field alerts — focus moves to the first invalid field, which reads its error.
      revealFieldErrors(api, names, { quiet: true })
      if (entry.schema) await applyStepSchema(api, entry.schema, names, schemaErrors.current)
      if (invalidFields(form, entry.scope).length === 0) return true
      await focusFirstInvalid(form, entry.scope)
      return false
    },
    [form, runtime],
  )

  const next = useCallback(async (): Promise<boolean> => {
    const { entries: all, index: at } = latest.current
    const entry = all[at]
    if (!entry) return false
    if (!(await validateStep(entry))) return false
    const now = latest.current.entries
    const target = now[now.findIndex((candidate) => candidate.value === entry.value) + 1]
    if (!target) {
      await toFormApi(form).handleSubmit()
      return true
    }
    commit(target.value)
    await arrive(target.value)
    return true
  }, [arrive, commit, form, validateStep])

  const back = useCallback(() => {
    const { entries: all, index: at } = latest.current
    const target = all[at - 1]
    if (!target) return
    commit(target.value)
    void arrive(target.value)
  }, [arrive, commit])

  const goTo = useCallback(
    async (step: string): Promise<boolean> => {
      const { entries: all, index: at, linear: isLinear } = latest.current
      const target = all.findIndex((entry) => entry.value === step)
      if (target < 0) return false
      if (target === at) return true
      if (isLinear && target > at) {
        for (let i = Math.max(at, 0); i < target; i += 1) {
          const entry = all[i]
          if (entry && !(await validateStep(entry))) return false
        }
      }
      commit(step)
      await arrive(step)
      return true
    },
    [arrive, commit, validateStep],
  )

  const steps = useMemo(
    () =>
      entries.map((entry, i) => {
        const status: StepStatus =
          entry.errors > 0 ? 'error' : i === index ? 'current' : i < index ? 'complete' : 'upcoming'
        return { value: entry.value, title: entry.title, status }
      }),
    [entries, index],
  )

  const api = useMemo<StepsApi>(
    () => ({
      steps,
      current: current ?? '',
      index: Math.max(index, 0),
      count,
      isFirst: index <= 0,
      isLast: index >= count - 1,
      next,
      back,
      goTo,
    }),
    [steps, current, index, count, next, back, goTo],
  )

  const context = useMemo<FormStepsContextValue>(
    () => ({ api, current, headingLevel, register, reveal: commit }),
    [api, current, headingLevel, register, commit],
  )

  // `status` stays progress (so the current step keeps `aria-current`); errors are `invalid`.
  const stepperSteps = useMemo<StepperStep[]>(
    () =>
      steps.map((step, i) => ({
        value: step.value,
        label: step.title,
        status: i === index ? 'current' : i < index ? 'complete' : 'upcoming',
        invalid: step.status === 'error',
      })),
    [steps, index],
  )
  const statusLabels = useMemo(
    () => ({ complete: messages.stepComplete, error: messages.stepError }),
    [messages],
  )
  const formatCompact = useCallback(
    (at: number, total: number, stepLabel: ReactNode): ReactNode => (
      <>
        {messages.stepCompact(at + 1, total)} · {stepLabel}
      </>
    ),
    [messages],
  )

  // Enter in a text input on a non-final step means Next, not "submit the whole form".
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' || event.defaultPrevented || api.isLast) return
    const target = event.target
    if (!(target instanceof HTMLInputElement) || NON_TEXT_INPUTS.has(target.type)) return
    event.preventDefault()
    void next()
  }

  return (
    <FormStepsContext.Provider value={context}>
      <Stack gap={6}>
        {count > 0 ? (
          <Stepper
            steps={stepperSteps}
            value={current ?? ''}
            onStepSelect={(step) => void goTo(step)}
            statusLabels={statusLabels}
            compactBelow={compactBelow}
            formatCompact={formatCompact}
            aria-label={label}
          />
        ) : null}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- catches Enter bubbling up from the step's fields (Enter means Next); the div itself isn't interactive */}
        <div onKeyDown={onKeyDown}>{children}</div>
        {nav === 'auto' && count > 0 ? (
          <ActionBar align={index <= 0 ? 'end' : 'between'}>
            {index <= 0 ? null : (
              <Button variant="outline" tone="neutral" onClick={back}>
                {backLabel ?? messages.back}
              </Button>
            )}
            {index >= count - 1 ? (
              <SubmitButton>{submitLabel ?? messages.submit}</SubmitButton>
            ) : (
              <Button onClick={() => void next()}>{nextLabel ?? messages.next}</Button>
            )}
          </ActionBar>
        ) : null}
        {announcer}
      </Stack>
    </FormStepsContext.Provider>
  )
}

function useStepsContext(): FormStepsContextValue {
  const context = useContext(FormStepsContext)
  if (!context)
    throw new Error('[@mitcsutt/kiln-forms] <FormSteps.Step> must be rendered inside <FormSteps>.')
  return context
}

function StepPanel({
  value,
  title,
  description,
  schema,
  children,
}: Omit<FormStepProps, 'scopeNames'>) {
  const { current, register, headingLevel } = useStepsContext()
  const scope = useFieldScope()
  if (!scope) throw new Error('[@mitcsutt/kiln-forms] FormStep: missing scope.')
  const errors = useScopeErrors(scope)
  const panelRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = useId()
  useIsomorphicLayoutEffect(
    () =>
      register({
        key: value,
        value,
        title,
        scope,
        schema,
        errors,
        element: () => panelRef.current,
        heading: () => headingRef.current,
      }),
    [register, value, title, scope, schema, errors],
  )
  return (
    <Stack
      as="section"
      ref={panelRef}
      gap={5}
      hidden={current !== value}
      aria-labelledby={headingId}
    >
      <Stack gap={2}>
        <Heading ref={headingRef} level={headingLevel} id={headingId} tabIndex={-1}>
          {title}
        </Heading>
        {description != null ? <Text tone="muted">{description}</Text> : null}
      </Stack>
      {children}
    </Stack>
  )
}

/** One step: a `section` with a focusable heading, scoped for validation, counts and reveal. */
export function FormStep({ scopeNames, ...props }: FormStepProps) {
  const { reveal } = useStepsContext()
  const value = props.value
  const revealStep = useCallback(() => {
    reveal(value)
  }, [reveal, value])
  return (
    <FieldScope reveal={revealStep} names={scopeNames}>
      <StepPanel {...props} />
    </FieldScope>
  )
}

function FormStepsRoot(props: FormStepsProps) {
  return (
    <FieldViewListBoundary>
      <FormStepsRootInner {...props} />
    </FieldViewListBoundary>
  )
}

export const FormSteps = Object.assign(FormStepsRoot, { Step: FormStep })
