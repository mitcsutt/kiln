import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { must } from '#test/must'
import { renderForm } from '#test/renderForm'

const teams = [
  { value: 'platform', label: 'Platform', swatch: 3 },
  { value: 'design', label: 'Design', swatch: '#7c3aed' },
  { value: 'support', label: 'Support' },
] as const

/** The swatch drawn inside `element`, if any. */
const swatchIn = (element: HTMLElement) =>
  element.querySelector<HTMLElement>('[data-color], [style*="--_swatch"]')

describe('option swatches', () => {
  it('chips draw each option’s swatch before its label, and none where it has none', () => {
    renderForm(
      (f) => <f.ChipsField name="teams" label="Teams" options={teams.map((team) => team)} />,
      { defaultValues: { teams: [] as string[] } },
    )
    const platform = screen.getByRole('button', { name: 'Platform' })
    expect(swatchIn(platform)).toHaveAttribute('data-color', '3')
    expect(
      must(swatchIn(screen.getByRole('button', { name: 'Design' }))).style.getPropertyValue(
        '--_swatch',
      ),
    ).toBe('#7c3aed')
    const support = screen.getByRole('button', { name: 'Support' })
    expect(swatchIn(support)).toBeNull()
  })

  it('segmented draws the swatch in each segment', () => {
    renderForm(
      (f) => <f.SegmentedField name="team" label="Team" options={teams.map((team) => team)} />,
      { defaultValues: { team: null as string | null } },
    )
    expect(swatchIn(screen.getByRole('radio', { name: 'Platform' }))).toHaveAttribute(
      'data-color',
      '3',
    )
    const support = screen.getByRole('radio', { name: 'Support' })
    expect(swatchIn(support)).toBeNull()
  })

  it('the tags of chips, checkbox group and multi choice cards carry it in view mode', () => {
    renderForm(
      (f) => (
        <>
          <f.ChipsField name="chips" label="Chips" options={teams.map((team) => team)} />
          <f.CheckboxGroupField name="group" label="Group" options={teams.map((team) => team)} />
          <f.MultiChoiceCardsField name="cards" label="Cards" options={teams.map((team) => team)} />
        </>
      ),
      {
        defaultValues: {
          chips: ['platform', 'support'],
          group: ['platform', 'support'],
          cards: ['platform', 'support'],
        },
        formProps: { mode: 'view' },
      },
    )
    for (const label of ['Chips', 'Group', 'Cards']) {
      const item = must(screen.getByText(label).parentElement)
      expect(swatchIn(must(within(item).getByText('Platform').parentElement))).toHaveAttribute(
        'data-color',
        '3',
      )
      const support = must(within(item).getByText('Support').parentElement)
      expect(swatchIn(support)).toBeNull()
    }
  })

  it('options without swatches render as they always have', () => {
    const { container } = renderForm(
      (f) => (
        <f.ChipsField
          name="teams"
          label="Teams"
          options={[
            { value: 'platform', label: 'Platform' },
            { value: 'design', label: 'Design' },
          ]}
        />
      ),
      { defaultValues: { teams: [] as string[] } },
    )
    expect(container.querySelector('[data-color]')).toBeNull()
  })
})
