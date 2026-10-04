import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormColorField } from '#fields/FormColorField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

runFieldConformance<string>('color', {
  build: (props) => <FormColorField {...props} />,
  valid: '#336699',
  invalid: '',
  interact: async (user, control, value) => {
    await user.clear(control)
    if (value) await user.type(control, value)
    // ColorInput deliberately doesn't let an outside value change clobber in-progress typing
    // (it only re-syncs its draft once editing ends) — commit by leaving the control.
    await user.tab()
  },
})

// These bind through the canonical `form.AppField` path — the same binding the typed
// `f.ColorField` shorthand uses.
describe('FormColorField', () => {
  it('binds through the canonical field path and writes a hex colour', async () => {
    const { form, user } = renderForm(
      (f) => <f.AppField name="colour">{() => <FormColorField label="Team colour" />}</f.AppField>,
      { defaultValues: { colour: '' } },
    )
    await user.type(screen.getByLabelText('Team colour'), '#ff6b57')
    expect(form.state.values.colour).toBe('#ff6b57')
  })

  it('shows the matching swatch name in view mode', () => {
    renderForm(
      (f) => (
        <f.AppField name="colour">
          {() => (
            <FormColorField label="Team colour" swatches={[{ value: '#ff6b57', label: 'Coral' }]} />
          )}
        </f.AppField>
      ),
      { defaultValues: { colour: '#ff6b57' }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Coral (#ff6b57)')).toBeInTheDocument()
  })

  it('falls back to the hex code in view mode when no swatch matches', () => {
    renderForm(
      (f) => <f.AppField name="colour">{() => <FormColorField label="Team colour" />}</f.AppField>,
      { defaultValues: { colour: '#336699' }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('#336699')).toBeInTheDocument()
  })
})
