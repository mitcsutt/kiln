/**
 * Type tests for the kit's schema members (§3.3, §10.1, §10.5). Checked by `tsc --noEmit`; never
 * executed. Every `@ts-expect-error` must be used.
 */
import type { ReactNode } from 'react'
import { defineField, type FieldOption } from '#core/kit/contracts'
import type { LayoutRenderProps } from '#core/kit/types'
import { kit } from '#kit'
import { defineLoader, defineValidator } from '#schema/core/registry'
import type { UntypedFormSchema } from '#schema/core/types'
import { defineCustomNode } from '#schema/render/defineCustomNode'

interface LocationValue {
  lat: number
  lng: number
}
const LocationField = defineField<LocationValue>()(function LocationField(props: {
  label: ReactNode
  zoom?: number
  onPick?: () => void
}) {
  return <>{props.label}</>
})
const Weather = defineCustomNode<{ city: string; days?: number }>(function Weather({ props }) {
  return props.city
})
function timelineLayout(props: LayoutRenderProps & { title: string; dense?: boolean }) {
  return props.children
}

const extended = kit.extend({
  fields: { location: LocationField },
  loaders: {
    cities: defineLoader<string>(() => Promise.resolve([] as readonly FieldOption<string>[])),
  },
  validators: { postcode: defineValidator<string>(() => undefined) },
  nodes: { weather: Weather },
  layouts: { timeline: timelineLayout },
})

interface Trip {
  name: string
  where: LocationValue | null
  city: string | null
  postcode: string
}

// --- the extended kit's custom kind, loader, validator, node and layout appear ----------------
export const tripSchema = extended.defineFormSchema<Trip>()({
  version: 1,
  root: {
    layout: 'timeline',
    title: 'Trip',
    dense: true,
    children: [
      { kind: 'text', name: 'name', label: 'Trip name' },
      { kind: 'location', name: 'where', label: 'Destination', zoom: 8 },
      {
        kind: 'combobox',
        name: 'city',
        label: 'City',
        optionsFrom: { loader: 'cities', deps: ['name'] },
      },
      {
        kind: 'text',
        name: 'postcode',
        label: 'Postcode',
        rules: [{ rule: 'custom', validator: 'postcode' }],
      },
      { custom: 'weather', props: { city: 'Leeds', days: 3 } },
    ],
  },
})

// The base kit knows none of them.
kit.defineFormSchema<Trip>()({
  version: 1,
  // @ts-expect-error — `location` is not a kind of the base kit
  root: { kind: 'location', name: 'where', label: 'Destination' },
})
kit.defineFormSchema<Trip>()({
  version: 1,
  // @ts-expect-error — no `timeline` layout in the base kit
  root: { layout: 'timeline', title: 'Trip', children: [] },
})
kit.defineFormSchema<Trip>()({
  version: 1,
  // @ts-expect-error — no custom nodes in the base kit
  root: { custom: 'weather', props: { city: 'Leeds' } },
})

extended.defineFormSchema<Trip>()({
  version: 1,
  // @ts-expect-error — the location kind binds only LocationValue paths
  root: { kind: 'location', name: 'name', label: 'Destination' },
})
extended.defineFormSchema<Trip>()({
  version: 1,
  // @ts-expect-error — function props are not JSON (`onPick`)
  root: { kind: 'location', name: 'where', label: 'Destination', onPick: () => undefined },
})
extended.defineFormSchema<Trip>()({
  version: 1,
  // @ts-expect-error — custom node props are typed from defineCustomNode (`city` is a string)
  root: { custom: 'weather', props: { city: 3 } },
})
extended.defineFormSchema<Trip>()({
  version: 1,
  // @ts-expect-error — unknown loader key
  root: { kind: 'combobox', name: 'city', label: 'City', optionsFrom: { loader: 'towns' } },
})
extended.defineFormSchema<Trip>()({
  version: 1,
  // @ts-expect-error — unknown validator key
  root: {
    kind: 'text',
    name: 'postcode',
    label: 'Postcode',
    rules: [{ rule: 'custom', validator: 'zip' }],
  },
})
extended.defineFormSchema<Trip>()({
  version: 1,
  // @ts-expect-error — the custom layout's required `title` is missing
  root: { layout: 'timeline', children: [] },
})
extended.defineFormSchema<Trip>()({
  version: 1,
  // @ts-expect-error — typo (excess property check: the curried form is non-generic in the schema)
  root: { kind: 'text', name: 'name', lable: 'Trip name' },
})

// --- context typing ----------------------------------------------------------------------------
interface Ctx {
  mode: 'create' | 'edit'
}
export const withContext = kit.defineFormSchema<{ email: string }, Ctx>()({
  version: 1,
  root: {
    kind: 'text',
    name: 'email',
    label: 'Email',
    readOnlyWhen: { context: 'mode', op: 'eq', value: 'edit' },
  },
})
kit.defineFormSchema<{ email: string }, Ctx>()({
  version: 1,
  root: {
    kind: 'text',
    name: 'email',
    label: 'Email',
    // @ts-expect-error — 'view' is not a Ctx['mode']
    readOnlyWhen: { context: 'mode', op: 'eq', value: 'view' },
  },
})

// --- SchemaForm / SchemaNode props -------------------------------------------------------------
declare const tripForm: ReturnType<typeof extended.useAppForm<Trip>>
declare const emailForm: ReturnType<typeof kit.useAppForm<{ email: string }>>
declare const parsed: UntypedFormSchema

export const ok = [
  <extended.SchemaForm key="a" form={tripForm} schema={tripSchema} />,
  <extended.SchemaForm key="b" form={tripForm} schema={parsed} />,
  <kit.SchemaForm key="c" form={emailForm} schema={withContext} context={{ mode: 'edit' }} />,
  <kit.SchemaNode key="d" form={emailForm} schema={withContext} id="email" />,
]

// @ts-expect-error — a schema typed for other values
export const wrongForm = <extended.SchemaForm form={emailForm} schema={tripSchema} />
export const wrongContext = (
  // @ts-expect-error — the context is typed from the schema
  <kit.SchemaForm form={emailForm} schema={withContext} context={{ mode: 'view' }} />
)
// @ts-expect-error — SchemaNode needs an id
export const noId = <kit.SchemaNode form={emailForm} schema={withContext} />
