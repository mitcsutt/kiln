import { act, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { parityFixtures } from '#stories/fixtures'
import { a11yTree } from '#test/a11yTree'

/**
 * The two sides name their form landmark apart (`… (component mode)` / `… (schema mode)`, so a
 * page showing both has unique landmarks). Compare everything else: the form's own
 * name is dropped from its line.
 */
function sansFormName(tree: string[], name: string): string[] {
  return tree.map((line) =>
    line.replace(
      new RegExp(
        `^form "${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\((component|schema) mode\\)"`,
      ),
      'form',
    ),
  )
}

/** §10.11: every row of the parity table renders the same accessibility tree in both modes. */
describe('render equivalence (component mode ↔ schema mode)', () => {
  it('covers every layout key and content kind', () => {
    const covered = new Set(parityFixtures.flatMap((fixture) => fixture.covers))
    const expected = [
      'stack',
      'inline',
      'grid',
      'gridItem',
      'section',
      'aside',
      'rows',
      'panels',
      'panel',
      'tabs',
      'tab',
      'accordion',
      'accordionItem',
      'steps',
      'step',
      'repeater',
      'sentence',
      'review',
      'actions',
      'when',
      'heading',
      'text',
      'alert',
      'divider',
      'submit',
      'reset',
      'errorSummary',
      'status',
    ]
    expect(expected.filter((key) => !covered.has(key))).toEqual([])
  })

  for (const fixture of parityFixtures) {
    const { name } = fixture
    describe(name, () => {
      it('renders the same roles and names', () => {
        const view = render(<fixture.ComponentMode />)
        const componentTree = sansFormName(a11yTree(view.container), fixture.name)
        view.unmount()
        const { container, unmount } = render(<fixture.SchemaMode />)
        const schemaTree = sansFormName(a11yTree(container), fixture.name)
        unmount()
        expect(componentTree.length).toBeGreaterThan(1)
        // The landmark name was stripped on both sides (nothing else differs).
        expect(componentTree.filter((line) => line.startsWith('form "'))).toEqual([])
        expect(schemaTree).toEqual(componentTree)
      })

      it('renders the same roles and names after an invalid submit', async () => {
        const trees: string[][] = []
        for (const Mode of [fixture.ComponentMode, fixture.SchemaMode]) {
          const view = render(<Mode />)
          const form = within(view.container).getByRole('form')
          await act(async () => {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
            await Promise.resolve()
          })
          await screen.findAllByRole('form')
          trees.push(sansFormName(a11yTree(view.container), fixture.name))
          view.unmount()
        }
        expect(trees[0]?.filter((line) => line.startsWith('form "'))).toEqual([])
        expect(trees[1]).toEqual(trees[0])
      })
    })
  }
})
