import { FieldViewListBoundary } from '#components/fields/FieldView'
import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useId,
  useRef,
  type ComponentType,
  type ReactNode,
} from 'react'
import {
  getBy,
  useSelector,
  type AnyFieldApi,
  type AnyFormApi,
  type DeepKeys,
  type DeepValue,
} from '@tanstack/react-form'
import {
  Button,
  Card,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  Fieldset,
  Grid,
  IconButton,
  Inline,
  PlusIcon,
  Stack,
  Table,
  Text,
  VisuallyHidden,
  type TableColumnWidth,
} from '@mitcsutt/kiln-ui'
import { pickErrors } from '#runtime/errors'
import { FieldPresentation, useFieldPresentation } from '#components/fields/FieldPresentation'
import { areErrorsVisible, isQuietMeta } from '#runtime/reveal'
import { useIsomorphicLayoutEffect } from '#utils/env'
import { bindFields } from '#kit/bindFields'
import type {
  AnyKitForm,
  ArrayPaths,
  BindValidators,
  BoundFields,
  FieldRegistry,
  ItemOf,
  RegistryOf,
  ValuesOf,
} from '#kit/types'
import { focusTarget } from '#runtime/focus'
import {
  formatErrorText,
  getFormRuntime,
  isInactive,
  toFormApi,
  type FieldRegistration,
} from '#runtime/formRuntime'
import { readLegend } from '#runtime/labels'
import type { FormMessages } from '#runtime/messages'
import { scopeChain, useScopeNode } from '#components/layouts/FieldScope'
import { useAnnouncer } from '#components/layouts/internal/announcer'

/** One item of a Repeater, passed to its render prop. */
export interface RepeaterItem<I, R = FieldRegistry> {
  index: number
  count: number
  /** Stable React key (items are keyed by index). */
  key: string
  /** TanStack path of the item, e.g. `guests[2]`. */
  name: string
  /** Item-relative typed shorthand: `item.fields.TextField name="first"` binds `guests[2].first`. */
  fields: BoundFields<I, R>
  remove(): void
  move(to: number): void
  canRemove: boolean
  canMoveUp: boolean
  canMoveDown: boolean
}

type Values<A> = ValuesOf<A>

export interface RepeaterProps<A extends AnyKitForm, N extends ArrayPaths<Values<A>>> {
  form: A
  /** A path to an array of objects. */
  name: N
  label: ReactNode
  description?: ReactNode
  /** The item Add appends (or a factory, for fresh ids). */
  newItem: ItemOf<Values<A>, N> | (() => ItemOf<Values<A>, N>)
  /** Default `'list'`. */
  variant?: 'list' | 'table' | 'cards'
  /** At `min`, Remove is hidden. Default 0. */
  min?: number
  /** At `max`, Add is `aria-disabled` with `messages.maxItems(max)`. */
  max?: number
  /** Move up / Move down buttons (keyboard-first; no drag). */
  reorderable?: boolean
  /** Default `messages.item(index)` ("Item 1"). */
  itemLabel?: (index: number) => string
  /** Default `messages.add`. */
  addLabel?: string
  /** Shown when there are no items. */
  empty?: ReactNode
  /** Table variant: one header per child field, in order. */
  columns?: readonly { header: ReactNode; width?: TableColumnWidth }[]
  /** Array-level validators (`minItems`, `unique`…); their errors render as the group's error. */
  validators?: BindValidators<Values<A>, DeepValue<Values<A>, N & DeepKeys<Values<A>>>>
  children: (item: RepeaterItem<ItemOf<Values<A>, N>, RegistryOf<A>>) => ReactNode
}

interface LooseItem {
  index: number
  count: number
  key: string
  name: string
  fields: unknown
  remove(): void
  move(to: number): void
  canRemove: boolean
  canMoveUp: boolean
  canMoveDown: boolean
}

interface LooseProps {
  form: AnyKitForm
  name: string
  label: ReactNode
  description?: ReactNode
  newItem: unknown
  variant?: 'list' | 'table' | 'cards'
  min?: number
  max?: number
  reorderable?: boolean
  itemLabel?: (index: number) => string
  addLabel?: string
  empty?: ReactNode
  columns?: readonly { header: ReactNode; width?: TableColumnWidth }[]
  validators?: unknown
  children: (item: LooseItem) => ReactNode
}

type ArrayFieldComponent = ComponentType<{
  name: string
  mode: 'array'
  validators?: unknown
  children: (field: AnyFieldApi) => ReactNode
}>

/** Top-level children, with fragments flattened — one table cell each. */
function cellsOf(node: ReactNode): ReactNode[] {
  const out: ReactNode[] = []
  for (const child of Children.toArray(node)) {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment)
      out.push(...cellsOf(child.props.children))
    else out.push(child)
  }
  return out
}

type PendingFocus = () => void

/** TanStack's array helpers, with the path typed loosely (AnyFormApi collapses it to `never`). */
interface ArrayOps {
  pushFieldValue(name: string, value: unknown): unknown
  removeFieldValue(name: string, index: number): unknown
  moveFieldValues(name: string, from: number, to: number): unknown
}

/**
 * Item-relative typed shorthand: the kit's own bound components (`bindFields`, memoised per
 * form + prefix), so item fields behave exactly like `form.TextField` — including view mode,
 * where they render a read-only `ViewField` and create no TanStack field.
 */
function itemFieldsOf(form: AnyKitForm, prefix: string): unknown {
  const registry = getFormRuntime(form).registry
  if (!registry)
    throw new Error(
      '[@mitcsutt/kiln-forms] Repeater item.fields needs a kit form (from useAppForm).',
    )
  return bindFields(form as unknown as { AppField: unknown }, registry, prefix)
}

interface ItemsListOptions {
  props: LooseProps
  count: number
  messages: FormMessages
  itemOf: (index: number) => LooseItem
  labelOf: (index: number) => string
  /** Edit mode: the item's Move / Remove buttons. View mode renders none (and no actions column). */
  actionsOf?: (item: LooseItem) => ReactNode
  setItemElement?: (index: number) => (element: HTMLElement | null) => void
}

/** The items in the chosen variant (shared by edit and view mode). */
function renderItems({
  props,
  count,
  messages,
  itemOf,
  labelOf,
  actionsOf,
  setItemElement,
}: ItemsListOptions): ReactNode {
  const { variant = 'list', empty, columns, children } = props
  const indexes = Array.from({ length: count }, (_, index) => index)
  if (count === 0) return empty ?? null
  if (variant === 'table') {
    return (
      <FieldPresentation labelHidden layout="inline">
        <Table>
          <Table.Head>
            <Table.Row>
              {(columns ?? []).map((column, index) => (
                <Table.HeaderCell key={index} width={column.width}>
                  {column.header}
                </Table.HeaderCell>
              ))}
              {actionsOf ? (
                <Table.HeaderCell align="end" width="min">
                  <VisuallyHidden>{messages.actions}</VisuallyHidden>
                </Table.HeaderCell>
              ) : null}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {indexes.map((index) => {
              const item = itemOf(index)
              return (
                <Table.Row key={item.key} ref={setItemElement?.(index)} aria-label={labelOf(index)}>
                  {cellsOf(children(item)).map((cell, cellIndex) => (
                    <Table.Cell key={cellIndex}>{cell}</Table.Cell>
                  ))}
                  {actionsOf ? <Table.Cell align="end">{actionsOf(item)}</Table.Cell> : null}
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </FieldPresentation>
    )
  }
  if (variant === 'cards') {
    return (
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        {indexes.map((index) => {
          const item = itemOf(index)
          return (
            <Card key={item.key} ref={setItemElement?.(index)} variant="outline">
              <Fieldset variant="section" legend={labelOf(index)}>
                <Stack gap={4}>
                  {children(item)}
                  {actionsOf?.(item)}
                </Stack>
              </Fieldset>
            </Card>
          )
        })}
      </Grid>
    )
  }
  return (
    <Stack gap={5} dividers>
      {indexes.map((index) => {
        const item = itemOf(index)
        return (
          <Fieldset key={item.key} ref={setItemElement?.(index)} legend={labelOf(index)}>
            <Stack gap={4}>
              {children(item)}
              {actionsOf?.(item)}
            </Stack>
          </Fieldset>
        )
      })}
    </Stack>
  )
}

function RepeaterBody({ field, props }: { field: AnyFieldApi; props: LooseProps }) {
  const {
    form,
    name,
    label,
    description,
    newItem,
    min = 0,
    max = Number.POSITIVE_INFINITY,
    reorderable = false,
    itemLabel,
    addLabel,
  } = props
  const api: AnyFormApi = toFormApi(form)
  const arrays = api as unknown as ArrayOps
  const runtime = getFormRuntime(api)
  const messages = runtime.options.messages
  const labelOf = itemLabel ?? messages.item
  const items = (field.state.value as readonly unknown[] | undefined) ?? []
  const count = items.length
  const atMax = count >= max
  const [announcer, announce] = useAnnouncer()
  const groupId = useId()
  const maxId = useId()

  // Array-level error (minItems, unique…), shown as the group's error per the visibility policy.
  // A structural change counts as the array's "blur" (it has no focus of its own).
  const submitted = useSelector(api.store, (state) => state.submissionAttempts > 0)
  const meta = field.state.meta
  const first = pickErrors(meta.errorMap as Record<string, unknown>)[0]
  const visible = areErrorsVisible(
    runtime,
    { ...meta, isBlurred: meta.isBlurred || meta.isTouched },
    submitted,
  )
  const errorText =
    first && visible && !isInactive(runtime, name) ? formatErrorText(runtime, first) : undefined

  // Focus registration: the array path focuses the group's first control (ErrorSummary, focusFirstInvalid).
  const groupRef = useRef<HTMLFieldSetElement>(null)
  const scopeNode = useScopeNode()
  useIsomorphicLayoutEffect(() => {
    const chain = scopeChain(scopeNode)
    const unregister = chain.map((scope) => scope.register(name))
    const entry: FieldRegistration = {
      id: groupId,
      element: () => groupRef.current,
      scopes: chain,
      focus: () => {
        const element = groupRef.current
        if (element) focusTarget(element)?.focus()
      },
      getLabel: () => readLegend(groupRef.current, name),
    }
    runtime.fields.set(name, entry)
    return () => {
      for (const done of unregister) done()
      if (runtime.fields.get(name) === entry) runtime.fields.delete(name)
    }
  }, [runtime, name, groupId, scopeNode])

  // The row template, for pruning a hidden field inside a row. Read through a ref
  // so an inline `newItem` doesn't re-register every render.
  const newItemRef = useRef(newItem)
  useIsomorphicLayoutEffect(() => {
    newItemRef.current = newItem
  })
  useIsomorphicLayoutEffect(() => {
    const template = () => {
      const current = newItemRef.current
      return typeof current === 'function' ? (current as () => unknown)() : current
    }
    runtime.itemTemplates.set(name, template)
    return () => {
      if (runtime.itemTemplates.get(name) === template) runtime.itemTemplates.delete(name)
    }
  }, [runtime, name])

  // Deterministic focus after add / remove / move (§9.9), run once the change has committed.
  const itemElements = useRef(new Map<number, HTMLElement>())
  const addRef = useRef<HTMLButtonElement>(null)
  const pending = useRef<PendingFocus | null>(null)
  useIsomorphicLayoutEffect(() => {
    const run = pending.current
    pending.current = null
    run?.()
  })
  const setItemElement = useCallback(
    // Stale entries are harmless: focus checks `isConnected`.
    (index: number) => (element: HTMLElement | null) => {
      if (element) itemElements.current.set(index, element)
    },
    [],
  )
  const focusItem = (index: number) => {
    const element = itemElements.current.get(index)
    const target = element?.isConnected ? focusTarget(element) : null
    target?.focus()
    return Boolean(target)
  }

  const add = () => {
    if (atMax) return
    const value: unknown = typeof newItem === 'function' ? (newItem as () => unknown)() : newItem
    const index = count
    pending.current = () => {
      focusItem(index)
    }
    void arrays.pushFieldValue(name, value)
    announce(messages.itemAdded(labelOf(index)))
  }

  const remove = (index: number) => {
    const removedLabel = labelOf(index)
    pending.current = () => {
      if (focusItem(index)) return
      if (index > 0 && focusItem(index - 1)) return
      addRef.current?.focus()
    }
    void arrays.removeFieldValue(name, index)
    announce(messages.itemRemoved(removedLabel))
  }

  const move = (from: number, to: number, direction: 'up' | 'down') => {
    if (to < 0 || to >= count || to === from) return
    const movedLabel = labelOf(from)
    pending.current = () => {
      const element = itemElements.current.get(to)
      const same = element?.querySelector<HTMLElement>(`[data-repeater-action="${direction}"]`)
      const other = element?.querySelector<HTMLElement>(
        `[data-repeater-action="${direction === 'up' ? 'down' : 'up'}"]`,
      )
      ;(same ?? other)?.focus()
    }
    void arrays.moveFieldValues(name, from, to)
    announce(messages.itemMoved(movedLabel, to + 1))
  }

  const itemOf = (index: number): LooseItem => ({
    index,
    count,
    key: String(index),
    name: `${name}[${String(index)}]`,
    fields: itemFieldsOf(form, `${name}[${String(index)}].`),
    remove: () => {
      remove(index)
    },
    move: (to: number) => {
      move(index, to, to < index ? 'up' : 'down')
    },
    canRemove: count > min,
    canMoveUp: reorderable && index > 0,
    canMoveDown: reorderable && index < count - 1,
  })

  const actionsOf = (item: LooseItem) => {
    const itemName = labelOf(item.index)
    return (
      <Inline gap={1} justify="end" wrap={false}>
        {item.canMoveUp ? (
          <IconButton
            label={messages.moveUp(itemName)}
            icon={<ChevronUpIcon />}
            size="sm"
            data-repeater-action="up"
            onClick={() => {
              move(item.index, item.index - 1, 'up')
            }}
          />
        ) : null}
        {item.canMoveDown ? (
          <IconButton
            label={messages.moveDown(itemName)}
            icon={<ChevronDownIcon />}
            size="sm"
            data-repeater-action="down"
            onClick={() => {
              move(item.index, item.index + 1, 'down')
            }}
          />
        ) : null}
        {item.canRemove ? (
          <IconButton
            label={messages.remove(itemName)}
            icon={<CloseIcon />}
            size="sm"
            data-repeater-action="remove"
            onClick={() => {
              remove(item.index)
            }}
          />
        ) : null}
      </Inline>
    )
  }

  const list = renderItems({ props, count, messages, itemOf, labelOf, actionsOf, setItemElement })

  return (
    <Fieldset
      ref={groupRef}
      id={groupId}
      legend={label}
      description={description}
      error={errorText}
      errorLive={!submitted && !isQuietMeta(meta)}
    >
      <Stack gap={4}>
        {list}
        <Inline gap={3} align="center">
          <Button
            ref={addRef}
            variant="outline"
            tone="neutral"
            leadingIcon={<PlusIcon />}
            aria-disabled={atMax || undefined}
            aria-describedby={atMax ? maxId : undefined}
            onClick={add}
          >
            {addLabel ?? messages.add}
          </Button>
          {atMax ? (
            <Text id={maxId} size="sm" tone="muted">
              {messages.maxItems(max)}
            </Text>
          ) : null}
        </Inline>
        {announcer}
      </Stack>
    </Fieldset>
  )
}

/**
 * View mode (FormReview, `Form mode="view"`): no TanStack field is created for the array — a
 * read-only copy must not take over the real array field's instance, array-level validators or
 * meta. The item count comes from a selector over this one path; items render read-only (their
 * bound fields are `ViewField`s), with no actions, Add button, focus registration or group error.
 */
function RepeaterView({ props }: { props: LooseProps }) {
  const { form, name, label, description, itemLabel } = props
  const api: AnyFormApi = toFormApi(form)
  const messages = getFormRuntime(api).options.messages
  const labelOf = itemLabel ?? messages.item
  const count = useSelector(api.store, (state) => {
    const value: unknown = getBy(state.values, name)
    return Array.isArray(value) ? value.length : 0
  })
  const noop = () => undefined
  const itemOf = (index: number): LooseItem => ({
    index,
    count,
    key: String(index),
    name: `${name}[${String(index)}]`,
    fields: itemFieldsOf(form, `${name}[${String(index)}].`),
    remove: noop,
    move: noop,
    canRemove: false,
    canMoveUp: false,
    canMoveDown: false,
  })
  return (
    <Fieldset legend={label} description={description}>
      {renderItems({ props, count, messages, itemOf, labelOf })}
    </Fieldset>
  )
}

function RepeaterEdit({ props }: { props: LooseProps }) {
  const FieldComponent = (props.form as unknown as { Field?: ArrayFieldComponent }).Field
  if (!FieldComponent)
    throw new Error(
      '[@mitcsutt/kiln-forms] Repeater needs a React form (from useAppForm / useForm).',
    )
  const fieldProps: { name: string; mode: 'array'; validators?: unknown } = {
    name: props.name,
    mode: 'array',
  }
  if (props.validators !== undefined) fieldProps.validators = props.validators
  return (
    <FieldComponent {...fieldProps}>
      {(field) => <RepeaterBody field={field} props={props} />}
    </FieldComponent>
  )
}

/**
 * A list of repeated items (§9.9): `list` (fieldsets), `cards` or `table`. The container is
 * the form's array field (`mode="array"`, re-renders only on structural change); items are
 * keyed by index. Add / Remove / Move move focus deterministically and are announced politely;
 * `min` hides Remove, `max` makes Add `aria-disabled`; array-level errors render as the group's
 * error. The render prop gets item-relative typed fields (`item.fields.TextField name="first"`).
 * In view mode it creates no field and renders the items read-only.
 */
export function Repeater<A extends AnyKitForm, const N extends ArrayPaths<Values<A>>>(
  props: RepeaterProps<A, N>,
): ReactNode {
  const loose = props as unknown as LooseProps
  const mode = useFieldPresentation().mode
  return (
    <FieldViewListBoundary>
      {mode === 'view' ? <RepeaterView props={loose} /> : <RepeaterEdit props={loose} />}
    </FieldViewListBoundary>
  )
}
