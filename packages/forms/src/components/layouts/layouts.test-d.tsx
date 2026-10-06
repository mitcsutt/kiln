/**
 * Type tests for Repeater and When (§6.6–6.7). Checked by
 * `tsc --noEmit`; never executed. Every `@ts-expect-error` must be used.
 */
import type { ReactNode } from 'react'
import { kit } from '#kit/defaultKit'
import { defineField } from '#kit/contracts'
import { Repeater } from '#components/layouts/Repeater'
import { When } from '#components/layouts/When'

const QuantityField = defineField<number>()(function QuantityField(props: {
  label: ReactNode
  min?: number
}) {
  return <>{props.label}</>
})
const testKit = kit.extend({ fields: { quantity: QuantityField } })

interface Values {
  name: string
  nickname?: string
  role: 'admin' | 'user'
  tags: ('a' | 'b')[]
  people: { first: string; age: number }[]
}
const defaults: Values = { name: '', role: 'user', tags: [], people: [] }

export function RepeaterTyping() {
  const form = testKit.useAppForm({ defaultValues: defaults })
  return (
    <>
      <Repeater form={form} name="people" label="People" newItem={{ first: '', age: 0 }} max={4}>
        {(item) => {
          expectTypeOf(item.index).toEqualTypeOf<number>()
          return (
            <>
              <item.fields.TextField name="first" label="First name" />
              <item.fields.QuantityField name="age" label="Age" min={0} />
              {/* @ts-expect-error paths are relative to the item */}
              <item.fields.TextField name="name" label="Name" />
              {/* @ts-expect-error age is a number, not a string */}
              <item.fields.TextField name="age" label="Age" />
            </>
          )
        }}
      </Repeater>
      <Repeater
        form={form}
        name="people"
        label="People"
        newItem={() => ({ first: 'Ada', age: 36 })}
      >
        {() => null}
      </Repeater>
      {/* @ts-expect-error newItem must be the item type */}
      <Repeater form={form} name="people" label="People" newItem={{ first: 1 }}>
        {() => null}
      </Repeater>
      {/* @ts-expect-error tags is an array of strings, not objects */}
      <Repeater form={form} name="tags" label="Tags" newItem="a">
        {() => null}
      </Repeater>
      {/* @ts-expect-error not an array path */}
      <Repeater form={form} name="name" label="Name" newItem="">
        {() => null}
      </Repeater>
      <Repeater
        form={form}
        name="people"
        label="People"
        newItem={{ first: '', age: 0 }}
        validators={{ onDynamic: ({ value }) => (value.length < 1 ? 'Add someone' : undefined) }}
      >
        {() => null}
      </Repeater>
    </>
  )
}

export function WhenTyping() {
  const form = testKit.useAppForm({ defaultValues: defaults })
  return (
    <>
      <When form={form} is={(v) => v.role === 'admin'}>
        <form.TextField name="nickname" label="Nickname" />
      </When>
      <When form={form} is={(v) => v.tags.includes('a')} whenHidden="keep" names={['nickname']}>
        x
      </When>
      {/* @ts-expect-error comparison with a value outside the union */}
      <When form={form} is={(v) => v.role === 'root'}>
        x
      </When>
      {/* @ts-expect-error unknown governed path */}
      <When form={form} is={() => true} names={['nope']}>
        x
      </When>
      <When form={form} condition={{ field: 'role', op: 'eq', value: 'admin' }}>
        x
      </When>
      {/* @ts-expect-error condition value outside the union */}
      <When form={form} condition={{ field: 'role', op: 'eq', value: 'root' }}>
        x
      </When>
      {/* @ts-expect-error unknown policy */}
      <When form={form} is={() => true} whenHidden="drop">
        x
      </When>
    </>
  )
}
