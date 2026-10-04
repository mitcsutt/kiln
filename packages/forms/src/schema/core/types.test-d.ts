/**
 * Schema type tests (§10.1–10.4). Checked by `tsc --noEmit` (the package `typecheck`); never
 * executed. Every `@ts-expect-error` must be used — an unused one fails the typecheck.
 */
import type { defaultFields } from '#fields/defaultFields'
import { defineSchemaFor } from '#schema/core/define'
import type { TableColumnWidth } from '@mitcsutt/kiln-ui'
import type {
  FormSchema,
  JsonProps,
  RepeaterColumnWidth,
  UntypedFormSchema,
} from '#schema/core/types'
import type { TestExtras, TestRegistry } from '#schema/core/__fixtures__/registry'
import {
  accountSchema,
  enquirySchema,
  expenseSchema,
  layoutsSchema,
  onboardingSchema,
  projectSignupSchema,
  recurringInvoiceSchema,
  type ProjectSignup,
  type ProjectSignupContext,
} from '#schema/core/__fixtures__/schemas'

type Assert<T extends true> = T
type IsEqual<A, B> =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- the usual exact-equality idiom
  (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2 ? true : false

const d = defineSchemaFor<TestRegistry, TestExtras>()<ProjectSignup, ProjectSignupContext>()
const guest = { name: '', age: null, vegetarian: false }

// ---- Valid schemas compile ---------------------------------------------------------------------
d({ version: 1, root: { kind: 'text', name: 'name', label: 'Name' } })
d({
  version: 1,
  root: {
    kind: 'number',
    name: 'age',
    label: 'Age',
    requiredWhen: { field: 'age', op: 'gt', value: 3 },
  },
})
d({
  version: 1,
  root: { kind: 'text', name: 'name', label: 'N', warnRules: [{ rule: 'minLength', value: 2 }] },
})
d({
  version: 1,
  root: {
    kind: 'text',
    name: 'name',
    label: 'N',
    when: { context: 'mode', op: 'in', value: ['create', 'edit'] },
  },
})
d({
  version: 1,
  root: {
    kind: 'combobox',
    name: 'project',
    label: 'Project',
    optionsFrom: { loader: 'projects', deps: ['client', 'address.city'] },
  },
})
d({
  version: 1,
  root: {
    kind: 'number',
    name: 'age',
    label: 'Age',
    compute: { computer: 'remainder', from: ['guests'] },
  },
})
d({ version: 1, root: { custom: 'projectPreview', props: { projectId: 'atlas' } } })
d({
  version: 1,
  root: {
    kind: 'text',
    name: 'email',
    label: 'Email',
    rules: [{ rule: 'custom', validator: 'uniqueEmail', args: { strict: true } }],
  },
})

// ---- Expected errors (§10.1) ---------------------------------------------------------------------
// @ts-expect-error text on a number path
d({ version: 1, root: { kind: 'text', name: 'age', label: 'Age' } })
// @ts-expect-error text on a literal union (use select/radio)
d({ version: 1, root: { kind: 'text', name: 'role', label: 'Role' } })
d({
  version: 1,
  // @ts-expect-error option value outside the union
  root: {
    kind: 'select',
    name: 'role',
    label: 'Role',
    options: [{ value: 'root', label: 'Root' }],
  },
})
d({
  version: 1,
  root: {
    kind: 'text',
    name: 'name',
    label: 'N',
    // @ts-expect-error condition value outside the union
    when: { field: 'role', op: 'eq', value: 'root' },
  },
})
d({
  version: 1,
  // @ts-expect-error gt on a string path
  root: { kind: 'text', name: 'name', label: 'N', when: { field: 'email', op: 'gt', value: 3 } },
})
d({
  version: 1,
  // @ts-expect-error minLength rule on a number
  root: { kind: 'number', name: 'age', label: 'Age', rules: [{ rule: 'minLength', value: 2 }] },
})
d({
  version: 1,
  // @ts-expect-error unknown loader key
  root: { kind: 'select', name: 'project', label: 'Project', optionsFrom: { loader: 'invoices' } },
})
// @ts-expect-error unknown layout
d({ version: 1, root: { layout: 'carousel', children: [] } })
d({
  version: 1,
  // @ts-expect-error repeater item names are relative to the item
  root: {
    layout: 'repeater',
    name: 'guests',
    label: 'G',
    newItem: guest,
    item: [{ kind: 'text', name: 'email', label: 'x' }],
  },
})
// @ts-expect-error typo in a prop name is caught (excess property check)
d({ version: 1, root: { kind: 'text', name: 'name', lable: 'N' } })
// @ts-expect-error functions are not allowed in the schema
d({ version: 1, root: { kind: 'text', name: 'name', label: 'N', onBlur: () => undefined } })
d({
  version: 1,
  // @ts-expect-error multi-choice option value outside the element union
  root: {
    kind: 'chips',
    name: 'disciplines',
    label: 'Discipline',
    options: [{ value: 'marketing', label: 'Marketing' }],
  },
})

// ---- Context conditions ---------------------------------------------------------------------------
d({
  version: 1,
  root: {
    kind: 'text',
    name: 'name',
    label: 'N',
    // @ts-expect-error context value outside its type
    when: { context: 'mode', op: 'eq', value: 'delete' },
  },
})
d({
  version: 1,
  root: {
    kind: 'text',
    name: 'name',
    label: 'N',
    // @ts-expect-error unknown context key
    when: { context: 'tenant', op: 'eq', value: 'x' },
  },
})
d({
  version: 1,
  // @ts-expect-error context conditions don't support gt
  root: { kind: 'text', name: 'name', label: 'N', when: { context: 'mode', op: 'gt', value: 1 } },
})
d({
  version: 1,
  root: {
    kind: 'text',
    name: 'name',
    label: 'N',
    // @ts-expect-error nested condition errors are caught inside all/any/not
    when: { all: [{ not: { field: 'nope', op: 'truthy' } }] },
  },
})

// ---- warnRules use the same typing as rules -------------------------------------------------------
d({
  version: 1,
  // @ts-expect-error warnRules: min on a string
  root: { kind: 'text', name: 'name', label: 'N', warnRules: [{ rule: 'min', value: 2 }] },
})
d({
  version: 1,
  // @ts-expect-error rules: minItems on a string
  root: { kind: 'text', name: 'name', label: 'N', rules: [{ rule: 'minItems', value: 1 }] },
})
d({
  version: 1,
  // @ts-expect-error rules: unknown custom validator
  root: {
    kind: 'text',
    name: 'name',
    label: 'N',
    rules: [{ rule: 'custom', validator: 'isFunny' }],
  },
})
// @ts-expect-error rules: unknown rule name
d({ version: 1, root: { kind: 'text', name: 'name', label: 'N', rules: [{ rule: 'luhn' }] } })

// ---- optionsFrom / compute / resets keys ----------------------------------------------------------
d({
  version: 1,
  // @ts-expect-error optionsFrom deps must be value paths
  root: {
    kind: 'combobox',
    name: 'project',
    label: 'P',
    optionsFrom: { loader: 'projects', deps: ['country'] },
  },
})
d({
  version: 1,
  // @ts-expect-error unknown computer key
  root: { kind: 'number', name: 'age', label: 'Age', compute: { computer: 'sum', from: ['age'] } },
})
d({
  version: 1,
  // @ts-expect-error compute.from must be value paths
  root: {
    kind: 'number',
    name: 'age',
    label: 'Age',
    compute: { computer: 'remainder', from: ['total'] },
  },
})
// @ts-expect-error resets must be value paths
d({ version: 1, root: { kind: 'radio', name: 'client', label: 'C', resets: ['company'] } })

// ---- Layout, content, custom and repeater nodes ---------------------------------------------------
// @ts-expect-error section needs a title
d({ version: 1, root: { layout: 'section', children: [] } })
// @ts-expect-error grid columns outside the scale
d({ version: 1, root: { layout: 'grid', columns: 13, children: [] } })
// @ts-expect-error unknown content kind
d({ version: 1, root: { content: 'image', text: 'x' } })
// @ts-expect-error alert tone outside AlertTone
d({ version: 1, root: { content: 'alert', tone: 'warning', text: 'x' } })
// @ts-expect-error unknown custom node key
d({ version: 1, root: { custom: 'burndownChart' } })
// @ts-expect-error custom node props are typed from the registered component
d({ version: 1, root: { custom: 'projectPreview', props: { projectId: 7 } } })
d({
  version: 1,
  // @ts-expect-error repeater newItem must be an item
  root: { layout: 'repeater', name: 'guests', label: 'G', newItem: { name: '' }, item: [] },
})
d({
  version: 1,
  // @ts-expect-error repeater on a non-array path
  root: { layout: 'repeater', name: 'address', label: 'A', newItem: guest, item: [] },
})
// Repeater column width is the Repeater prop's (ui TableColumnWidth)
export type ColumnWidthCase = Assert<IsEqual<RepeaterColumnWidth, TableColumnWidth>>
d({
  version: 1,
  root: {
    layout: 'repeater',
    name: 'guests',
    label: 'G',
    variant: 'table',
    newItem: guest,
    item: [],
    columns: [{ header: 'Name', width: 'fill' }],
  },
})
d({
  version: 1,
  // @ts-expect-error column width outside TableColumnWidth
  root: {
    layout: 'repeater',
    name: 'guests',
    label: 'G',
    newItem: guest,
    item: [],
    columns: [{ header: 'Age', width: 'narrow' }],
  },
})
// @ts-expect-error schema version must be 1
d({ version: 2, root: { content: 'divider' } })

// ---- Every fixture schema is an UntypedFormSchema (what the runtime functions take) ---------------
export const untyped: UntypedFormSchema[] = [
  projectSignupSchema,
  expenseSchema,
  enquirySchema,
  accountSchema,
  onboardingSchema,
  recurringInvoiceSchema,
  layoutsSchema,
]

// ---- JSON round-trip keeps the type (§10.10) ------------------------------------------------------
export const roundTrip: typeof projectSignupSchema = JSON.parse(
  JSON.stringify(projectSignupSchema),
) as typeof projectSignupSchema

// ---- The real default registry (ReactNode labels, function props) ---------------------------------
interface Real {
  title: string
  notes: string
  size: 'sm' | 'md'
  agree: boolean
  starts: string
}
const real = defineSchemaFor<typeof defaultFields>()<Real>()
real({
  version: 1,
  root: {
    layout: 'stack',
    children: [
      {
        kind: 'text',
        name: 'title',
        label: 'Title',
        description: 'Shown on the card',
        maxLength: 80,
      },
      { kind: 'textarea', name: 'notes', label: 'Notes', rows: 4 },
      {
        kind: 'select',
        name: 'size',
        label: 'Size',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
        ],
      },
      { kind: 'checkbox', name: 'agree', label: 'I agree' },
      {
        kind: 'date',
        name: 'starts',
        label: 'Starts',
        rules: [{ rule: 'minDate', value: 'today' }],
      },
    ],
  },
})
// @ts-expect-error real FormTextField: function props (warn) are not JSON
real({ version: 1, root: { kind: 'text', name: 'title', label: 'Title', warn: () => undefined } })
real({
  version: 1,
  // @ts-expect-error real FormSelectField: options typed to the bound path
  root: { kind: 'select', name: 'size', label: 'Size', options: [{ value: 'xl', label: 'Huge' }] },
})
// @ts-expect-error real kinds only: number is not in the default registry yet
real({ version: 1, root: { kind: 'number', name: 'title', label: 'N' } })

// ---- Custom layouts from the kit extras (§10.5) --------------------------------------------------
type Timeline = (props: {
  node: unknown
  children: unknown
  orientation?: 'horizontal' | 'vertical'
  onSelect?: () => void
}) => null
const withLayouts = defineSchemaFor<
  TestRegistry,
  TestExtras & { layouts: { timeline: Timeline } }
>()<ProjectSignup>()
withLayouts({
  version: 1,
  root: { layout: 'timeline', orientation: 'vertical', children: [{ content: 'divider' }] },
})
withLayouts({ version: 1, root: { layout: 'section', title: 'Still there', children: [] } })
// @ts-expect-error custom layout props are typed from the component
withLayouts({ version: 1, root: { layout: 'timeline', orientation: 'diagonal', children: [] } })
// @ts-expect-error custom layout function props are dropped
withLayouts({ version: 1, root: { layout: 'timeline', onSelect: () => undefined, children: [] } })

// ---- JsonProps ------------------------------------------------------------------------------------
interface ElementLike {
  type: unknown
  props: unknown
  key: unknown
}
interface SomeProps {
  label: string | ElementLike | null
  count?: number
  onChange?: (v: string) => void
  children?: unknown
  className?: string
  range: readonly [number, number]
  meta: { tone: 'info'; at: string }
}
export type JsonPropsCases = [
  Assert<IsEqual<keyof JsonProps<SomeProps>, 'label' | 'count' | 'range' | 'meta'>>,
  Assert<IsEqual<JsonProps<SomeProps>['label'], string | null>>,
  Assert<IsEqual<JsonProps<SomeProps>['range'], readonly [number, number]>>,
]

// ---- FormSchema defaults -------------------------------------------------------------------------
export type DefaultsCase = Assert<IsEqual<FormSchema<ProjectSignup, TestRegistry>['version'], 1>>

// ---- Errors deep in the tree are caught ------------------------------------------------------------
d({
  version: 1,
  root: {
    layout: 'steps',
    children: [
      {
        layout: 'step',
        value: 'you',
        title: 'You',
        children: [
          {
            layout: 'grid',
            children: [
              // @ts-expect-error typo three levels down (excess property check)
              { kind: 'text', name: 'name', label: 'Name', placeholdr: 'Ada' },
            ],
          },
        ],
      },
    ],
  },
})
d({
  version: 1,
  // @ts-expect-error item field on a root-only path inside a nested repeater (reported at the root)
  root: {
    layout: 'section',
    title: 'Guests',
    children: [
      {
        layout: 'repeater',
        name: 'guests',
        label: 'Guests',
        newItem: guest,
        item: [{ kind: 'checkbox', name: 'paid', label: 'Paid' }],
      },
    ],
  },
})
