import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { Inline, Stack, Tabs, type TabsVariant } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#core/binding/FieldView'
import { useIsomorphicLayoutEffect } from '#core/env'
import { FieldScope, useFieldScope, type ScopeHandle } from '#core/scope/FieldScope'
import { ErrorBadge } from '#layouts/internal/ErrorBadge'
import { useOrderedRegistry, type RegistryEntry } from '#layouts/internal/registry'
import type { ScopeNamesProps } from '#layouts/internal/types'

export interface FormTabsProps {
  /** Accessible name of the tablist. */
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: TabsVariant
  children: ReactNode
}

export interface FormTabProps extends ScopeNamesProps {
  value: string
  label: ReactNode
  children: ReactNode
}

interface TabEntry extends RegistryEntry {
  value: string
  label: ReactNode
  scope: ScopeHandle | null
}

interface FormTabsContextValue {
  current: string | undefined
  select: (value: string) => void
  register: (entry: TabEntry) => () => void
}

const FormTabsContext = createContext<FormTabsContextValue | null>(null)

function useFormTabsContext(): FormTabsContextValue {
  const context = useContext(FormTabsContext)
  if (!context)
    throw new Error('[@mitcsutt/kiln-forms] <FormTabs.Tab> must be rendered inside <FormTabs>.')
  return context
}

function TabTrigger({ entry }: { entry: TabEntry }) {
  return (
    <Tabs.Trigger value={entry.value}>
      <Inline as="span" gap={2} align="center" wrap={false}>
        <span>{entry.label}</span>
        <ErrorBadge scope={entry.scope} />
      </Inline>
    </Tabs.Trigger>
  )
}

/**
 * Tabs of fields (§9.6). Every panel stays mounted (`forceMount` + `hidden`), so its fields
 * validate on submit and count errors; each trigger shows its panel's visible-error count. Each
 * tab is a `FieldScope` whose `reveal()` selects it, so focus handling can reach any field.
 */
function FormTabsRootInner({
  label,
  value,
  defaultValue,
  onValueChange,
  variant,
  children,
}: FormTabsProps) {
  const [entries, register] = useOrderedRegistry<TabEntry>()
  const [inner, setInner] = useState(defaultValue)
  const controlled = value !== undefined
  const known = inner !== undefined && entries.some((entry) => entry.value === inner)
  const current = controlled ? value : known ? inner : (entries[0]?.value ?? inner)

  const onChangeRef = useRef(onValueChange)
  useIsomorphicLayoutEffect(() => {
    onChangeRef.current = onValueChange
  })
  const select = useCallback(
    (next: string) => {
      if (!controlled) setInner(next)
      onChangeRef.current?.(next)
    },
    [controlled],
  )

  const context = useMemo<FormTabsContextValue>(
    () => ({ current, select, register }),
    [current, select, register],
  )

  return (
    <FormTabsContext.Provider value={context}>
      <Tabs value={current ?? ''} onValueChange={select} variant={variant}>
        <Tabs.List aria-label={label}>
          {entries.map((entry) => (
            <TabTrigger key={entry.key} entry={entry} />
          ))}
        </Tabs.List>
        {children}
      </Tabs>
    </FormTabsContext.Provider>
  )
}

function TabPanel({ value, label, children }: Omit<FormTabProps, 'scopeNames'>) {
  const { current, register } = useFormTabsContext()
  const scope = useFieldScope()
  const ref = useRef<HTMLDivElement>(null)
  useIsomorphicLayoutEffect(
    () => register({ key: value, value, label, scope, element: () => ref.current }),
    [register, value, label, scope],
  )
  return (
    <Tabs.Content ref={ref} value={value} forceMount hidden={current !== value}>
      <Stack gap={5}>{children}</Stack>
    </Tabs.Content>
  )
}

/** One tab: registers its trigger with `FormTabs` and scopes its fields. */
export function FormTab({ value, label, scopeNames, children }: FormTabProps) {
  const { select } = useFormTabsContext()
  const reveal = useCallback(() => {
    flushSync(() => {
      select(value)
    })
  }, [select, value])
  return (
    <FieldScope reveal={reveal} names={scopeNames}>
      <TabPanel value={value} label={label}>
        {children}
      </TabPanel>
    </FieldScope>
  )
}

function FormTabsRoot(props: FormTabsProps) {
  return (
    <FieldViewListBoundary>
      <FormTabsRootInner {...props} />
    </FieldViewListBoundary>
  )
}

export const FormTabs = Object.assign(FormTabsRoot, { Tab: FormTab })
