/**
 * Test-only: schema-mode example forms (§16 recipes + every layout), typed against the fixture
 * registry. Shared by the type tests, parse tests and round-trip tests.
 */
import { defineSchemaFor } from '#schema/core/define'
import type { TestExtras, TestRegistry } from '#schema/core/__fixtures__/registry'

const define = defineSchemaFor<TestRegistry, TestExtras>()

// --- Project sign-up -------------------------------------------------------------------------
export interface ProjectSignup {
  name: string
  email: string
  age: number | null
  role: 'admin' | 'member'
  client: 'northwind' | 'brightline'
  project: string | null
  fee: 30 | 45 | 60 | null
  paid: boolean
  disciplines: ('design' | 'engineering')[]
  code: string
  address: { line1: string; city: string; postcode: string }
  guests: { name: string; age: number | null; vegetarian: boolean }[]
}
export interface ProjectSignupContext {
  mode: 'create' | 'edit'
  role: 'owner' | 'member'
}

export const emptyProjectSignup: ProjectSignup = {
  name: '',
  email: '',
  age: null,
  role: 'member',
  client: 'northwind',
  project: null,
  fee: null,
  paid: false,
  disciplines: [],
  code: '',
  address: { line1: '', city: '', postcode: '' },
  guests: [],
}

export const projectSignupSchema = define<ProjectSignup, ProjectSignupContext>()({
  version: 1,
  title: 'Project sign-up',
  description: 'Join a client project as a contractor.',
  root: {
    layout: 'steps',
    label: 'Sign-up steps',
    children: [
      {
        layout: 'step',
        value: 'you',
        title: 'You',
        children: [
          {
            layout: 'grid',
            columns: { base: 1, md: 2 },
            children: [
              {
                kind: 'text',
                name: 'name',
                id: 'name',
                label: 'Full name',
                autoComplete: 'name',
                rules: [{ rule: 'required', message: 'Enter your name' }],
              },
              {
                kind: 'text',
                name: 'email',
                id: 'email',
                label: 'Email',
                type: 'email',
                rules: [
                  { rule: 'required' },
                  { rule: 'email' },
                  { rule: 'custom', validator: 'uniqueEmail' },
                ],
                warnRules: [
                  {
                    rule: 'pattern',
                    value: '\\.(test|invalid)$',
                    flags: 'i',
                    message: 'That looks like a placeholder address',
                  },
                ],
                readOnlyWhen: { context: 'mode', op: 'eq', value: 'edit' },
              },
              {
                kind: 'number',
                name: 'age',
                label: 'Age',
                min: 16,
                rules: [
                  { rule: 'min', value: 16, message: 'You must be 16 or over' },
                  { rule: 'integer' },
                ],
              },
              {
                kind: 'select',
                name: 'role',
                label: 'Role',
                options: [
                  { value: 'admin', label: 'Project lead' },
                  { value: 'member', label: 'Contributor' },
                ],
                when: { context: 'role', op: 'eq', value: 'owner' },
              },
            ],
          },
          {
            layout: 'section',
            title: 'Address',
            children: [
              {
                kind: 'text',
                name: 'address.line1',
                label: 'Address line 1',
                rules: [{ rule: 'required' }],
              },
              { kind: 'text', name: 'address.city', label: 'Town or city' },
              {
                kind: 'text',
                name: 'address.postcode',
                label: 'Postcode',
                rules: [{ rule: 'custom', validator: 'ukPostcode' }],
              },
            ],
          },
        ],
      },
      {
        layout: 'step',
        value: 'project',
        title: 'Project',
        children: [
          {
            kind: 'radio',
            name: 'client',
            label: 'Client',
            options: [
              { value: 'northwind', label: 'Northwind Studio' },
              { value: 'brightline', label: 'Brightline Labs' },
            ],
            resets: ['project'],
          },
          {
            kind: 'combobox',
            name: 'project',
            label: 'Project',
            optionsFrom: { loader: 'projects', deps: ['client'] },
            rules: [{ rule: 'required', message: 'Choose a project' }],
          },
          {
            kind: 'chips',
            name: 'disciplines',
            label: 'Discipline',
            options: [
              { value: 'design', label: 'Design' },
              { value: 'engineering', label: 'Engineering' },
            ],
            rules: [{ rule: 'maxItems', value: 1, message: 'Pick one discipline' }],
          },
          {
            custom: 'projectPreview',
            props: { projectId: 'atlas', compact: true },
            when: { field: 'project', op: 'notEmpty' },
          },
        ],
      },
      {
        layout: 'step',
        value: 'payment',
        title: 'Payment',
        children: [
          {
            kind: 'choiceCards',
            name: 'fee',
            label: 'Monthly seat price',
            columns: 3,
            options: [
              { value: 30, label: '£30' },
              { value: 45, label: '£45' },
              { value: 60, label: '£60' },
            ],
            rules: [{ rule: 'required', message: 'Choose a seat price' }],
          },
          {
            kind: 'checkbox',
            name: 'paid',
            label: 'I have paid the first invoice',
            when: { field: 'role', op: 'eq', value: 'member' },
            rules: [{ rule: 'required' }],
          },
          {
            kind: 'oneTimeCode',
            name: 'code',
            label: 'Confirmation code',
            length: 6,
            rules: [{ rule: 'pattern', value: '^\\d{6}$', message: 'Enter the 6-digit code' }],
          },
          {
            layout: 'repeater',
            name: 'guests',
            label: 'Guests for the launch dinner',
            variant: 'table',
            max: 4,
            addLabel: 'Add a guest',
            columns: [
              { header: 'Name' },
              { header: 'Age', width: 'min' },
              { header: 'Vegetarian', width: 'min' },
            ],
            rules: [
              { rule: 'maxItems', value: 4 },
              { rule: 'unique', by: 'name', message: 'Each guest needs a different name' },
            ],
            newItem: { name: '', age: null, vegetarian: false },
            item: [
              {
                kind: 'text',
                name: 'name',
                label: 'Name',
                rules: [{ rule: 'required', message: 'Enter the guest’s name' }],
              },
              {
                kind: 'number',
                name: 'age',
                label: 'Age',
                rules: [{ rule: 'min', value: 0 }],
                when: { field: 'role', op: 'eq', value: 'admin' },
              },
              { kind: 'checkbox', name: 'vegetarian', label: 'Vegetarian' },
            ],
          },
          {
            content: 'alert',
            tone: 'info',
            title: 'Sign-ups close when the project starts',
            text: 'Late sign-ups join the waiting list and pay nothing until a place opens.',
            when: {
              all: [
                { field: 'age', op: 'gte', value: 16 },
                { not: { field: 'email', op: 'empty' } },
              ],
            },
          },
        ],
      },
      {
        layout: 'step',
        value: 'review',
        title: 'Review',
        children: [
          {
            layout: 'review',
            title: 'Check your sign-up',
            children: [
              { kind: 'text', name: 'name', label: 'Full name' },
              { kind: 'text', name: 'email', label: 'Email' },
            ],
          },
          { content: 'errorSummary' },
          {
            layout: 'actions',
            align: 'end',
            children: [{ content: 'submit', label: 'Join the project' }],
          },
        ],
      },
    ],
  },
})

// --- Expense claim ---------------------------------------------------------------------------
export interface Expense {
  amount: number | null
  merchant: string | null
  category: string | null
  date: string
  splits: { category: string | null; amount: number | null }[]
  remainder: number | null
  recurring: boolean
  frequency: 'weekly' | 'monthly' | 'yearly' | null
  notes: string
}

export const expenseSchema = define<Expense>()({
  version: 1,
  title: 'New expense claim',
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      {
        kind: 'amount',
        name: 'amount',
        label: 'Amount',
        currency: 'GBP',
        unit: 'minor',
        rules: [
          { rule: 'required', message: 'Enter an amount' },
          { rule: 'min', value: 1 },
        ],
      },
      {
        kind: 'combobox',
        name: 'merchant',
        label: 'Merchant',
        creatable: true,
        optionsFrom: { loader: 'merchants' },
      },
      {
        kind: 'select',
        name: 'category',
        label: 'Category',
        emptyOption: 'No category',
        options: [
          { value: 'meals', label: 'Meals', group: 'Travel' },
          { value: 'transport', label: 'Transport', group: 'Travel' },
          { value: 'equipment', label: 'Equipment', group: 'Office' },
          { value: 'stationery', label: 'Stationery', group: 'Office' },
        ],
      },
      {
        kind: 'date',
        name: 'date',
        label: 'Date',
        rules: [
          { rule: 'required' },
          { rule: 'maxDate', value: 'today', message: 'The date can’t be in the future' },
        ],
      },
      {
        layout: 'repeater',
        name: 'splits',
        label: 'Split across categories',
        variant: 'table',
        reorderable: true,
        empty: 'Not split',
        columns: [{ header: 'Category' }, { header: 'Amount', width: 'min' }],
        newItem: { category: null, amount: null },
        item: [
          {
            kind: 'select',
            name: 'category',
            label: 'Category',
            options: [
              { value: 'meals', label: 'Meals' },
              { value: 'transport', label: 'Transport' },
            ],
            rules: [{ rule: 'required' }],
          },
          {
            kind: 'amount',
            name: 'amount',
            label: 'Amount',
            currency: 'GBP',
            unit: 'minor',
            rules: [{ rule: 'required' }],
          },
        ],
      },
      {
        kind: 'amount',
        name: 'remainder',
        label: 'Left to split',
        currency: 'GBP',
        unit: 'minor',
        compute: { computer: 'remainder', from: ['amount', 'splits'] },
        when: { field: 'splits', op: 'notEmpty' },
      },
      { kind: 'switch', name: 'recurring', label: 'Recurring expense' },
      {
        kind: 'segmented',
        name: 'frequency',
        label: 'How often',
        options: [
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ],
        when: { field: 'recurring', op: 'truthy' },
        whenHidden: 'reset',
        rules: [{ rule: 'required', message: 'Choose how often it recurs' }],
      },
      {
        kind: 'textarea',
        name: 'notes',
        label: 'Notes for your approver',
        rows: 3,
        rules: [{ rule: 'maxLength', value: 280 }],
      },
      {
        layout: 'actions',
        status: true,
        children: [
          { content: 'reset', label: 'Clear' },
          { content: 'submit', label: 'Submit claim' },
        ],
      },
    ],
  },
})

// --- Enquiry ---------------------------------------------------------------------------------
export interface Enquiry {
  name: string
  email: string
  topic: 'booking' | 'membership' | 'other' | null
  priceRange: readonly [number, number]
  message: string
  website: string
}

export const enquirySchema = define<Enquiry>()({
  version: 1,
  title: 'Send an enquiry',
  root: {
    layout: 'stack',
    children: [
      {
        kind: 'text',
        name: 'name',
        label: 'Your name',
        autoComplete: 'name',
        rules: [{ rule: 'required' }],
      },
      {
        kind: 'text',
        name: 'email',
        label: 'Email',
        type: 'email',
        autoComplete: 'email',
        rules: [{ rule: 'required' }, { rule: 'email' }],
      },
      {
        kind: 'segmented',
        name: 'topic',
        label: 'Topic',
        options: [
          { value: 'booking', label: 'Booking' },
          { value: 'membership', label: 'Membership' },
          { value: 'other', label: 'Something else' },
        ],
      },
      {
        kind: 'range',
        name: 'priceRange',
        label: 'Price range',
        min: 50,
        max: 1000,
        step: 50,
        formatOptions: { style: 'currency', currency: 'GBP' },
      },
      {
        kind: 'textarea',
        name: 'message',
        label: 'Your message',
        rows: 6,
        showCount: true,
        maxLength: 2000,
        rules: [
          { rule: 'required' },
          {
            rule: 'minLength',
            value: 20,
            message: 'Tell us a little more (at least {value} characters)',
          },
        ],
      },
      { kind: 'hidden', name: 'website' },
      { content: 'submit', label: 'Send enquiry' },
    ],
  },
})

// --- Account settings -------------------------------------------------------------------------
export interface Account {
  displayName: string
  email: string
  notifications: { weeklySummary: boolean; securityAlerts: boolean; productNews: boolean }
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const accountSchema = define<Account>()({
  version: 1,
  title: 'Account settings',
  root: {
    layout: 'stack',
    gap: 8,
    children: [
      {
        layout: 'aside',
        title: 'Profile',
        description: 'How you appear to other members.',
        children: [
          {
            kind: 'text',
            name: 'displayName',
            label: 'Display name',
            rules: [{ rule: 'required' }, { rule: 'maxLength', value: 40 }],
          },
          {
            kind: 'text',
            name: 'email',
            label: 'Email',
            type: 'email',
            rules: [{ rule: 'email' }],
          },
        ],
      },
      {
        layout: 'aside',
        title: 'Notifications',
        children: [
          {
            layout: 'rows',
            children: [
              { kind: 'switch', name: 'notifications.weeklySummary', label: 'Weekly summary' },
              {
                kind: 'switch',
                name: 'notifications.securityAlerts',
                label: 'Security alerts',
                description: 'When someone signs in from a new device',
              },
              { kind: 'switch', name: 'notifications.productNews', label: 'Product news' },
            ],
          },
        ],
      },
      {
        layout: 'aside',
        title: 'Security',
        children: [
          {
            kind: 'password',
            name: 'currentPassword',
            label: 'Current password',
            autoComplete: 'current-password',
          },
          {
            kind: 'password',
            name: 'newPassword',
            label: 'New password',
            autoComplete: 'new-password',
            rules: [{ rule: 'minLength', value: 12 }],
            requiredWhen: { field: 'currentPassword', op: 'notEmpty' },
          },
          {
            kind: 'password',
            name: 'confirmPassword',
            label: 'Confirm new password',
            autoComplete: 'new-password',
            disabledWhen: { field: 'newPassword', op: 'empty' },
          },
        ],
      },
      { content: 'status' },
    ],
  },
})

// --- Onboarding (branching steps) -------------------------------------------------------------
export interface Onboarding {
  accountType: 'personal' | 'business' | null
  fullName: string
  companyName: string
  vatNumber: string
  teamSize: number | null
  interests: string[]
}

export const onboardingSchema = define<Onboarding>()({
  version: 1,
  title: 'Get set up',
  root: {
    layout: 'steps',
    label: 'Set-up steps',
    linear: true,
    children: [
      {
        layout: 'step',
        value: 'type',
        title: 'Account type',
        children: [
          {
            kind: 'radio',
            name: 'accountType',
            label: 'Who is this account for?',
            options: [
              { value: 'personal', label: 'Just me' },
              { value: 'business', label: 'A business' },
            ],
            rules: [{ rule: 'required' }],
          },
        ],
      },
      {
        layout: 'step',
        value: 'business',
        title: 'Business details',
        when: { field: 'accountType', op: 'eq', value: 'business' },
        children: [
          {
            kind: 'text',
            name: 'companyName',
            label: 'Company name',
            rules: [{ rule: 'required' }],
          },
          {
            kind: 'text',
            name: 'vatNumber',
            label: 'VAT number',
            rules: [
              {
                rule: 'pattern',
                value: '^GB\\d{9}$',
                message: 'Enter a VAT number like GB123456789',
              },
            ],
          },
          {
            kind: 'number',
            name: 'teamSize',
            label: 'Team size',
            rules: [
              { rule: 'min', value: 1 },
              { rule: 'max', value: 500 },
            ],
          },
        ],
      },
      {
        layout: 'step',
        value: 'personal',
        title: 'About you',
        when: { field: 'accountType', op: 'eq', value: 'personal' },
        children: [
          { kind: 'text', name: 'fullName', label: 'Full name', rules: [{ rule: 'required' }] },
        ],
      },
      {
        layout: 'step',
        value: 'interests',
        title: 'Interests',
        children: [
          {
            kind: 'checkboxGroup',
            name: 'interests',
            label: 'What will you use it for?',
            options: [
              { value: 'projects', label: 'Projects' },
              { value: 'events', label: 'Events' },
              { value: 'clients', label: 'Client work' },
            ],
            rules: [{ rule: 'minItems', value: 1, message: 'Choose at least one' }],
          },
        ],
      },
    ],
  },
})

// --- Recurring invoice (sentence) -------------------------------------------------------------
export interface RecurringInvoice {
  client: string
  amount: number | null
  start: string
}

export const recurringInvoiceSchema = define<RecurringInvoice>()({
  version: 1,
  root: {
    layout: 'sentence',
    label: 'Recurring invoice',
    children: [
      { content: 'text', text: 'Bill' },
      { kind: 'text', name: 'client', label: 'Client', rules: [{ rule: 'required' }] },
      {
        kind: 'amount',
        name: 'amount',
        label: 'Amount',
        currency: 'GBP',
        rules: [{ rule: 'required' }, { rule: 'min', value: 10 }],
      },
      { content: 'text', text: 'every month starting' },
      {
        kind: 'date',
        name: 'start',
        label: 'Start date',
        rules: [{ rule: 'minDate', value: 'today' }],
      },
    ],
  },
})

// --- Every remaining layout -----------------------------------------------------------------
export interface Profile {
  firstName: string
  lastName: string
  bio: string
  timezone: string | null
  theme: 'light' | 'dark' | 'system'
  accent: string
  marketing: boolean
  skills: readonly string[]
  holiday: { start: string; end: string }
  rating: number | null
  meetingTime: string
  reminderAt: string
}

export const layoutsSchema = define<Profile>()({
  version: 1,
  title: 'Profile',
  root: {
    layout: 'tabs',
    label: 'Profile sections',
    children: [
      {
        layout: 'tab',
        value: 'about',
        label: 'About',
        children: [
          { content: 'heading', text: 'About you', level: 2 },
          { content: 'text', text: 'This shows on your public profile.' },
          {
            layout: 'grid',
            columns: { base: 1, md: 2 },
            children: [
              {
                layout: 'gridItem',
                span: 1,
                children: [{ kind: 'text', name: 'firstName', label: 'First name' }],
              },
              {
                layout: 'gridItem',
                span: 1,
                children: [{ kind: 'text', name: 'lastName', label: 'Last name' }],
              },
              {
                layout: 'gridItem',
                span: 'full',
                children: [{ kind: 'textarea', name: 'bio', label: 'Bio', rows: 4 }],
              },
            ],
          },
          { content: 'divider' },
          {
            layout: 'inline',
            gap: 3,
            align: 'center',
            children: [
              {
                kind: 'tags',
                name: 'skills',
                label: 'Skills',
                maxTags: 8,
                rules: [{ rule: 'unique' }],
              },
            ],
          },
        ],
      },
      {
        layout: 'tab',
        value: 'preferences',
        label: 'Preferences',
        children: [
          {
            layout: 'accordion',
            type: 'single',
            defaultValue: 'look',
            children: [
              {
                layout: 'accordionItem',
                value: 'look',
                title: 'Look and feel',
                children: [
                  {
                    kind: 'radio',
                    name: 'theme',
                    label: 'Theme',
                    options: [
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'Match my device' },
                    ],
                  },
                  {
                    kind: 'color',
                    name: 'accent',
                    label: 'Accent colour',
                    swatches: [
                      { value: '#0f766e', label: 'Teal' },
                      { value: '#b45309', label: 'Amber' },
                    ],
                  },
                ],
              },
              {
                layout: 'accordionItem',
                value: 'time',
                title: 'Time',
                children: [
                  {
                    kind: 'combobox',
                    name: 'timezone',
                    label: 'Time zone',
                    options: [{ value: 'Europe/London', label: 'London' }],
                  },
                  { kind: 'time', name: 'meetingTime', label: 'Preferred meeting time', step: 900 },
                  { kind: 'dateTime', name: 'reminderAt', label: 'Remind me at' },
                  {
                    kind: 'dateRange',
                    name: 'holiday',
                    label: 'Next holiday',
                    startLabel: 'From',
                    endLabel: 'Until',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        layout: 'tab',
        value: 'more',
        label: 'More',
        children: [
          {
            layout: 'panels',
            columns: { base: 1, md: 2 },
            children: [
              {
                layout: 'panel',
                title: 'Feedback',
                children: [{ kind: 'rating', name: 'rating', label: 'How are we doing?', max: 5 }],
              },
              {
                layout: 'panel',
                title: 'Email',
                children: [{ kind: 'checkbox', name: 'marketing', label: 'Send me product news' }],
              },
            ],
          },
          {
            layout: 'section',
            title: 'Danger zone',
            as: 'section',
            headingLevel: 3,
            children: [
              {
                content: 'alert',
                tone: 'critical',
                text: 'Deleting your profile can’t be undone.',
              },
            ],
          },
        ],
      },
    ],
  },
})

/** Every fixture schema, by Storybook-ish name. */
export const storySchemas = {
  'Project sign-up': projectSignupSchema,
  'Expense claim': expenseSchema,
  Enquiry: enquirySchema,
  'Account settings': accountSchema,
  Onboarding: onboardingSchema,
  'Recurring invoice': recurringInvoiceSchema,
  'Every layout': layoutsSchema,
}
