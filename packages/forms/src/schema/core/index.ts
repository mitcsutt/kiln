// The React-free schema core (§10.1–10.5, §10.8–10.10). Also the `@mitcsutt/kiln-forms/schema` package
// export (package.json `exports["./schema"]`): nothing reachable from here may import React at
// runtime (checked by `schema/core/node.test.ts`).
export type {
  ComputerKey,
  Computer,
  Condition,
  ConditionOp,
  ContentKind,
  ContentNode,
  CustomNode,
  CustomNodeKey,
  DefaultLayoutKey,
  DefaultLayoutProps,
  FieldKindsOf,
  FieldNode,
  FieldNodeCommon,
  FormSchema,
  Json,
  JsonObject,
  JsonProps,
  JsonValueOf,
  LayoutKindsOf,
  LayoutNode,
  LoaderKey,
  NamedValidator,
  NodeBase,
  OptionsLoader,
  RepeaterNode,
  RepeaterColumnWidth,
  Rule,
  RuleFor,
  RuleName,
  SchemaNodeOf,
  UntypedCondition,
  UntypedContentNode,
  UntypedContextCondition,
  UntypedCustomNode,
  UntypedFieldCondition,
  UntypedFieldNode,
  UntypedFormSchema,
  UntypedLayoutNode,
  UntypedNode,
  UntypedNodeBase,
  UntypedRepeaterNode,
  UntypedRule,
  ValidatorContext,
  ValidatorKey,
  ValidatorResult,
  WhenHidden,
} from '#schema/core/types'
// Public surface only: anything exported here is API for server code. Internals
// (compileRules, path helpers, key lists, node helpers, analyseSchema) are imported by module path.
export { evaluateCondition } from '#schema/core/conditions'
export { schemaDefaultValues } from '#schema/core/collect'
export { parseFormSchema, SCHEMA_LIMITS } from '#schema/core/parseFormSchema'
export type {
  ParseFormSchemaOptions,
  ParseFormSchemaResult,
  RegistryNames,
  SchemaIssue,
  SchemaRegistryNames,
} from '#schema/core/parseFormSchema'
export {
  MAX_PATTERN_INPUT,
  MAX_PATTERN_LENGTH,
  MAX_UNBOUNDED_QUANTIFIERS,
  WIDE_RANGE,
} from '#schema/core/patterns'
export { toStandardSchema, DEFAULT_EMPTIES } from '#schema/core/toStandardSchema'
export type { ToStandardSchemaOptions } from '#schema/core/toStandardSchema'
export { defineLoader, defineValidator, defineComputer } from '#schema/core/registry'
export { defineSchemaFor } from '#schema/core/define'
