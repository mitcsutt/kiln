import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ErrorSummary } from '#components/form/ErrorSummary'
import { SubmitButton } from '#components/form/SubmitButton'
import { renderForm } from '#test/renderForm'

const required =
  (message: string) =>
  ({ value }: { value: string }) =>
    value === '' ? message : undefined

function setup() {
  return renderForm(
    (f) => (
      <>
        <ErrorSummary />
        <f.TextField
          name="name"
          label="Full name"
          required
          validators={{ onDynamic: required('Enter your full name') }}
        />
        <f.TextField
          name="email"
          label="Email"
          validators={{ onDynamic: required('Enter your email') }}
        />
        <SubmitButton>Register</SubmitButton>
      </>
    ),
    { defaultValues: { name: '', email: '' } },
  )
}

describe('ErrorSummary', () => {
  it('renders nothing before a submit attempt', () => {
    setup()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('announces once: one alert; inline errors are not live after submit', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Register' }))
    const alert = await screen.findByRole('alert')
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(
      within(alert).getByRole('heading', { level: 2, name: 'There is a problem' }),
    ).toBeInTheDocument()
    const links = within(alert).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'Full name: Enter your full name',
      'Email: Enter your email',
    ])
  })

  it('takes focus on an invalid submit (focusOnInvalid auto) and links focus the control', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Register' }))
    const alert = await screen.findByRole('alert')
    await waitFor(() => expect(alert).toHaveFocus())
    await user.click(within(alert).getByRole('link', { name: 'Email: Enter your email' }))
    await waitFor(() => expect(screen.getByLabelText('Email')).toHaveFocus())
  })

  it('re-mounts per attempt and drops fixed errors', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Register' }))
    const first = await screen.findByRole('alert')
    // Let the post-submit focus move land before typing.
    await waitFor(() => expect(first).toHaveFocus())
    await user.type(screen.getByLabelText(/Full name/), 'Ada')
    await waitFor(() => expect(within(first).queryByText(/Full name/)).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Register' }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).not.toBe(first)
    })
  })
})
