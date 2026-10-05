import type { AnyFormApi } from '@tanstack/react-form'

interface GroupLike {
  form?: unknown
  getFormFieldName?: (name: string) => string
}

/** The form behind `api` (a form or a — possibly nested — field group) and the full path of `name`. */
export function resolveFormPath(api: object, name: string): { form: AnyFormApi; name: string } {
  let current = api as GroupLike
  let path = name
  while (
    typeof current.getFormFieldName === 'function' &&
    typeof current.form === 'object' &&
    current.form !== null
  ) {
    path = current.getFormFieldName(path)
    current = current.form
  }
  return { form: current as unknown as AnyFormApi, name: path }
}
