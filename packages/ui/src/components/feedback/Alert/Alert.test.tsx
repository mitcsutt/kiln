import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Alert } from './Alert'

describe('Alert', () => {
  it.each([
    ['critical', 'alert'],
    ['caution', 'alert'],
    ['info', 'status'],
    ['positive', 'status'],
    ['neutral', 'status'],
  ] as const)('%s tone uses role=%s', (tone, role) => {
    render(<Alert tone={tone}>Budget synced</Alert>)
    expect(screen.getByRole(role)).toHaveAttribute('data-tone', tone)
  })

  it('lets consumers override the role', () => {
    render(
      <Alert tone="critical" role="note">
        Static note
      </Alert>,
    )
    expect(screen.getByRole('note')).toBeInTheDocument()
  })

  it('is named by its title and forwards refs', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Alert ref={ref} tone="critical" title="Couldn't load fixtures">
        The results service didn't answer.
      </Alert>,
    )
    const alert = screen.getByRole('alert', { name: "Couldn't load fixtures" })
    expect(ref.current).toBe(alert)
    expect(alert).toHaveTextContent("The results service didn't answer.")
  })

  it('renders a dismiss button only when onDismiss is given', async () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<Alert>Saved</Alert>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(
      <Alert onDismiss={onDismiss} dismissLabel="Hide message">
        Saved
      </Alert>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Hide message' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('can drop the glyph', () => {
    const { container } = render(<Alert icon={null}>Plain</Alert>)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('defaults to the outline variant and keeps soft available', () => {
    const { rerender } = render(<Alert title="Scores refresh every 30 seconds" />)
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'outline')
    rerender(<Alert variant="soft" title="Scores refresh every 30 seconds" />)
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'soft')
    expect(screen.getByRole('status')).toHaveAttribute('data-kiln-component')
  })
})
