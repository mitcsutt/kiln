import type { ComponentType, ReactNode } from 'react'
import type { AnyFieldApi } from '@tanstack/react-form'
import { useFieldPresentation } from '#core/binding/presentation'
import { resolveFormPath } from '#core/kit/formPath'
import { ViewField } from '#core/kit/viewField'

export interface KitAppFieldProps {
  name: string
  children: (field: AnyFieldApi) => ReactNode
  [option: string]: unknown
}

/**
 * The kit form's `AppField` (canonical path, §6.1): unchanged in edit mode; in view mode it
 * creates no TanStack field — `children` gets a read-only field (value from a one-path selector)
 * carrying the kit's field components, so `<form.AppField name>{(f) => <f.TextField/>}` in a
 * review never takes over the real field's instance, validators or meta. Field groups need nothing
 * extra: TanStack's `group.AppField` renders the form's `AppField` with the full path.
 */
export function createKitAppField(
  api: object,
  RawAppField: ComponentType<KitAppFieldProps>,
  fieldComponents: Record<string, unknown>,
): ComponentType<KitAppFieldProps> {
  if ((RawAppField as { kitAppField?: boolean }).kitAppField) return RawAppField // already wrapped (StrictMode)
  function KitAppField(props: KitAppFieldProps) {
    const mode = useFieldPresentation().mode
    if (mode !== 'view') return <RawAppField {...props} />
    const target = resolveFormPath(api, props.name)
    return (
      <ViewField form={target.form} name={target.name} extend={fieldComponents}>
        {props.children}
      </ViewField>
    )
  }
  KitAppField.displayName = 'AppField'
  KitAppField.kitAppField = true
  return KitAppField
}
