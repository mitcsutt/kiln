/** Parity fixtures: the scope-bearing layouts — tabs, accordion and steps (§9.6–9.8). */
import { kit } from '#kit/defaultKit'
import {
  FormAccordion,
  FormAccordionItem,
  FormStep,
  FormSteps,
  FormTab,
  FormTabs,
} from '#components/layouts'
import { defineParity } from '#stories/fixtures/parity'

// --- tabs + tab ------------------------------------------------------------------------------
interface Workspace {
  workspaceName: string
  seats: number | null
  inviteEmail: string
}

export const tabsSchema = kit.defineFormSchema<Workspace>()({
  version: 1,
  root: {
    layout: 'tabs',
    label: 'Workspace settings',
    children: [
      {
        layout: 'tab',
        value: 'general',
        label: 'General',
        children: [
          {
            kind: 'text',
            name: 'workspaceName',
            label: 'Workspace name',
            rules: [{ rule: 'required', message: 'Name your workspace' }],
          },
          { kind: 'number', name: 'seats', label: 'Seats', min: 0 },
        ],
      },
      {
        layout: 'tab',
        value: 'members',
        label: 'Members',
        children: [{ kind: 'text', name: 'inviteEmail', label: 'Invite by email', type: 'email' }],
      },
    ],
  },
})

export const tabsFixture = defineParity({
  name: 'Workspace settings',
  covers: ['tabs', 'tab'],
  defaultValues: { workspaceName: '', seats: null, inviteEmail: '' } satisfies Workspace,
  schema: tabsSchema,
  render: (form) => (
    <FormTabs label="Workspace settings">
      <FormTab value="general" label="General">
        <form.TextField
          name="workspaceName"
          label="Workspace name"
          validators={{
            onDynamic: ({ value }) => (value.trim() === '' ? 'Name your workspace' : undefined),
          }}
        />
        <form.NumberField name="seats" label="Seats" min={0} />
      </FormTab>
      <FormTab value="members" label="Members">
        <form.TextField name="inviteEmail" label="Invite by email" type="email" />
      </FormTab>
    </FormTabs>
  ),
})

// --- accordion + accordionItem ---------------------------------------------------------------
interface Visit {
  visitDate: string
  address: string
  notes: string
}

export const accordionSchema = kit.defineFormSchema<Visit>()({
  version: 1,
  root: {
    layout: 'accordion',
    defaultValue: ['when'],
    children: [
      {
        layout: 'accordionItem',
        value: 'when',
        title: 'When',
        children: [{ kind: 'date', name: 'visitDate', label: 'Visit date' }],
      },
      {
        layout: 'accordionItem',
        value: 'where',
        title: 'Where',
        description: 'Address and any access notes.',
        children: [
          { kind: 'text', name: 'address', label: 'Address' },
          { kind: 'textarea', name: 'notes', label: 'Access notes' },
        ],
      },
    ],
  },
})

export const accordionFixture = defineParity({
  name: 'Site visit',
  covers: ['accordion', 'accordionItem'],
  defaultValues: { visitDate: '', address: '', notes: '' } satisfies Visit,
  schema: accordionSchema,
  render: (form) => (
    <FormAccordion defaultValue={['when']}>
      <FormAccordionItem value="when" title="When">
        <form.DateField name="visitDate" label="Visit date" />
      </FormAccordionItem>
      <FormAccordionItem value="where" title="Where" description="Address and any access notes.">
        <form.TextField name="address" label="Address" />
        <form.TextareaField name="notes" label="Access notes" />
      </FormAccordionItem>
    </FormAccordion>
  ),
})

// --- steps + step ----------------------------------------------------------------------------
interface SignUp {
  email: string
  displayName: string
  jobTitle: string
}

export const stepsSchema = kit.defineFormSchema<SignUp>()({
  version: 1,
  root: {
    layout: 'steps',
    label: 'Sign up',
    children: [
      {
        layout: 'step',
        value: 'account',
        title: 'Account',
        description: 'You sign in with this.',
        children: [
          {
            kind: 'text',
            name: 'email',
            label: 'Email',
            type: 'email',
            rules: [{ rule: 'required', message: 'Enter your email' }],
          },
        ],
      },
      {
        layout: 'step',
        value: 'profile',
        title: 'Profile',
        children: [
          { kind: 'text', name: 'displayName', label: 'Display name' },
          { kind: 'text', name: 'jobTitle', label: 'Job title' },
        ],
      },
    ],
  },
})

export const stepsFixture = defineParity({
  name: 'Sign up',
  covers: ['steps', 'step'],
  defaultValues: { email: '', displayName: '', jobTitle: '' } satisfies SignUp,
  schema: stepsSchema,
  render: (form) => (
    <FormSteps label="Sign up">
      <FormStep value="account" title="Account" description="You sign in with this.">
        <form.TextField
          name="email"
          label="Email"
          type="email"
          validators={{
            onDynamic: ({ value }) => (value.trim() === '' ? 'Enter your email' : undefined),
          }}
        />
      </FormStep>
      <FormStep value="profile" title="Profile">
        <form.TextField name="displayName" label="Display name" />
        <form.TextField name="jobTitle" label="Job title" />
      </FormStep>
    </FormSteps>
  ),
})
