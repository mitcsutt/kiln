/** Parity fixtures: the plain structural layouts (§9.1–9.5, §9.12 and `stack` / `inline`). */
import { Inline, Stack } from '@mitcsutt/kiln-ui'
import { ResetButton } from '#components/ResetButton'
import { SubmitButton } from '#components/SubmitButton'
import { kit } from '#kit'
import {
  FormActions,
  FormAside,
  FormGrid,
  FormGridItem,
  FormPanel,
  FormPanels,
  FormRows,
  FormSection,
} from '#layouts'
import { defineParity } from '#stories/fixtures/parity'

// --- stack ---------------------------------------------------------------------------------
interface Contact {
  name: string
  email: string
}
const contact: Contact = { name: '', email: '' }

export const stackSchema = kit.defineFormSchema<Contact>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { kind: 'text', name: 'name', label: 'Full name', autoComplete: 'name' },
      {
        kind: 'text',
        name: 'email',
        label: 'Email',
        type: 'email',
        description: 'We only use this to send your receipt.',
      },
    ],
  },
})

export const stackFixture = defineParity({
  name: 'Contact details',
  covers: ['stack'],
  defaultValues: contact,
  schema: stackSchema,
  render: (form) => (
    <Stack gap={5}>
      <form.TextField name="name" label="Full name" autoComplete="name" />
      <form.TextField
        name="email"
        label="Email"
        type="email"
        description="We only use this to send your receipt."
      />
    </Stack>
  ),
})

// --- inline --------------------------------------------------------------------------------
interface Search {
  query: string
}

export const inlineSchema = kit.defineFormSchema<Search>()({
  version: 1,
  root: {
    layout: 'inline',
    gap: 3,
    align: 'end',
    children: [
      { kind: 'text', name: 'query', label: 'Search orders', type: 'search' },
      { content: 'submit', label: 'Search' },
    ],
  },
})

export const inlineFixture = defineParity({
  name: 'Order search',
  covers: ['inline', 'submit'],
  defaultValues: { query: '' } satisfies Search,
  schema: inlineSchema,
  render: (form) => (
    <Inline gap={3} align="end">
      <form.TextField name="query" label="Search orders" type="search" />
      <SubmitButton>Search</SubmitButton>
    </Inline>
  ),
})

// --- grid + gridItem -------------------------------------------------------------------------
interface Address {
  line1: string
  city: string
  postcode: string
}

export const gridSchema = kit.defineFormSchema<Address>()({
  version: 1,
  root: {
    layout: 'grid',
    columns: { base: 1, md: 2 },
    children: [
      {
        layout: 'gridItem',
        span: { base: 1, md: 2 },
        children: [{ kind: 'text', name: 'line1', label: 'Address line 1' }],
      },
      { kind: 'text', name: 'city', label: 'Town or city' },
      { kind: 'text', name: 'postcode', label: 'Postcode', autoComplete: 'postal-code' },
    ],
  },
})

export const gridFixture = defineParity({
  name: 'Billing address',
  covers: ['grid', 'gridItem'],
  defaultValues: { line1: '', city: '', postcode: '' } satisfies Address,
  schema: gridSchema,
  render: (form) => (
    <FormGrid columns={{ base: 1, md: 2 }}>
      <FormGridItem span={{ base: 1, md: 2 }}>
        <form.TextField name="line1" label="Address line 1" />
      </FormGridItem>
      <form.TextField name="city" label="Town or city" />
      <form.TextField name="postcode" label="Postcode" autoComplete="postal-code" />
    </FormGrid>
  ),
})

// --- section ---------------------------------------------------------------------------------
interface Delivery {
  recipient: string
  phone: string
  instructions: string
}

export const sectionSchema = kit.defineFormSchema<Delivery>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 8,
    children: [
      {
        layout: 'section',
        title: 'Recipient',
        description: 'Who should sign for the parcel.',
        children: [
          { kind: 'text', name: 'recipient', label: 'Name' },
          { kind: 'text', name: 'phone', label: 'Phone number', type: 'tel' },
        ],
      },
      {
        layout: 'section',
        as: 'section',
        title: 'Delivery instructions',
        headingLevel: 3,
        children: [{ kind: 'textarea', name: 'instructions', label: 'Where should we leave it?' }],
      },
    ],
  },
})

export const sectionFixture = defineParity({
  name: 'Delivery',
  covers: ['section'],
  defaultValues: { recipient: '', phone: '', instructions: '' } satisfies Delivery,
  schema: sectionSchema,
  render: (form) => (
    <Stack gap={8}>
      <FormSection title="Recipient" description="Who should sign for the parcel.">
        <form.TextField name="recipient" label="Name" />
        <form.TextField name="phone" label="Phone number" type="tel" />
      </FormSection>
      <FormSection as="section" title="Delivery instructions" headingLevel={3}>
        <form.TextareaField name="instructions" label="Where should we leave it?" />
      </FormSection>
    </Stack>
  ),
})

// --- aside -----------------------------------------------------------------------------------
interface Profile {
  displayName: string
  bio: string
}

export const asideSchema = kit.defineFormSchema<Profile>()({
  version: 1,
  root: {
    layout: 'aside',
    title: 'Public profile',
    description: 'Other members of your team see this next to your comments.',
    children: [
      { kind: 'text', name: 'displayName', label: 'Display name' },
      { kind: 'textarea', name: 'bio', label: 'Bio', description: 'A line or two about you.' },
    ],
  },
})

export const asideFixture = defineParity({
  name: 'Profile settings',
  covers: ['aside'],
  defaultValues: { displayName: '', bio: '' } satisfies Profile,
  schema: asideSchema,
  render: (form) => (
    <FormAside
      title="Public profile"
      description="Other members of your team see this next to your comments."
    >
      <form.TextField name="displayName" label="Display name" />
      <form.TextareaField name="bio" label="Bio" description="A line or two about you." />
    </FormAside>
  ),
})

// --- rows ------------------------------------------------------------------------------------
interface Notifications {
  eventReminders: boolean
  digest: 'daily' | 'weekly' | 'never'
}

export const rowsSchema = kit.defineFormSchema<Notifications>()({
  version: 1,
  root: {
    layout: 'rows',
    children: [
      {
        kind: 'switch',
        name: 'eventReminders',
        label: 'Event reminders',
        description: 'An hour before each event starts.',
      },
      {
        kind: 'select',
        name: 'digest',
        label: 'Activity digest',
        options: [
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'never', label: 'Never' },
        ],
      },
    ],
  },
})

export const rowsFixture = defineParity({
  name: 'Notification settings',
  covers: ['rows'],
  defaultValues: { eventReminders: true, digest: 'weekly' },
  schema: rowsSchema,
  render: (form) => (
    <FormRows>
      <form.SwitchField
        name="eventReminders"
        label="Event reminders"
        description="An hour before each event starts."
      />
      <form.SelectField
        name="digest"
        label="Activity digest"
        options={[
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'never', label: 'Never' },
        ]}
      />
    </FormRows>
  ),
})

// --- panels + panel --------------------------------------------------------------------------
interface Payment {
  cardholder: string
  billingPostcode: string
}

export const panelsSchema = kit.defineFormSchema<Payment>()({
  version: 1,
  root: {
    layout: 'panels',
    columns: { base: 1, md: 2 },
    children: [
      {
        layout: 'panel',
        title: 'Card',
        children: [{ kind: 'text', name: 'cardholder', label: 'Name on card' }],
      },
      {
        layout: 'panel',
        title: 'Billing address',
        description: 'Must match the address your bank has.',
        children: [{ kind: 'text', name: 'billingPostcode', label: 'Postcode' }],
      },
    ],
  },
})

export const panelsFixture = defineParity({
  name: 'Payment method',
  covers: ['panels', 'panel'],
  defaultValues: { cardholder: '', billingPostcode: '' } satisfies Payment,
  schema: panelsSchema,
  render: (form) => (
    <FormPanels columns={{ base: 1, md: 2 }}>
      <FormPanel title="Card">
        <form.TextField name="cardholder" label="Name on card" />
      </FormPanel>
      <FormPanel title="Billing address" description="Must match the address your bank has.">
        <form.TextField name="billingPostcode" label="Postcode" />
      </FormPanel>
    </FormPanels>
  ),
})

// --- actions ---------------------------------------------------------------------------------
interface Project {
  name: string
}

export const actionsSchema = kit.defineFormSchema<Project>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 6,
    children: [
      { kind: 'text', name: 'name', label: 'Project name' },
      {
        layout: 'actions',
        align: 'between',
        status: true,
        children: [
          { content: 'reset', label: 'Discard changes' },
          { content: 'submit', label: 'Save project' },
        ],
      },
    ],
  },
})

export const actionsFixture = defineParity({
  name: 'Rename project',
  covers: ['actions', 'reset', 'submit'],
  defaultValues: { name: 'Spring catalogue' } satisfies Project,
  schema: actionsSchema,
  render: (form) => (
    <Stack gap={6}>
      <form.TextField name="name" label="Project name" />
      <FormActions align="between" status>
        <ResetButton>Discard changes</ResetButton>
        <SubmitButton>Save project</SubmitButton>
      </FormActions>
    </Stack>
  ),
})
