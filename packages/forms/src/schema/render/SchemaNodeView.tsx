import { createElement, useCallback, useMemo, type ComponentType, type ReactNode } from 'react'
import { Alert, Divider, Heading, Text, type AlertTone, type HeadingLevel } from '@mitcsutt/kiln-ui'
import { ErrorSummary, FormStatus, ResetButton, SubmitButton } from '#components/form'
import { useFieldPresentation } from '#components/fields/FieldPresentation'
import { Repeater, When } from '#components/layouts'
import {
  contentNodeProps,
  isContentNode,
  isCustomNode,
  isFieldNode,
  isLayoutNode,
  isRepeaterNode,
  layoutNodeProps,
} from '#schema/core/nodes'
import { withRequired } from '#schema/core/rules'
import type {
  JsonObject,
  UntypedContentNode,
  UntypedCustomNode,
  UntypedLayoutNode,
  UntypedNode,
  UntypedRepeaterNode,
  WhenHidden,
} from '#schema/core/types'
import { joinPath } from '#schema/core/values'
import { useSchemaRender, type SchemaRenderValue } from '#schema/render/context'
import { FieldNodeView } from '#schema/render/FieldNodeView'
import { isDefaultLayout, SCOPED_LAYOUTS } from '#schema/render/layouts'
import { ruleValidators } from '#schema/render/rules'
import { warnOnce } from '#schema/render/warn'

interface NodeProps<N extends UntypedNode = UntypedNode> {
  node: N
  /** Item path inside a repeater (`'guests[2]'`), `''` at the root. */
  prefix: string
}

const EMPTY_PROPS: JsonObject = {}

/** React key of the i-th child: its `id`, else its position (children lists are static). */
function nodeKey(node: UntypedNode, index: number): string {
  return node.id === undefined ? `#${String(index)}` : `id:${node.id}`
}

/** Renders a list of sibling nodes. */
function renderNodes(nodes: readonly UntypedNode[], prefix: string): ReactNode[] {
  return nodes.map((child, index) => (
    <SchemaNodeView key={nodeKey(child, index)} node={child} prefix={prefix} />
  ))
}

/** Why a node can't render (unknown key in an untrusted schema), or `undefined`. */
function unknownKey(node: UntypedNode, render: SchemaRenderValue): string | undefined {
  const { registries } = render
  if (isFieldNode(node)) {
    return Object.prototype.hasOwnProperty.call(registries.fields, node.kind)
      ? undefined
      : `Unknown field kind "${node.kind}"`
  }
  if (isRepeaterNode(node)) return undefined
  if (isLayoutNode(node)) {
    return Object.prototype.hasOwnProperty.call(registries.layouts, node.layout)
      ? undefined
      : `Unknown layout "${node.layout}"`
  }
  if (isContentNode(node)) return undefined
  if (isCustomNode(node)) {
    return Object.prototype.hasOwnProperty.call(registries.nodes, node.custom)
      ? undefined
      : `Unknown custom node "${node.custom}"`
  }
  return 'Unknown node shape'
}

function whenHiddenOf(node: UntypedNode): WhenHidden | undefined {
  return isFieldNode(node) || isRepeaterNode(node) ? node.whenHidden : undefined
}

/**
 * One schema node (§10.6). `when` → a `When` gate whose governed names come from the static
 * analysis (hidden fields pruned per `whenHidden` even if they never mounted). Unknown keys —
 * possible only with untrusted schemas — render nothing and warn in dev.
 */
export function SchemaNodeView({ node, prefix }: NodeProps) {
  const render = useSchemaRender()
  const problem = unknownKey(node, render)
  if (problem !== undefined) {
    warnOnce(
      `${problem} — the node renders nothing. Validate untrusted schemas with parseFormSchema.`,
    )
    return null
  }
  const body = <NodeBody node={node} prefix={prefix} />
  if (!node.when) return body
  return (
    <When
      form={render.form}
      condition={node.when as never}
      context={render.context}
      whenHidden={whenHiddenOf(node)}
      scopeNames={render.analysis.names(node, prefix)}
    >
      {body}
    </When>
  )
}

function NodeBody({ node, prefix }: NodeProps) {
  if (isFieldNode(node)) return <FieldNodeView node={node} prefix={prefix} />
  if (isRepeaterNode(node)) return <RepeaterNodeView node={node} prefix={prefix} />
  if (isLayoutNode(node)) return <LayoutNodeView node={node} prefix={prefix} />
  if (isContentNode(node)) return <ContentNodeView node={node} />
  if (isCustomNode(node)) return <CustomNodeView node={node} />
  return null
}

interface LooseItem {
  name: string
}
type LooseRepeater = ComponentType<
  Record<string, unknown> & { children: (item: LooseItem) => ReactNode }
>

/** A repeater node → `Repeater` with the item nodes rendered under `name[i]`. */
function RepeaterNodeView({ node, prefix }: NodeProps<UntypedRepeaterNode>) {
  const { form, registries } = useSchemaRender()
  const props = useMemo(() => layoutNodeProps(node), [node])
  const rules = useMemo(() => withRequired(node.rules, false), [node.rules])
  const validators = useMemo(
    () => ruleValidators(rules, undefined, form, registries.validators),
    [rules, form, registries.validators],
  )
  const template = node.newItem
  const newItem = useCallback(() => structuredClone(template), [template])
  const items = node.item
  const children = useCallback((item: LooseItem) => renderNodes(items, item.name), [items])
  const all: Record<string, unknown> = {
    ...props,
    form,
    name: joinPath(prefix, node.name),
    newItem,
  }
  if (validators) all.validators = validators
  return createElement(Repeater as unknown as LooseRepeater, { ...all, children })
}

/** A layout node → its registry component with the node's JSON props, children rendered recursively. */
function LayoutNodeView({ node, prefix }: NodeProps<UntypedLayoutNode>) {
  const { form, analysis, registries } = useSchemaRender()
  const layout = registries.layouts[node.layout]
  const Component = layout as unknown as ComponentType<Record<string, unknown>>
  const props = useMemo(() => layoutNodeProps(node), [node])
  const extra: Record<string, unknown> = {}
  if (SCOPED_LAYOUTS.has(node.layout)) extra.scopeNames = analysis.names(node, prefix)
  if (layout && !isDefaultLayout(layout)) {
    extra.node = node
    extra.form = form
  }
  return createElement(Component, { ...props, ...extra }, ...renderNodes(node.children, prefix))
}

/** Content nodes → `Heading`, `Text`, `Alert`, `Divider` and the form components. */
function ContentNodeView({ node }: { node: UntypedContentNode }) {
  const { form } = useSchemaRender()
  const inline = useFieldPresentation().layout === 'inline'
  const props = contentNodeProps(node)
  const text = typeof props.text === 'string' ? props.text : undefined
  const label = typeof props.label === 'string' ? props.label : undefined
  switch (node.content) {
    case 'heading':
      return <Heading level={props.level as HeadingLevel | undefined}>{text}</Heading>
    case 'text':
      // Inside an inline flow (a sentence, a table cell) text is part of the run, not a paragraph.
      return inline ? <>{text}</> : <Text>{text}</Text>
    case 'alert':
      return (
        <Alert
          tone={props.tone as AlertTone | undefined}
          title={typeof props.title === 'string' ? props.title : undefined}
        >
          {text}
        </Alert>
      )
    case 'divider':
      return <Divider />
    case 'submit':
      return <SubmitButton form={form}>{label}</SubmitButton>
    case 'reset':
      return <ResetButton form={form}>{label}</ResetButton>
    case 'errorSummary':
      return (
        <ErrorSummary
          form={form}
          title={typeof props.title === 'string' ? props.title : undefined}
        />
      )
    case 'status':
      return <FormStatus form={form} />
    default:
      warnOnce(
        `Unknown content "${String((node as { content: unknown }).content)}" — the node renders nothing.`,
      )
      return null
  }
}

/** A custom node → its registry component with `{ form, props, node }`. */
function CustomNodeView({ node }: { node: UntypedCustomNode }) {
  const { form, registries } = useSchemaRender()
  const Component = registries.nodes[node.custom] as unknown as ComponentType<{
    form: unknown
    props: JsonObject
    node: UntypedCustomNode
  }>
  return <Component form={form} props={node.props ?? EMPTY_PROPS} node={node} />
}
