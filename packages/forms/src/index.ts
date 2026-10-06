// Public API (§2.5 lists the core; Appendix A records the additions). Keep docs/design.md in step when this changes.

// Kit (default instance + factory)
export { createFormKit } from '#kit/createFormKit'
export { formOptions } from '#kit/formOptions'
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
} from '#kit/defaultKit'
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
} from '#kit/types'

// Field authoring (custom fields)
export { defineField, defineOptionField, defineOptionsField } from '#kit/contracts'
export type {
  Primitive,
  FieldOption,
  FieldDef,
  ExactContract,
  OptionContract,
  OptionsContract,
} from '#kit/contracts'
export { useFieldBinding, accepts } from '#hooks/useFieldBinding'
export type {
  FieldBinding,
  FieldBindingOptions,
  CommonFieldProps,
  BoundFieldProps,
} from '#hooks/useFieldBinding'
export { useOptionMapping } from '#hooks/useOptionMapping'
export type { OptionMapping, UiOption } from '#hooks/useOptionMapping'
export { FieldView, FieldViewList, FieldViewListBoundary } from '#components/fields/FieldView'
export type { FieldViewProps } from '#components/fields/FieldView'
export { useFieldContext, useFormContext } from '#kit/contexts'
export { normaliseError } from '#runtime/errors'
export type { FormError, NormalisedError, ErrorVisibility } from '#runtime/errors'
export { FieldPresentation, useFieldPresentation } from '#components/fields/FieldPresentation'
export type {
  FieldPresentationProps,
  FieldPresentationValue,
} from '#components/fields/FieldPresentation'
export { FieldScope, useFieldScope } from '#components/layouts/FieldScope'
export type { ScopeHandle, FieldScopeProps } from '#components/layouts/FieldScope'
export { useScopeErrors } from '#hooks/useScopeErrors'
export { focusField, focusFirstInvalid } from '#runtime/focus'

// Fields (bound) — also available as kit.fields / field.X / form.X
export * from '#components/fields'
export { defaultFields } from '#components/fields/defaultFields'

// Form components
export { Form, SubmitButton, ResetButton, ErrorSummary, FormStatus } from '#components/form'
export type {
  FormProps,
  SubmitButtonProps,
  ResetButtonProps,
  ErrorSummaryProps,
  FormStatusProps,
} from '#components/form'

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
} from '#components/layouts'
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
} from '#components/layouts'

// Hooks
export {
  useFormStatus,
  useFieldValue,
  useServerValues,
  useAutosave,
  useUnsavedChanges,
  useOptions,
} from '#hooks'
export type {
  FormStatusState,
  ServerValuesOptions,
  AutosaveOptions,
  AutosaveState,
  OptionsLoader,
  UseOptionsOptions,
  UseOptionsResult,
} from '#hooks'

// Submission & errors
export { FormSubmitError, applyServerErrors } from '#runtime/serverErrors'
export { defaultMessages } from '#runtime/messages'
export type { FormMessages } from '#runtime/messages'

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
