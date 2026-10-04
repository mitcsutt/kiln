import { Inline, Stack } from '@mitcsutt/kiln-ui'
import type { LayoutComponent } from '#core/kit/types'
import {
  FormAccordion,
  FormAccordionItem,
  FormActions,
  FormAside,
  FormGrid,
  FormGridItem,
  FormPanel,
  FormPanels,
  FormReview,
  FormRows,
  FormSection,
  FormSentence,
  FormStep,
  FormSteps,
  FormTab,
  FormTabs,
} from '#layouts'
import type { DefaultLayoutKey } from '#schema/core/types'

/** The default schema layout registry (§9.0 table): every `layout` key → its §9 component. */
export const defaultLayouts: Readonly<Record<DefaultLayoutKey, LayoutComponent>> = {
  stack: Stack,
  inline: Inline,
  grid: FormGrid,
  gridItem: FormGridItem,
  section: FormSection,
  aside: FormAside,
  rows: FormRows,
  panels: FormPanels,
  panel: FormPanel,
  tabs: FormTabs,
  tab: FormTab,
  accordion: FormAccordion,
  accordionItem: FormAccordionItem,
  steps: FormSteps,
  step: FormStep,
  sentence: FormSentence,
  review: FormReview,
  actions: FormActions,
}

/**
 * Layouts that are `FieldScope`s and accept static names: only these get
 * `scopeNames` from the schema analysis, so counts, reveal and step validation work before mount.
 */
export const SCOPED_LAYOUTS: ReadonlySet<string> = new Set([
  'tab',
  'accordionItem',
  'step',
  'sentence',
])

/** Whether `component` is one of the built-in layouts (they never receive `node` / `form`). */
export function isDefaultLayout(component: LayoutComponent): boolean {
  return Object.values(defaultLayouts).includes(component)
}
