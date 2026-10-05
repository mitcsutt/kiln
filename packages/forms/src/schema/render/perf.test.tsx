import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { Form } from '#components/form/Form'
import { defineField } from '#kit/contracts'
import type { LayoutRenderProps } from '#kit/types'
import { FormTextField, type FormTextFieldProps } from '#components/fields/FormTextField'
import { kit } from '#kit/defaultKit'
import type { UntypedFormSchema, UntypedNode } from '#schema/core/types'
import { defineCustomNode } from '#schema/render/defineCustomNode'

// Render counters keyed by field label / node name (§12 perf acceptance, schema flavour).
const renders = new Map<string, number>()
const count = (key: string) => renders.set(key, (renders.get(key) ?? 0) + 1)

const CountedField = defineField<string>()(function CountedField(props: FormTextFieldProps) {
  count(typeof props.label === 'string' ? props.label : 'field')
  return <FormTextField {...props} />
})
const Probe = defineCustomNode<{ id: string }>(function Probe({ props }) {
  count(`node:${props.id}`)
  return null
})
function CountedLayout({ children, title }: LayoutRenderProps & { title: string }) {
  count(`layout:${title}`)
  return <div>{children}</div>
}

const perfKit = kit.extend({
  fields: { counted: CountedField },
  nodes: { probe: Probe },
  layouts: { counted: CountedLayout },
})

const field = (name: string): UntypedNode => ({ kind: 'counted', name, label: name })
const names = (from: number, to: number) =>
  Array.from({ length: to - from }, (_, i) => `f${String(from + i)}`)

// 45 fields in 3 tabs, a repeater of 10 rows, 5 `when`s (two reading the typed field), a custom
// node, a custom layout, rules and condition flags.
const schema: UntypedFormSchema = {
  version: 1,
  root: {
    layout: 'counted',
    title: 'root',
    children: [
      {
        layout: 'tabs',
        label: 'Sections',
        children: [0, 1, 2].map((tab) => ({
          layout: 'tab',
          value: `t${String(tab)}`,
          label: `Tab ${String(tab)}`,
          children: names(tab * 15, tab * 15 + 15).map((name) =>
            name === 'f3'
              ? { kind: 'counted', name, label: name, rules: [{ rule: 'maxLength', value: 40 }] }
              : name === 'f4'
                ? {
                    kind: 'counted',
                    name,
                    label: name,
                    disabledWhen: { field: 'f0', op: 'eq', value: 'lock' },
                  }
                : field(name),
          ),
        })),
      },
      {
        layout: 'repeater',
        name: 'rows',
        label: 'Rows',
        newItem: { value: '' },
        item: [{ kind: 'counted', name: 'value', label: 'row value' }],
      },
      { kind: 'counted', name: 'w1', label: 'w1', when: { field: 'f3', op: 'notEmpty' } },
      {
        kind: 'counted',
        name: 'w2',
        label: 'w2',
        when: { field: 'f3', op: 'neq', value: 'never' },
      },
      { kind: 'counted', name: 'w3', label: 'w3', when: { field: 'f0', op: 'empty' } },
      { kind: 'counted', name: 'w4', label: 'w4', when: { field: 'f1', op: 'empty' } },
      { kind: 'counted', name: 'w5', label: 'w5', when: { field: 'f2', op: 'empty' } },
      { custom: 'probe', props: { id: 'probe' } },
      { content: 'submit', label: 'Save' },
    ],
  },
}

const defaultValues: Record<string, unknown> = {
  ...Object.fromEntries(names(0, 45).map((name) => [name, ''])),
  w1: '',
  w2: '',
  w3: '',
  w4: '',
  w5: '',
  rows: Array.from({ length: 10 }, () => ({ value: '' })),
}

function Harness({ children }: { children?: ReactNode }) {
  const form = perfKit.useAppForm({ defaultValues })
  return (
    <Form form={form} aria-label="Perf">
      <perfKit.SchemaForm form={form} schema={schema} />
      {children}
    </Form>
  )
}

describe('schema mode performance (§12)', () => {
  it('typing into one schema-rendered field re-renders only that field node', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getAllByLabelText('row value')).toHaveLength(10)
    renders.clear()
    await user.type(screen.getByLabelText('f3'), 'abcdefghij')
    expect(renders.get('f3')).toBe(10)
    // `w1` appears once when f3 becomes non-empty (its `when` flips) — the only other render.
    expect(renders.get('w1')).toBe(1)
    const others = [...renders.entries()].filter(([key]) => key !== 'f3' && key !== 'w1')
    expect(others).toEqual([])
  })
})
