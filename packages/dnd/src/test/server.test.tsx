// @vitest-environment node
/**
 * Server rendering: every preset renders its finished markup with no DOM, and the drag
 * engine is never loaded (it touches browser APIs as it loads).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { Board, DragHandle, Draggable, Dnd, DropZone, GridLayout, Sortable } from '#index'

vi.mock('@dnd-kit/dom', () => {
  throw new Error('The drag engine was loaded on the server')
})

describe('on the server', () => {
  it('renders a sortable list', () => {
    const view = renderToString(
      <Sortable
        label="Release checklist"
        defaultItems={[{ id: 'notes', title: 'Write release notes' }]}
        getLabel={(task) => task.title}
      >
        {(task) => task.title}
      </Sortable>,
    )
    expect(view).toContain('aria-label="Release checklist"')
    expect(view).toContain('Write release notes')
    expect(view).toContain('data-kiln-dnd-announcer')
  })

  it('renders a board, drop zones and a grid with items in place', () => {
    const view = renderToString(
      <>
        <Board
          label="Release board"
          columns={[{ id: 'todo', label: 'To do' }]}
          defaultItems={{ todo: [{ id: 'a', title: 'Fix the export button' }] }}
          getLabel={(card) => card.title}
        >
          {(card) => card.title}
        </Board>
        <Dnd>
          <Draggable id="invoice" label="Invoice 1042">
            Invoice 1042
          </Draggable>
          <DropZone id="archive" label="Archive">
            Archive
          </DropZone>
        </Dnd>
        <GridLayout label="Dashboard" defaultLayout={[{ i: 'revenue', x: 2, y: 1, w: 4, h: 2 }]}>
          <GridLayout.Item id="revenue" label="Revenue">
            <DragHandle />
          </GridLayout.Item>
        </GridLayout>
      </>,
    )
    expect(view).toContain('Fix the export button')
    expect(view).toContain('Invoice 1042')
    expect(view).toMatch(/--_x:2;--_y:1;--_w:4;--_h:2/)
    expect(view).toContain('aria-label="Move Revenue"')
  })
})
