import { useContext } from 'react'
import { FormStepsContext, type StepsApi } from '#layouts/FormSteps/context'

/** The steps API inside `FormSteps` — for custom chrome (§9.8). */
export function useFormSteps(): StepsApi {
  const context = useContext(FormStepsContext)
  if (!context)
    throw new Error('[@mitcsutt/kiln-forms] useFormSteps() must be called inside <FormSteps>.')
  return context.api
}

/** The steps API, or `null` outside `FormSteps`. */
export function useOptionalFormSteps(): StepsApi | null {
  return useContext(FormStepsContext)?.api ?? null
}
