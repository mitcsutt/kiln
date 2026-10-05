import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Accordion, Inline, Stack, Text, type AccordionVariant } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#components/fields/FieldView'
import { FieldScope, useFieldScope } from '#components/layouts/FieldScope'
import { ErrorBadge } from '#components/layouts/internal/ErrorBadge'
import type { HeadingLevel, ScopeNamesProps } from '#components/layouts/internal/types'

export interface FormAccordionProps {
  /** Default `'multiple'`. */
  type?: 'single' | 'multiple'
  defaultValue?: string | readonly string[]
  variant?: AccordionVariant
  children: ReactNode
}

export interface FormAccordionItemProps extends ScopeNamesProps {
  value: string
  title: ReactNode
  description?: ReactNode
  /** Heading level wrapping the trigger. Default 3. */
  headingLevel?: HeadingLevel
  children: ReactNode
}

interface FormAccordionContextValue {
  open: readonly string[]
  reveal: (value: string) => void
}

const FormAccordionContext = createContext<FormAccordionContextValue | null>(null)

function useFormAccordionContext(): FormAccordionContextValue {
  const context = useContext(FormAccordionContext)
  if (!context)
    throw new Error(
      '[@mitcsutt/kiln-forms] <FormAccordion.Item> must be rendered inside <FormAccordion>.',
    )
  return context
}

function toList(value: string | readonly string[] | undefined): string[] {
  if (value === undefined) return []
  return typeof value === 'string' ? [value] : [...value]
}

/**
 * Collapsible groups of fields (§9.7). Closed items stay mounted (`forceMount` + `hidden`);
 * each trigger shows the item's visible-error count; `reveal()` opens the item (closing the
 * others for `type="single"`).
 */
function FormAccordionRootInner({
  type = 'multiple',
  defaultValue,
  variant,
  children,
}: FormAccordionProps) {
  const [open, setOpen] = useState<string[]>(() => toList(defaultValue))
  const reveal = useCallback(
    (value: string) => {
      flushSync(() => {
        setOpen((previous) => {
          if (type === 'single') return previous[0] === value ? previous : [value]
          return previous.includes(value) ? previous : [...previous, value]
        })
      })
    },
    [type],
  )
  const context = useMemo<FormAccordionContextValue>(() => ({ open, reveal }), [open, reveal])
  return (
    <FormAccordionContext.Provider value={context}>
      {type === 'single' ? (
        <Accordion
          type="single"
          collapsible
          variant={variant}
          value={open[0] ?? ''}
          onValueChange={(next: string) => {
            setOpen(next === '' ? [] : [next])
          }}
        >
          {children}
        </Accordion>
      ) : (
        <Accordion type="multiple" variant={variant} value={open} onValueChange={setOpen}>
          {children}
        </Accordion>
      )}
    </FormAccordionContext.Provider>
  )
}

function AccordionItemBody({
  value,
  title,
  description,
  headingLevel = 3,
  children,
}: Omit<FormAccordionItemProps, 'scopeNames'>) {
  const { open } = useFormAccordionContext()
  const scope = useFieldScope()
  const isOpen = open.includes(value)
  return (
    <Accordion.Item value={value}>
      <Accordion.Trigger level={headingLevel}>
        <Inline as="span" gap={2} align="center" wrap={false}>
          <span>{title}</span>
          <ErrorBadge scope={scope} />
        </Inline>
      </Accordion.Trigger>
      <Accordion.Content forceMount hidden={!isOpen}>
        <Stack gap={5}>
          {description != null ? <Text tone="muted">{description}</Text> : null}
          {children}
        </Stack>
      </Accordion.Content>
    </Accordion.Item>
  )
}

/** One item: a heading trigger + its fields, scoped for counts and reveal. */
export function FormAccordionItem({ scopeNames, ...props }: FormAccordionItemProps) {
  const { reveal } = useFormAccordionContext()
  const value = props.value
  const revealItem = useCallback(() => {
    reveal(value)
  }, [reveal, value])
  return (
    <FieldScope reveal={revealItem} names={scopeNames}>
      <AccordionItemBody {...props} />
    </FieldScope>
  )
}

/**
 * Fields in expandable sections, with error counts on the triggers and every field kept mounted.
 *
 * @remarks
 * `FormAccordion` puts groups of fields in expandable items. Like tabs, each trigger shows its
 * error count, closed items stay mounted, and an invalid submit opens the item with the first
 * error. Several items can be open at once (`type="multiple"`, the default).
 *
 * @example In a schema
 * ```json
 * {
 *   "layout": "accordion",
 *   "children": [{ "layout": "accordionItem", "value": "access", "title": "Access", "children": [] }]
 * }
 * ```
 */
function FormAccordionRoot(props: FormAccordionProps) {
  return (
    <FieldViewListBoundary>
      <FormAccordionRootInner {...props} />
    </FieldViewListBoundary>
  )
}

export const FormAccordion = Object.assign(FormAccordionRoot, { Item: FormAccordionItem })
