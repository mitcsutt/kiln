// Public API (§2.5 lists the core; Appendix A records the additions). Keep the spec in step when this changes.

// Kit (default instance + factory)
export { createFormKit } from '#core/kit/createFormKit'
export { formOptions } from '#core/kit/formOptions'
export {
  kit,
  useAppForm,
  withForm,
  useTypedAppFormContext,
  withFieldGroup,
  useFields,
  defineFormSchema,
  SchemaForm,
  SchemaNode,
} from '#kit'
export type {
  FormKit,
  KitForm,
  KitFormOptions,
  AnyKitForm,
  BoundFields,
  PathsFor,
  FieldComponentName,
  FieldRegistry,
  LayoutRegistry,
  KitRegistries,
  DeriveRule,
  KitFormValidators,
  KitFormListeners,
  FormValidationResult,
  ValuesOf,
  ArrayPaths,
  ItemOf,
  CustomNodeComponent,
  CustomNodeProps,
  LayoutComponent,
  LayoutRenderProps,
  KitFormSchema,
  SchemaFormProps,
  SchemaNodeProps,
} from '#core/kit/types'

// Field authoring (custom fields)
export { defineField, defineOptionField, defineOptionsField } from '#core/kit/contracts'
export type {
  Primitive,
  FieldOption,
  FieldDef,
  ExactContract,
  OptionContract,
  OptionsContract,
} from '#core/kit/contracts'
export { useFieldBinding, accepts } from '#core/binding/useFieldBinding'
export type {
  FieldBinding,
  FieldBindingOptions,
  CommonFieldProps,
  BoundFieldProps,
} from '#core/binding/useFieldBinding'
export { useOptionMapping } from '#core/binding/optionValues'
export type { OptionMapping, UiOption } from '#core/binding/optionValues'
export { FieldView, FieldViewList, FieldViewListBoundary } from '#core/binding/FieldView'
export type { FieldViewProps } from '#core/binding/FieldView'
export { useFieldContext, useFormContext } from '#core/contexts'
export { normaliseError } from '#core/binding/errors'
export type { FormError, NormalisedError, ErrorVisibility } from '#core/binding/errors'
export { FieldPresentation, useFieldPresentation } from '#core/binding/presentation'
export type { FieldPresentationProps, FieldPresentationValue } from '#core/binding/presentation'
export { FieldScope, useFieldScope } from '#core/scope/FieldScope'
export type { ScopeHandle, FieldScopeProps } from '#core/scope/FieldScope'
export { useScopeErrors } from '#core/scope/useScopeErrors'
export { focusField, focusFirstInvalid } from '#core/runtime/focus'

// Fields (bound) — also available as kit.fields / field.X / form.X
export * from '#fields'
export { defaultFields } from '#fields/defaultFields'

// Form components
export { Form, SubmitButton, ResetButton, ErrorSummary, FormStatus } from '#components'
export type {
  FormProps,
  SubmitButtonProps,
  ResetButtonProps,
  ErrorSummaryProps,
  FormStatusProps,
} from '#components'

// Layouts
export {
  FormGrid,
  FormGridItem,
  FormSection,
  FormAside,
  FormRows,
  FormPanels,
  FormPanel,
  FormTabs,
  FormTab,
  FormAccordion,
  FormAccordionItem,
  FormSteps,
  FormStep,
  useFormSteps,
  Repeater,
  FormSentence,
  FormActions,
  FormReview,
  When,
} from '#layouts'
export type {
  FormGridProps,
  FormGridItemProps,
  FormSectionProps,
  FormAsideProps,
  FormRowsProps,
  FormPanelsProps,
  FormPanelProps,
  FormTabsProps,
  FormTabProps,
  FormAccordionProps,
  FormAccordionItemProps,
  FormStepsProps,
  FormStepProps,
  StepsApi,
  StepStatus,
  RepeaterProps,
  RepeaterItem,
  FormSentenceProps,
  FormReviewProps,
  FormActionsProps,
  WhenProps,
  WhenHidden,
} from '#layouts'

// Hooks
export {
  useFormStatus,
  useFieldValue,
  useServerValues,
  useAutosave,
  useUnsavedChanges,
  useOptions,
} from '#core/hooks'
export type {
  FormStatusState,
  ServerValuesOptions,
  AutosaveOptions,
  AutosaveState,
  OptionsLoader,
  UseOptionsOptions,
  UseOptionsResult,
} from '#core/hooks'

// Submission & errors
export { FormSubmitError, applyServerErrors } from '#core/runtime/serverErrors'
export { defaultMessages } from '#core/runtime/messages'
export type { FormMessages } from '#core/runtime/messages'

// Schema
export {
  parseFormSchema,
  evaluateCondition,
  toStandardSchema,
  schemaDefaultValues,
  defineLoader,
  defineValidator,
  defineComputer,
  defineCustomNode,
} from '#schema'
export type {
  FormSchema,
  SchemaNodeOf,
  FieldNode,
  LayoutNode,
  ContentNode,
  CustomNode,
  RepeaterNode,
  Condition,
  Rule,
  RuleFor,
  UntypedFormSchema,
  NamedValidator,
  Computer,
  Json,
  ParseFormSchemaOptions,
  ParseFormSchemaResult,
  SchemaIssue,
  SchemaRegistryNames,
  ToStandardSchemaOptions,
} from '#schema'

// TanStack passthroughs (so apps never import @tanstack/react-form directly)
export { useSelector, revalidateLogic } from '@tanstack/react-form'
export type {
  DeepKeys,
  DeepValue,
  DeepKeysOfType,
  AnyFieldApi,
  AnyFormApi,
  StandardSchemaV1,
} from '@tanstack/react-form'
