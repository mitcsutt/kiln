import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from 'react'
import {
  Table,
  type TableAlign,
  type TableColumnWidth,
  type TableProps,
} from '#components/display/Table'
import { ChevronRightIcon } from '#icons'
import { cx } from '#utils/cx'
import type { VisibilityProps } from '#utils/visibility'
import { useLatest } from '#components/inputs/internal/useLatest'
import styles from './TreeTable.module.css'

/** One column of a {@link TreeTable}. The first column holds the tree: indent, toggle and the row's name. */
export interface TreeTableColumn extends VisibilityProps {
  /** Stable key, passed back to `renderCell`. */
  id: string
  /** The header cell's content. */
  header: ReactNode
  align?: TableAlign
  /** Numeric column: right-aligned with tabular figures. */
  numeric?: boolean
  /** Column sizing: `fill` takes the spare width, `min` shrinks to fit, `bar` keeps room for a bar. */
  width?: TableColumnWidth
}

export interface TreeTableProps<T> extends Omit<
  TableProps,
  'children' | 'label' | 'role' | 'onChange' | 'defaultValue'
> {
  /** Name for the grid, read by assistive technology. */
  label: string
  /** The columns, in order. The first holds the tree. */
  columns: readonly TreeTableColumn[]
  /** The top-level rows. */
  rows: readonly T[]
  /** A stable, unique id for a row. It is what `expanded` holds and what keeps focus on a row across renders. */
  getRowId: (row: T) => string
  /** The row's children, or `undefined` when it has none. */
  getChildren: (row: T) => readonly T[] | undefined
  /**
   * Whether the row can be opened. Defaults to `getChildren(row)` having entries. Return `true` for a
   * row whose children load when it opens.
   */
  hasChildren?: (row: T) => boolean
  /** The ids of the open rows (controlled). */
  expanded?: readonly string[]
  /** The ids of the rows that start open (uncontrolled). */
  defaultExpanded?: readonly string[]
  /** Called with the ids of the open rows when one opens or closes. */
  onExpandedChange?: (expanded: string[]) => void
  /** The content of one cell. The first column's content sits beside the toggle. */
  renderCell: (row: T, column: TreeTableColumn) => ReactNode
}

interface Node<T> {
  row: T
  id: string
  level: number
  setSize: number
  posInSet: number
  parentId: string | undefined
  expandable: boolean
  open: boolean
}

type Dispatch = 'next' | 'prev' | 'first' | 'last'

function TreeTableInner<T>(
  {
    label,
    columns,
    rows,
    getRowId,
    getChildren,
    hasChildren,
    expanded: expandedProp,
    defaultExpanded,
    onExpandedChange,
    renderCell,
    className,
    ...rest
  }: TreeTableProps<T>,
  ref: Ref<HTMLTableElement>,
) {
  const [inner, setInner] = useState<readonly string[]>(defaultExpanded ?? [])
  const controlled = expandedProp !== undefined
  const expandedIds = controlled ? expandedProp : inner
  const onChange = useLatest(onExpandedChange)
  const [activeId, setActiveId] = useState<string>()
  const elements = useRef(new Map<string, HTMLTableRowElement>())
  const body = useRef<HTMLTableSectionElement>(null)

  const nodes = useMemo(() => {
    const open = new Set(expandedIds)
    const out: Node<T>[] = []
    const walk = (siblings: readonly T[], level: number, parentId: string | undefined) => {
      siblings.forEach((row, index) => {
        const id = getRowId(row)
        const children = getChildren(row)
        const expandable = hasChildren ? hasChildren(row) : (children?.length ?? 0) > 0
        const isOpen = expandable && open.has(id)
        out.push({
          row,
          id,
          level: level + 1,
          setSize: siblings.length,
          posInSet: index + 1,
          parentId,
          expandable,
          open: isOpen,
        })
        if (isOpen && children) walk(children, level + 1, id)
      })
    }
    walk(rows, 0, undefined)
    return out
  }, [rows, expandedIds, getRowId, getChildren, hasChildren])

  const tabId = nodes.some((node) => node.id === activeId) ? activeId : nodes[0]?.id

  const setExpanded = useCallback(
    (id: string, open: boolean) => {
      const next = expandedIds.filter((existing) => existing !== id)
      if (open) next.push(id)
      if (!controlled) setInner(next)
      onChange.current?.(next)
    },
    [controlled, expandedIds, onChange],
  )

  // Links and buttons inside a row are reached with Enter on the row, so they stay out of the tab
  // order: the grid is one tab stop, however many rows are open.
  useLayoutEffect(() => {
    body.current?.querySelectorAll<HTMLElement>('a[href], button').forEach((element) => {
      element.setAttribute('tabindex', '-1')
    })
  })

  const moveTo = (id: string | undefined) => {
    if (id === undefined) return
    setActiveId(id)
    elements.current.get(id)?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTableSectionElement>) => {
    const rowElement = (event.target as HTMLElement).closest('tr')
    if (event.target !== rowElement || event.altKey || event.ctrlKey || event.metaKey) return
    const index = nodes.findIndex((node) => elements.current.get(node.id) === rowElement)
    const node = nodes[index]
    if (!node) return
    const go = (to: Dispatch) => {
      event.preventDefault()
      const target = {
        next: nodes[index + 1],
        prev: nodes[index - 1],
        first: nodes[0],
        last: nodes[nodes.length - 1],
      }[to]
      moveTo(target?.id)
    }
    switch (event.key) {
      case 'ArrowDown':
        go('next')
        return
      case 'ArrowUp':
        go('prev')
        return
      case 'Home':
        go('first')
        return
      case 'End':
        go('last')
        return
      case 'ArrowRight':
        if (!node.expandable) return
        event.preventDefault()
        if (!node.open) setExpanded(node.id, true)
        else if (nodes[index + 1]?.parentId === node.id) moveTo(nodes[index + 1]?.id)
        return
      case 'ArrowLeft':
        if (node.open) {
          event.preventDefault()
          setExpanded(node.id, false)
        } else if (node.parentId !== undefined) {
          event.preventDefault()
          moveTo(node.parentId)
        }
        return
      case 'Enter': {
        const link = rowElement.querySelector<HTMLElement>('a[href]')
        if (!link) return
        event.preventDefault()
        link.click()
        return
      }
    }
  }

  // A click on an expandable row opens or closes it, so the whole row is the toggle and the chevron
  // is its hint. Links, buttons and fields inside a cell keep their own clicks.
  const onClick = (event: MouseEvent<HTMLTableSectionElement>) => {
    const target = event.target as HTMLElement
    const rowElement = target.closest('tr')
    const found = nodes.find((node) => elements.current.get(node.id) === rowElement)
    if (!found?.expandable) return
    const own = target.closest('a[href], button, input, select, textarea, label')
    if (own && !own.hasAttribute('data-tree-toggle')) return
    if (window.getSelection()?.toString()) return
    moveTo(found.id)
    setExpanded(found.id, !found.open)
  }

  // Clicking inside a row (or focusing a link in it) makes that row the one tab stop.
  const onFocus = (event: FocusEvent<HTMLTableSectionElement>) => {
    const rowElement = (event.target as HTMLElement).closest('tr')
    const found = nodes.find((node) => elements.current.get(node.id) === rowElement)
    if (found) setActiveId(found.id)
  }

  return (
    <Table
      ref={ref}
      role="treegrid"
      aria-label={label}
      className={cx(styles.treeTable, className)}
      {...rest}
    >
      <Table.Head>
        <Table.Row>
          {columns.map((column) => (
            <Table.HeaderCell
              key={column.id}
              align={column.align}
              numeric={column.numeric}
              width={column.width}
              hideBelow={column.hideBelow}
              hideAbove={column.hideAbove}
            >
              {column.header}
            </Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Head>
      <Table.Body ref={body} onKeyDown={onKeyDown} onFocus={onFocus} onClick={onClick}>
        {nodes.map((node) => (
          <Table.Row
            key={node.id}
            ref={(element) => {
              if (element) elements.current.set(node.id, element)
              else elements.current.delete(node.id)
            }}
            className={styles.row}
            interactive
            tabIndex={node.id === tabId ? 0 : -1}
            aria-level={node.level}
            aria-setsize={node.setSize}
            aria-posinset={node.posInSet}
            aria-expanded={node.expandable ? node.open : undefined}
          >
            {columns.map((column, columnIndex) => {
              return (
                <Table.Cell
                  key={column.id}
                  rowHeader={columnIndex === 0}
                  align={column.align}
                  numeric={column.numeric}
                  hideBelow={column.hideBelow}
                  hideAbove={column.hideAbove}
                >
                  {columnIndex === 0 ? (
                    <span
                      className={styles.treeCellContent}
                      style={{ '--_level': node.level - 1 } as CSSProperties}
                    >
                      <button
                        type="button"
                        className={styles.toggle}
                        tabIndex={-1}
                        aria-hidden="true"
                        data-tree-toggle=""
                        data-leaf={node.expandable ? undefined : ''}
                      >
                        <ChevronRightIcon className={styles.chevron} />
                      </button>
                      {renderCell(node.row, column)}
                    </span>
                  ) : (
                    renderCell(node.row, column)
                  )}
                </Table.Cell>
              )
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

/**
 * A table of rows in a hierarchy, with a toggle on each parent and keyboard navigation like a file
 * tree.
 *
 * @remarks
 * `TreeTable` is a WAI-ARIA `treegrid` set in `Table`'s styles. Hand it the top-level `rows`, how to
 * find a row's `children`, and `renderCell`; it handles the indent, the toggles, and the
 * `aria-level`, `aria-expanded`, `aria-setsize` and `aria-posinset` on every row.
 *
 * ## Keyboard
 *
 * The grid is one tab stop, and the arrow keys move between rows: Up and Down step by row, Right
 * opens a closed row and then steps into its first child, Left closes an open row and then steps
 * out to its parent, Home and End jump to the first and last visible row, and Enter follows the
 * first link in the row. Links and buttons in a row's cells are reached by Enter, not Tab, so put
 * the row's main link in its first column.
 *
 * ## Open rows
 *
 * `expanded` holds the ids of the open rows, as `getRowId` returns them. Pass it with
 * `onExpandedChange` to control them, for example to keep them in the URL, or `defaultExpanded` to
 * choose which start open. For children that load when a row opens, return `true` from
 * `hasChildren` and give the row a placeholder child while they load.
 *
 * @privateRemarks
 * A separate export, not `Table.Tree`, so a plain `import { Table }` never carries the key handling
 * (docs/adr/0044). Ref and native props go to the `<table>`.
 */
export const TreeTable = forwardRef(TreeTableInner) as <T>(
  props: TreeTableProps<T> & RefAttributes<HTMLTableElement>,
) => ReactElement
