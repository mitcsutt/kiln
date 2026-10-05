/**
 * Type tests (§3.2, §3.5, §6.2–6.3, §15.1). Checked by `tsc --noEmit` (the package `typecheck`);
 * never executed. Every `@ts-expect-error` must be used — an unused one fails the typecheck.
 */
import type { ReactNode } from 'react'
import { z } from 'zod'
import { kit, useFields } from '#kit/defaultKit'
import {
  defineField,
  defineOptionsField,
  type ExactContract,
  type FieldOption,
  type OptionContract,
} from '#kit/contracts'
import { formOptions } from '#kit/formOptions'
import type { AnyKitForm, ArrayPaths, ItemOf, KitForm, PathsFor, ValuesOf } from '#kit/types'
import { useFieldValue } from '#hooks/useFieldValue'
import { FormSubmitError, applyServerErrors } from '#runtime/serverErrors'
import { FormTextField } from '#components/fields/FormTextField'

// --- A kit with two stub fields, so number / multi-choice rows can be checked ----------------
interface Shared {
  label: ReactNode
}
const QuantityField = defineField<number>()(function QuantityField(
  props: Shared & { min?: number },
) {
  return <>{props.label}</>
})
const TickListField = defineOptionsField<string | number>()(function TickListField(
  props: Shared & { options?: readonly FieldOption<string | number>[] },
) {
  return <>{props.label}</>
})
const testKit = kit.extend({ fields: { quantity: QuantityField, tickList: TickListField } })

interface Values {
  name: string
  nickname?: string
  age: number | null
  agree: boolean
  role: 'admin' | 'user'
  size: 1 | 2 | 3
  tags: ('a' | 'b')[]
  address: { city: string }
  people: { first: string; age: number }[]
  starts: string
}
const defaults: Values = {
  name: '',
  age: null,
  agree: false,
  role: 'user',
  size: 1,
  tags: [],
  address: { city: '' },
  people: [],
  starts: '',
}

// --- §3.2 path filtering (pure types) ---------------------------------------------------------
type TextPaths = PathsFor<Values, ExactContract<string>>
export const okText: TextPaths[] = ['name', 'nickname', 'address.city', 'people[0].first', 'starts']
// @ts-expect-error role is a literal union: a text box would write arbitrary strings
export const badText: TextPaths = 'role'
type SelectPaths = PathsFor<Values, OptionContract<string | number | boolean>>
export const okSelect: SelectPaths[] = ['role', 'size', 'agree', 'name']
// @ts-expect-error tags is an array, not a single option
export const badSelect: SelectPaths = 'tags'

export function ComponentMode() {
  const form = testKit.useAppForm({
    defaultValues: defaults,
    onSubmit: ({ value }) => {
      expectTypeOf(value.name).toEqualTypeOf<string>()
    },
  })
  expectTypeOf(form.state.values).toExtend<Values>()
  return (
    <>
      {/* canonical TanStack path still works */}
      <form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>
      {/* typed shorthand */}
      <form.TextField name="name" label="Name" />
      <form.TextField name="nickname" label="Nickname" />
      <form.TextField name="address.city" label="City" />
      <form.TextField name="people[0].first" label="First name" />
      <form.QuantityField name="age" label="Age" min={0} />
      <form.CheckboxField name="agree" label="I agree" />
      <form.SelectField name="role" label="Role" options={[{ value: 'admin', label: 'Admin' }]} />
      <form.SelectField name="size" label="Size" options={[{ value: 1, label: 'Small' }]} />
      <form.SelectField name="agree" label="Agree" options={[{ value: true, label: 'Yes' }]} />
      <form.TickListField name="tags" label="Tags" options={[{ value: 'a', label: 'A' }]} />
      <form.DateField name="starts" label="Starts" min="2026-01-01" />
      <form.HiddenField name="name" />
      <form.TextField
        name="name"
        label="Name"
        validators={{
          onBlur: ({ value }) => (value.length < 2 ? 'Too short' : undefined),
          onChangeListenTo: ['age'],
        }}
        listeners={{ onChange: ({ value }) => void value.toUpperCase() }}
      />
      <form.QuantityField
        name="age"
        label="Age"
        validators={{
          onChange: ({ value }) =>
            value !== null && value < 18 ? 'Must be 18 or over' : undefined,
          onBlur: z.number().min(18).nullable(),
        }}
      />

      <form.TextField
        name="name"
        label="N"
        // @ts-expect-error value is a string on FormTextField name="name"
        validators={{ onChange: ({ value }) => value.toFixed() }} // eslint-disable-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return -- the expected type error makes `value` any
      />
      {/* @ts-expect-error age is number | null, not string */}
      <form.TextField name="age" label="Age" />
      {/* @ts-expect-error role is a literal union */}
      <form.TextField name="role" label="Role" />
      {/* @ts-expect-error unknown path */}
      <form.TextField name="nope" label="Nope" />
      {/* @ts-expect-error option value not in the union */}
      <form.SelectField name="role" label="Role" options={[{ value: 'root', label: 'Root' }]} />
      {/* @ts-expect-error size is 1 | 2 | 3 */}
      <form.SelectField name="size" label="Size" options={[{ value: 4, label: 'Huge' }]} />
      {/* @ts-expect-error boolean is not an array */}
      <form.TickListField name="agree" label="Agree" options={[]} />
      {/* @ts-expect-error the tags element is 'a' | 'b' */}
      <form.TickListField name="tags" label="Tags" options={[{ value: 'c', label: 'C' }]} />
      {/* @ts-expect-error label is required (§11.8) */}
      <form.CheckboxField name="agree" />
      {/* @ts-expect-error a checkbox cannot bind a string */}
      <form.CheckboxField name="name" label="Name" />
      {/* @ts-expect-error a number field cannot bind a string */}
      <form.QuantityField name="name" label="Name" />
      {/* @ts-expect-error a date field binds an ISO string, not a number */}
      <form.DateField name="age" label="Age" />
      {/* @ts-expect-error a hidden field binds a string */}
      <form.HiddenField name="age" />
      {/* @ts-expect-error FormTextField types are text-like only (use FormPasswordField / FormDateField) */}
      <form.TextField name="name" label="Name" type="password" />
      <form.TextField
        name="name"
        label="Name"
        // @ts-expect-error listener value is a string
        listeners={{ onChange: ({ value }) => value.toFixed() }} // eslint-disable-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return -- the expected type error makes `value` any
      />
      {/* @ts-expect-error default value must match the path */}
      <form.TextField name="name" label="Name" defaultValue={3} />
    </>
  )
}

// --- §3.5 useAppForm inference ---------------------------------------------------------------
const schema = z.object({
  amount: z.number().min(1).nullable(),
  note: z.string().transform((s) => s.trim().length),
})

export function Inference() {
  const form = kit.useAppForm({
    defaultValues: { amount: null as number | null, note: '' },
    schema,
    onSubmit: ({ value, output }) => {
      expectTypeOf(value.amount).toEqualTypeOf<number | null>()
      expectTypeOf(output.note).toEqualTypeOf<number>()
      // @ts-expect-error output.note is the transformed number
      expectTypeOf(output.note).toEqualTypeOf<string>()
    },
    validators: {
      onChange: ({ value }) =>
        value.amount === 0 ? { fields: { amount: 'Enter more than zero' } } : undefined,
    },
    derive: [{ field: 'note', from: ['amount'], compute: (v) => String(v.amount ?? '') }],
  })
  expectTypeOf(form.state.values).toExtend<{ amount: number | null; note: string }>()

  kit.useAppForm({
    defaultValues: { name: '' },
    // @ts-expect-error schema input { name?: string } is not assignable to the form's values
    schema: z.object({ name: z.string().optional() }),
  })
  kit.useAppForm({
    defaultValues: { name: '' },
    // @ts-expect-error unknown field path in a form validator result
    validators: { onChange: () => ({ fields: { nmae: 'Required' } }) },
  })
  kit.useAppForm({
    defaultValues: { quantity: 1, total: 0 },
    // @ts-expect-error compute must return the derived field's type
    derive: [{ field: 'total', from: ['quantity'], compute: () => 'lots' }],
  })
  kit.useAppForm({
    defaultValues: { name: '' },
    onSubmitMeta: { action: 'save' as 'save' | 'draft' },
    onSubmit: ({ meta }) => {
      // @ts-expect-error meta.action is 'save' | 'draft'
      if (meta.action === 'publish') return
    },
  })
  return null
}

// --- withForm / withFieldGroup / useFields ---------------------------------------------------
const addressOptions = formOptions({ defaultValues: defaults })

const Address = testKit.withForm({
  ...addressOptions,
  props: { title: 'Address' },
  render: function Address({ form, title }) {
    return (
      <>
        {title}
        <form.TextField name="address.city" label="City" />
        {/* @ts-expect-error city is a string */}
        <form.QuantityField name="address.city" label="City" />
      </>
    )
  },
})

const PasswordPair = testKit.withFieldGroup({
  defaultValues: { password: '', confirm: '' },
  render: function PasswordPair({ group }) {
    const fields = useFields(group)
    return (
      <>
        <fields.TextField name="password" label="Password" />
        <fields.TextField
          name="confirm"
          label="Confirm password"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value }) =>
              value !== group.getFieldValue('password') ? 'Passwords do not match' : undefined,
          }}
        />
        {/* @ts-expect-error not in the group */}
        <fields.TextField name="email" label="Email" />
      </>
    )
  },
})

export function Composition() {
  const form = testKit.useAppForm({ defaultValues: defaults })
  const withAccount = testKit.useAppForm({
    defaultValues: { ...defaults, account: { password: '', confirm: '' } },
  })
  const other = testKit.useAppForm({ defaultValues: { x: 1 } })
  expectTypeOf(useFieldValue(form, 'address.city')).toEqualTypeOf<string>()
  // @ts-expect-error unknown path
  useFieldValue(form, 'address.town')
  applyServerErrors(form, { fields: { name: 'Taken', 'address.city': 'Unknown city' } })
  // @ts-expect-error unknown path in server errors
  applyServerErrors(form, { fields: { nmae: 'Taken' } })
  return (
    <>
      <Address form={form} title="Home" />
      {/* @ts-expect-error wrong form shape */}
      <Address form={other} title="Home" />
      <PasswordPair form={withAccount} fields="account" />
      {/* @ts-expect-error 'name' is a string, not the group's shape */}
      <PasswordPair form={withAccount} fields="name" />
    </>
  )
}

// --- useTypedAppFormContext: a nested component reads the form from context, typed -------------
export function NestedFromContext() {
  const form = testKit.useTypedAppFormContext(addressOptions)
  expectTypeOf(form.state.values).toEqualTypeOf<Values>()
  expectTypeOf(form.state.values.address.city).toEqualTypeOf<string>()
  expectTypeOf(form).toEqualTypeOf<KitForm<Values, undefined, typeof testKit.registries.fields>>()
  expectTypeOf(useFieldValue(form, 'people')).toEqualTypeOf<Values['people']>()
  // @ts-expect-error unknown path
  useFieldValue(form, 'address.town')
  const meta = testKit.useTypedAppFormContext(
    formOptions({ defaultValues: defaults, onSubmitMeta: { draft: false } }),
  )
  expectTypeOf(meta).toEqualTypeOf<
    KitForm<Values, { draft: boolean }, typeof testKit.registries.fields>
  >()
  // @ts-expect-error options are required: they carry the form's type
  testKit.useTypedAppFormContext()
  return (
    <>
      <form.TextField name="address.city" label="City" />
      <form.QuantityField name="age" label="Age" />
      {/* @ts-expect-error city is a string */}
      <form.QuantityField name="address.city" label="City" />
      {/* @ts-expect-error unknown path */}
      <form.TextField name="address.town" label="Town" />
    </>
  )
}

// --- FormSubmitError / helpers ---------------------------------------------------------------
export const submitError = new FormSubmitError<Values>({
  form: 'Try again',
  fields: { 'address.city': 'Unknown' },
})
// @ts-expect-error unknown path
export const badSubmitError = new FormSubmitError<Values>({ fields: { nope: 'x' } })

type Arrays = ArrayPaths<Values>
export const arrayPath: Arrays = 'people'
// @ts-expect-error tags holds strings, not objects
export const notObjectArray: Arrays = 'tags'
export const item: ItemOf<Values, 'people'> = { first: '', age: 0 }
// @ts-expect-error item shape
export const badItem: ItemOf<Values, 'people'> = { first: 1 }

type FormValues = ValuesOf<KitForm<Values>>
export const formValues: FormValues = defaults

// --- extend: duplicate kinds are a type error -------------------------------------------------
// @ts-expect-error `text` already exists in the base kit
export const duplicate = kit.extend({ fields: { text: FormTextField } })

// --- AnyKitForm: every concrete form fits the public type -------------------------------------
declare const concreteForm: KitForm<Values>
export const asAny: AnyKitForm = concreteForm
declare const extendedKitForm: ReturnType<typeof testKit.useAppForm<{ x: number }>>
export const asAnyExtended: AnyKitForm = extendedKitForm
// @ts-expect-error a plain object is not a form
export const notAForm: AnyKitForm = { values: {} }
