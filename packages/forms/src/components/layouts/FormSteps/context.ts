import { createContext, type ReactNode } from 'react'
import type { StandardSchemaV1 } from '@tanstack/react-form'
import type { ScopeHandle } from '#components/layouts/FieldScope'
import type { RegistryEntry } from '#components/layouts/internal/registry'
import type { HeadingLevel } from '#components/layouts/internal/types'

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error'

/** What `useFormSteps()` returns — for custom step chrome. */
export interface StepsApi {
  steps: readonly { value: string; title: ReactNode; status: StepStatus }[]
  current: string
  index: number
  count: number
  isFirst: boolean
  isLast: boolean
  /** Validates the current step; advances if valid (on the last step: submits the form). */
  next(): Promise<boolean>
  back(): void
  /** Goes to a step. With `linear`, going forward validates every step in between. */
  goTo(step: string): Promise<boolean>
}

export interface StepEntry extends RegistryEntry {
  value: string
  title: ReactNode
  scope: ScopeHandle
  schema: StandardSchemaV1 | undefined
  /** Visible errors in the step right now. */
  errors: number
  heading(): HTMLElement | null
}

export interface FormStepsContextValue {
  api: StepsApi
  current: string | undefined
  headingLevel: HeadingLevel
  register: (entry: StepEntry) => () => void
  /** Shows a step without validating (focus handling's `reveal()`). */
  reveal: (step: string) => void
}

export const FormStepsContext = createContext<FormStepsContextValue | null>(null)
