import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubmitButton } from '#components/SubmitButton'
import { renderForm } from '#test/renderForm'
import { FormSentence } from './FormSentence'

const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)

describe('FormSentence', () => {
  it('is a fieldset with a hidden legend; inline fields keep their labels for AT', () => {
    renderForm(
      (f) => (
        <FormSentence label="Reading goal">
          I want to read <f.TextField name="goal" label="Goal" /> by{' '}
          <f.DateField name="deadline" label="Deadline" />.
        </FormSentence>
      ),
      { defaultValues: { goal: '', deadline: '' } },
    )
    const group = screen.getByRole('group', { name: 'Reading goal' })
    expect(group.tagName).toBe('FIELDSET')
    expect(screen.getByRole('textbox', { name: 'Goal' }).closest('[data-layout]')).toHaveAttribute(
      'data-layout',
      'inline',
    )
    expect(screen.getByText(/I want to read/)).toBeInTheDocument()
  })

  it('renders errors below the sentence, each referenced by its control via aria-describedby', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <FormSentence label="Reading goal">
            I want to read{' '}
            <f.TextField name="goal" label="Goal" validators={{ onDynamic: required }} /> by{' '}
            <f.TextField name="when" label="Target date" />.
          </FormSentence>
          <SubmitButton>Save goal</SubmitButton>
        </>
      ),
      { defaultValues: { goal: '', when: '' } },
    )
    await user.click(screen.getByRole('button', { name: 'Save goal' }))
    const goal = screen.getByRole('textbox', { name: 'Goal' })
    await waitFor(() => expect(goal).toHaveAttribute('aria-invalid', 'true'))
    expect(goal).toHaveAccessibleDescription(/Goal: Enter a value/)
    const describedBy = goal.getAttribute('aria-describedby') ?? ''
    const message = describedBy
      .split(' ')
      .map((id) => document.getElementById(id))
      .find((element) => element?.textContent.includes('Enter a value'))
    expect(message).toBeDefined()
    expect(message?.closest('fieldset')).toBe(screen.getByRole('group', { name: 'Reading goal' }))
    // the message is not rendered inline inside the field
    expect(screen.getAllByText(/Enter a value/)).toHaveLength(1)
  })
})
