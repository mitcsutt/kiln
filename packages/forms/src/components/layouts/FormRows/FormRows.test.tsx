import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderForm } from '#test/renderForm'
import { FormRows } from './FormRows'

describe('FormRows', () => {
  it('renders every field inside in the horizontal layout', () => {
    renderForm(
      (f) => (
        <FormRows>
          <f.TextField name="name" label="Display name" />
          <f.TextField name="email" label="Email" />
        </FormRows>
      ),
      { defaultValues: { name: '', email: '' } },
    )
    for (const label of ['Display name', 'Email']) {
      expect(screen.getByLabelText(label).closest('[data-layout]')).toHaveAttribute(
        'data-layout',
        'horizontal',
      )
    }
  })

  it('lets a field keep its own layout', () => {
    renderForm(
      (f) => (
        <FormRows>
          <f.TextField name="name" label="Display name" layout="stack" />
        </FormRows>
      ),
      { defaultValues: { name: '' } },
    )
    expect(screen.getByLabelText('Display name').closest('[data-layout]')).toHaveAttribute(
      'data-layout',
      'stack',
    )
  })
})
