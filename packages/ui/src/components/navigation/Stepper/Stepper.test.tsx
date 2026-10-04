import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Stepper, type StepperStep } from './Stepper'

const steps: StepperStep[] = [
  { value: 'you', label: 'You' },
  { value: 'team', label: 'Team' },
  { value: 'pay', label: 'Pay' },
  { value: 'review', label: 'Review' },
]

describe('Stepper', () => {
  it('renders an ordered list with aria-current on the current step', () => {
    render(<Stepper steps={steps} value="team" />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    const current = screen.getByText('Team').closest('[aria-current]')
    expect(current).toHaveAttribute('aria-current', 'step')
    const you = screen.getByText('You')
    expect(you.closest('[aria-current]')).toBeNull()
  })

  it('derives complete/upcoming status from position relative to value', () => {
    render(<Stepper steps={steps} value="pay" />)
    expect(screen.getByText('You').closest('li')).toHaveAttribute('data-status', 'complete')
    expect(screen.getByText('Team').closest('li')).toHaveAttribute('data-status', 'complete')
    expect(screen.getByText('Pay').closest('li')).toHaveAttribute('data-status', 'current')
    expect(screen.getByText('Review').closest('li')).toHaveAttribute('data-status', 'upcoming')
  })

  it('lets a step override its status (e.g. error) and announces a hidden suffix', () => {
    const errorSteps: StepperStep[] = steps.map((step) =>
      step.value === 'team' ? { ...step, status: 'error' } : step,
    )
    render(<Stepper steps={errorSteps} value="pay" statusLabels={{ error: 'needs attention' }} />)
    expect(screen.getByText('Team').closest('li')).toHaveAttribute('data-status', 'error')
    expect(screen.getByText('needs attention')).toBeInTheDocument()
  })

  it('keeps aria-current on the current step when it is invalid, and adds the error treatment', () => {
    const invalidSteps: StepperStep[] = steps.map((step) =>
      step.value === 'team' ? { ...step, invalid: true } : step,
    )
    render(<Stepper steps={invalidSteps} value="team" onStepSelect={() => undefined} />)
    const current = screen.getByRole('button', { name: 'Team has errors' })
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(current).toHaveAttribute('data-status', 'current')
    expect(current).toHaveAttribute('data-invalid', 'true')
    expect(current.closest('li')).toHaveAttribute('data-invalid', 'true')
  })

  it('keeps the progress status of an invalid step and announces the error suffix instead of the complete one', () => {
    const invalidSteps: StepperStep[] = steps.map((step) =>
      step.value === 'you' ? { ...step, invalid: true } : step,
    )
    render(
      <Stepper
        steps={invalidSteps}
        value="pay"
        statusLabels={{ complete: 'done', error: 'needs attention' }}
      />,
    )
    const you = screen.getByText('You').closest('li')
    expect(you).toHaveAttribute('data-status', 'complete')
    expect(you).toHaveAttribute('data-invalid', 'true')
    expect(you).toHaveTextContent(/^You needs attention$/)
    expect(screen.getByText('Team').closest('li')).toHaveTextContent(/^Team done$/)
  })

  it('marks a status error step as invalid too, and leaves valid steps unmarked', () => {
    const errorSteps: StepperStep[] = steps.map((step) =>
      step.value === 'team' ? { ...step, status: 'error' } : step,
    )
    render(<Stepper steps={errorSteps} value="pay" />)
    expect(screen.getByText('Team').closest('li')).toHaveAttribute('data-invalid', 'true')
    expect(screen.getByText('Pay').closest('li')).not.toHaveAttribute('data-invalid')
  })

  it('renders static (non-interactive) steps when onStepSelect is omitted', () => {
    render(<Stepper steps={steps} value="team" />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders steps as buttons and calls onStepSelect when set', async () => {
    const user = userEvent.setup()
    const onStepSelect = vi.fn()
    render(<Stepper steps={steps} value="team" onStepSelect={onStepSelect} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(steps.length)
    await user.click(screen.getByRole('button', { name: /You/ }))
    expect(onStepSelect).toHaveBeenCalledWith('you')
  })

  it('sets the compact-mode data attribute and renders the formatted summary', () => {
    const { container } = render(<Stepper steps={steps} value="team" compactBelow="md" />)
    expect(container.firstElementChild).toHaveAttribute('data-compact-below', 'md')
    expect(screen.getByText(/Step 2 of 4/)).toBeInTheDocument()
    expect(screen.getByText(/Team/, { selector: 'p' })).toBeInTheDocument()
  })

  it('omits the compact-mode data attribute when compactBelow is unset', () => {
    const { container } = render(<Stepper steps={steps} value="team" />)
    expect(container.firstElementChild).not.toHaveAttribute('data-compact-below')
  })

  it('supports a custom formatCompact', () => {
    render(
      <Stepper
        steps={steps}
        value="pay"
        compactBelow="sm"
        formatCompact={(index, total, label) =>
          `${typeof label === 'string' ? label : ''} (${String(index + 1)}/${String(total)})`
        }
      />,
    )
    expect(screen.getByText('Pay (3/4)')).toBeInTheDocument()
  })

  it('supports vertical orientation via a data attribute', () => {
    render(<Stepper steps={steps} value="you" orientation="vertical" />)
    expect(screen.getByRole('list')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('forwards a ref to the underlying ol', () => {
    const ref = { current: null as HTMLOListElement | null }
    render(<Stepper steps={steps} value="you" ref={ref} />)
    expect(ref.current?.tagName).toBe('OL')
  })
})
