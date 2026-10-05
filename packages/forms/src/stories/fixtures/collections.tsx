/** Parity fixtures: `Repeater` in its three variants (§9.9). */
import { kit } from '#kit/defaultKit'
import { Repeater } from '#components/layouts'
import { defineParity } from '#stories/fixtures/parity'

interface Guest {
  name: string
  dietary: string
}
interface Party {
  guests: Guest[]
}
const party: Party = {
  guests: [
    { name: 'Amara Okafor', dietary: 'Vegetarian' },
    { name: 'Tom Price', dietary: '' },
  ],
}

// --- repeater (list) -------------------------------------------------------------------------
export const repeaterListSchema = kit.defineFormSchema<Party>()({
  version: 1,
  root: {
    layout: 'repeater',
    name: 'guests',
    label: 'Guests',
    description: 'Everyone coming to the launch dinner.',
    newItem: { name: '', dietary: '' },
    max: 6,
    reorderable: true,
    addLabel: 'Add guest',
    empty: 'No guests yet.',
    item: [
      { kind: 'text', name: 'name', label: 'Name' },
      { kind: 'text', name: 'dietary', label: 'Dietary needs' },
    ],
  },
})

export const repeaterListFixture = defineParity({
  name: 'Guest list',
  covers: ['repeater'],
  defaultValues: party,
  schema: repeaterListSchema,
  render: (form) => (
    <Repeater
      form={form}
      name="guests"
      label="Guests"
      description="Everyone coming to the launch dinner."
      newItem={{ name: '', dietary: '' }}
      max={6}
      reorderable
      addLabel="Add guest"
      empty="No guests yet."
    >
      {(item) => (
        <>
          <item.fields.TextField name="name" label="Name" />
          <item.fields.TextField name="dietary" label="Dietary needs" />
        </>
      )}
    </Repeater>
  ),
})

// --- repeater (table) ------------------------------------------------------------------------
interface Expense {
  description: string
  amount: number | null
}
interface Claim {
  expenses: Expense[]
}

export const repeaterTableSchema = kit.defineFormSchema<Claim>()({
  version: 1,
  root: {
    layout: 'repeater',
    name: 'expenses',
    label: 'Expenses',
    variant: 'table',
    min: 1,
    newItem: { description: '', amount: null },
    columns: [{ header: 'Description', width: 'fill' }, { header: 'Amount' }],
    rules: [{ rule: 'minItems', value: 1, message: 'Add at least one expense' }],
    item: [
      { kind: 'text', name: 'description', label: 'Description' },
      { kind: 'amount', name: 'amount', label: 'Amount', currency: 'GBP' },
    ],
  },
})

export const repeaterTableFixture = defineParity({
  name: 'Expense claim',
  covers: ['repeater'],
  defaultValues: { expenses: [{ description: 'Train to Leeds', amount: 42.5 }] },
  schema: repeaterTableSchema,
  render: (form) => (
    <Repeater
      form={form}
      name="expenses"
      label="Expenses"
      variant="table"
      min={1}
      newItem={{ description: '', amount: null }}
      columns={[{ header: 'Description', width: 'fill' }, { header: 'Amount' }]}
      validators={{
        onDynamic: ({ value }) => (value.length < 1 ? 'Add at least one expense' : undefined),
      }}
    >
      {(item) => (
        <>
          <item.fields.TextField name="description" label="Description" />
          <item.fields.AmountField name="amount" label="Amount" currency="GBP" />
        </>
      )}
    </Repeater>
  ),
})

// --- repeater (cards) ------------------------------------------------------------------------
interface Rota {
  volunteers: { volunteer: string; role: 'setup' | 'door' | 'kitchen' | 'cleanup' }[]
}

const roles = [
  { value: 'setup', label: 'Set-up' },
  { value: 'door', label: 'Front door' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'cleanup', label: 'Clean-up' },
] as const

export const repeaterCardsSchema = kit.defineFormSchema<Rota>()({
  version: 1,
  root: {
    layout: 'repeater',
    name: 'volunteers',
    label: 'Saturday volunteers',
    variant: 'cards',
    max: 5,
    newItem: { volunteer: '', role: 'door' },
    item: [
      { kind: 'text', name: 'volunteer', label: 'Volunteer' },
      { kind: 'select', name: 'role', label: 'Role', options: [...roles] },
    ],
  },
})

export const repeaterCardsFixture = defineParity({
  name: 'Volunteer rota',
  covers: ['repeater'],
  defaultValues: { volunteers: [{ volunteer: 'Noor Haddad', role: 'kitchen' }] },
  schema: repeaterCardsSchema,
  render: (form) => (
    <Repeater
      form={form}
      name="volunteers"
      label="Saturday volunteers"
      variant="cards"
      max={5}
      newItem={{ volunteer: '', role: 'door' }}
    >
      {(item) => (
        <>
          <item.fields.TextField name="volunteer" label="Volunteer" />
          <item.fields.SelectField name="role" label="Role" options={[...roles]} />
        </>
      )}
    </Repeater>
  ),
})
