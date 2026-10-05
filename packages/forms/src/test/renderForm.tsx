import type { ReactNode } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from '#components/form/Form'
import type { KitForm, KitFormOptions } from '#kit/types'
import { kit } from '#kit/defaultKit'

type DefaultForm<T, M = undefined> = KitForm<T, M, typeof kit.registries.fields>

export interface RenderFormOptions<T, M = undefined> extends KitFormOptions<T, T, M> {
  /** Wrap `ui` in `<Form form={form}>` (default `true`). */
  wrap?: boolean
  /** Props for the wrapping `<Form>`. */
  formProps?: {
    mode?: 'edit' | 'view'
    disabled?: boolean
    readOnly?: boolean
    id?: string
    'aria-label'?: string
  }
}

export interface RenderFormResult<T, M = undefined> extends RenderResult {
  /** The live form instance. */
  form: DefaultForm<T, M>
  user: ReturnType<typeof userEvent.setup>
}

/**
 * Renders a form built with the default kit. `ui` receives the form; by default it is wrapped in
 * `<Form>` (labelled "Test form").
 */
export function renderForm<T, M = undefined>(
  ui: (form: DefaultForm<T, M>) => ReactNode,
  options: RenderFormOptions<T, M>,
): RenderFormResult<T, M> {
  const { wrap = true, formProps, ...formOptions } = options
  const holder: { form?: DefaultForm<T, M> } = {}
  function Harness() {
    const form = kit.useAppForm<T, T, M>(formOptions)
    holder.form = form
    if (!wrap) return <>{ui(form)}</>
    return (
      <Form form={form} aria-label="Test form" {...formProps}>
        {ui(form)}
      </Form>
    )
  }
  const user = userEvent.setup()
  const result = render(<Harness />)
  if (!holder.form) throw new Error('renderForm: the form did not render')
  return { ...result, form: holder.form, user }
}
