import type { VariantKey } from '@/lib/variants'

/**
 * The agent skills Kiln's packages ship (ADR 0011). Each one names the docs pages
 * it's built from: `pages` become SKILL.md, `references` are copied beside it. The text
 * is the docs' own, so the only prose here is when to use each skill.
 *
 * A page with `<Variant>` blocks (ADR 0038) gives several skills: a core skill without any of
 * them, and an add-on per variant value with only that value's blocks.
 */
export interface SkillSpec {
  /** The package directory that ships the skill: `packages/<package>/skills/<name>`. */
  package: 'ui' | 'forms' | 'structure'
  /** Lowercase and hyphenated, unique across the packages. */
  name: string
  /** SKILL.md's heading. */
  title: string
  /** When an agent should load it: concrete tasks, starting "Use when". */
  description: string
  /** What it's for, in a sentence. */
  purpose: string
  /** Intent's skill type. An add-on for a framework or a library is `framework` or `composition`. */
  type: 'core' | 'lifecycle' | 'framework' | 'composition'
  /** Docs pages (paths under content/docs) whose Markdown is SKILL.md, in order. */
  pages: string[]
  /** Docs pages shipped as `references/<slug>.md`, read when their description applies. */
  references?: string[]
  /**
   * Makes this an add-on: SKILL.md holds only the pages' blocks for `variant`, and points to the
   * core skill it `extends`, which Intent's `requires` names too. Without it, a skill drops every
   * variant block.
   */
  addOn?: { extends: string; variant: VariantKey }
  /** The most lines SKILL.md may have. `skills.test.ts` holds every skill to it, or to 500. */
  maxLines?: number
}

export const skills: SkillSpec[] = [
  {
    package: 'ui',
    name: 'setup-and-theming',
    title: 'Set up kiln-ui and pick a theme',
    description:
      'Use when installing @mitcsutt/kiln-ui in a React app: loading its stylesheet, wrapping the app in ThemeProvider, choosing Paper or a preset theme (Monograph, Ledger, Fiesta, Flightdeck, Riso) and a colour mode, setting the theme before first paint with themeScript under SSR or the Next.js App Router, and passing router links through asChild.',
    purpose:
      'Install kiln-ui, load its CSS, and apply a built-in theme and colour mode correctly on the client and the server.',
    type: 'lifecycle',
    pages: ['ui/index'],
    references: [
      'ui/themes/paper',
      'ui/themes/monograph',
      'ui/themes/ledger',
      'ui/themes/fiesta',
      'ui/themes/flightdeck',
      'ui/themes/riso',
    ],
  },
  {
    package: 'ui',
    name: 'layout-composition',
    title: 'Compose layout with typed props',
    description:
      'Use when laying out a screen, page or panel with @mitcsutt/kiln-ui: Stack, Inline, Grid, Split, Section and Container with typed props such as gap, align, width, ratio, space and surface, instead of utility classes, inline styles, margins or custom CSS.',
    purpose:
      "Build screens from kiln-ui's layout primitives and the space scale, so spacing and structure come from props and the theme.",
    type: 'core',
    pages: [
      'ui/foundations/spacing',
      'ui/layout/stack',
      'ui/layout/inline',
      'ui/layout/grid',
      'ui/layout/split',
    ],
    references: [
      'ui/layout/section',
      'ui/layout/container',
      'ui/layout/box',
      'ui/layout/app-shell',
      'ui/layout/action-bar',
      'ui/layout/divider',
      'ui/layout/aspect-ratio',
      'ui/layout/scroll-area',
      'ui/layout/visually-hidden',
      'ui/patterns/dashboard',
      'ui/patterns/settings',
      'ui/patterns/checkout',
    ],
  },
  {
    package: 'ui',
    name: 'custom-theme',
    title: 'Write a custom theme',
    description:
      "Use when writing a new theme for @mitcsutt/kiln-ui, changing a theme's colours, fonts, radii, density, shadows or motion, setting component tokens, or theming one part of a page with ThemeScope. Covers the token contract, the starter theme file, cascade layers, light and dark values, fonts and checking contrast.",
    purpose:
      'Write a complete theme as one CSS file against the token contract and select it like a built-in, with no component changes.',
    type: 'core',
    pages: ['ui/foundations/theming'],
    references: [
      'ui/foundations/tokens',
      'ui/foundations/colour',
      'ui/foundations/type',
      'ui/foundations/motion',
    ],
  },
  {
    package: 'ui',
    name: 'design-rules',
    title: 'Kiln design rules',
    description:
      'Use when designing or reviewing a screen, component, theme, example or copy built with @mitcsutt/kiln-ui, to avoid generic AI-generated UI: one accent, tinted neutrals, no gradients or glow, two type families, left-aligned asymmetric layout, not everything a card, one edge treatment, motion only in answer to an action, and specific copy.',
    purpose:
      "Kiln's binding principles and anti-slop rules, as a checklist for anything built with it.",
    type: 'core',
    pages: ['ui/foundations/design-rules'],
  },
  {
    package: 'forms',
    name: 'component-mode',
    title: 'Write a form in component mode',
    description:
      'Use when building a form in React with @mitcsutt/kiln-forms in JSX: installing it, useAppForm, form.AppField and the typed form.<Kind>Field components, default values, onSubmit, splitting a form into components with withForm or reading it from context in nested components with useTypedAppFormContext, layouts like FormSection, FormSteps, FormTabs and Repeater, conditional fields with When, and submit buttons.',
    purpose:
      'Build typed forms with useAppForm, where each field is bound to a path of the values and rendered through kiln-ui.',
    type: 'core',
    pages: ['forms/index', 'forms/getting-started/component-mode'],
    references: [
      'forms/getting-started/form-context',
      'forms/getting-started/account-settings',
      'forms/getting-started/onboarding',
      'forms/getting-started/recurring-invoice',
      'forms/layouts/form',
      'forms/layouts/form-section',
      'forms/layouts/form-grid',
      'forms/layouts/form-steps',
      'forms/layouts/form-tabs',
      'forms/layouts/repeater',
      'forms/layouts/when',
      'forms/layouts/submit-button',
      'forms/hooks/use-field-value',
      'forms/hooks/use-form-status',
      'forms/hooks/use-unsaved-changes',
    ],
  },
  {
    package: 'forms',
    name: 'schema-mode',
    title: 'Write a form in schema mode',
    description:
      'Use when describing a form as JSON with @mitcsutt/kiln-forms and rendering it with SchemaForm: field, layout, repeater and content nodes, conditions, rules, registries for options and handlers, defineFormSchema, validating the same schema on a server with @mitcsutt/kiln-forms/schema, and accepting schemas from untrusted sources.',
    purpose:
      'Render forms from JSON schemas with the same fields, layouts and rules as component mode, and check them on the server without React.',
    type: 'core',
    pages: ['forms/getting-started/schema-mode'],
    references: [
      'forms/schema/index',
      'forms/schema/nodes',
      'forms/schema/content-nodes',
      'forms/schema/conditions',
      'forms/schema/rules',
      'forms/schema/registries',
      'forms/schema/server-validation',
      'forms/schema/untrusted-schemas',
    ],
  },
  {
    package: 'forms',
    name: 'custom-fields',
    title: 'Add a custom field',
    description:
      'Use when a form built with @mitcsutt/kiln-forms needs a field it does not ship: defineField, defineOptionField or defineOptionsField, binding a control with useFieldBinding, view mode with FieldView, registering the field with kit.extend or createFormKit, and using it as form.<Kind>Field and { kind } in schemas.',
    purpose:
      'Build a field once and register it with the kit, so it works in component mode, schema mode and view mode with types.',
    type: 'core',
    pages: ['forms/getting-started/custom-fields'],
    references: ['forms/layouts/custom-layouts', 'forms/schema/registries'],
  },
  {
    package: 'forms',
    name: 'validation',
    title: 'Validate a form',
    description:
      'Use when adding validation to a @mitcsutt/kiln-forms form: field validators, a whole-form Standard Schema such as zod or valibot, warnings that never block submission, async checks, errors returned by a server with applyServerErrors, error timing, and focusing the first invalid field or the error summary.',
    purpose:
      'Validate fields and whole forms, show errors and warnings at the right time, and put server errors back on their fields.',
    type: 'core',
    pages: ['forms/getting-started/validation'],
    references: [
      'forms/schema/rules',
      'forms/schema/server-validation',
      'forms/layouts/error-summary',
    ],
  },
  {
    package: 'forms',
    name: 'view-mode',
    title: 'Show a form read-only in view mode',
    description:
      'Use when showing the values of a @mitcsutt/kiln-forms form as read-only text, for a detail page or the review step of a wizard: Form mode="view", FormReview, FieldPresentation and how each field formats its value.',
    purpose: 'Render the same form definition as labelled, formatted values instead of controls.',
    type: 'core',
    pages: ['forms/getting-started/view-mode'],
    references: ['forms/layouts/form-review'],
  },
]
