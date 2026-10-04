import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Checkbox } from '#components/inputs/Checkbox'
import { Fieldset } from './Fieldset'

describe('Fieldset', () => {
  it('names the group with its legend and describes it', () => {
    const ref = createRef<HTMLFieldSetElement>()
    render(
      <Fieldset
        ref={ref}
        legend="Notify me about"
        description="Sent to your email"
        error="Choose at least one"
      >
        <Checkbox aria-label="Kick-off" />
      </Fieldset>,
    )
    const group = screen.getByRole('group', { name: 'Notify me about' })
    expect(ref.current).toBe(group)
    expect(group).toHaveAccessibleDescription('Sent to your email Choose at least one')
    expect(group).toHaveAttribute('data-invalid')
  })

  it('disables every control inside', () => {
    render(
      <Fieldset legend="Alerts" disabled>
        <Checkbox aria-label="Goals" />
      </Fieldset>,
    )
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('shows warning (hidden once an error message shows) and validating spinner', () => {
    const { rerender, container } = render(
      <Fieldset legend="Notify me about" warning="You've turned off all channels" validating>
        <Checkbox aria-label="Kick-off" />
      </Fieldset>,
    )
    expect(screen.getByText("You've turned off all channels")).toBeInTheDocument()
    expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-busy', 'true')
    rerender(
      <Fieldset
        legend="Notify me about"
        warning="You've turned off all channels"
        error="Choose at least one"
      >
        <Checkbox aria-label="Kick-off" />
      </Fieldset>,
    )
    expect(screen.queryByText("You've turned off all channels")).toBeNull()
  })

  it('errorLive=false drops role=alert; errorHidden keeps invalid without a message', () => {
    const { rerender } = render(
      <Fieldset legend="Alerts" error="Choose at least one" errorLive={false}>
        <Checkbox aria-label="Goals" />
      </Fieldset>,
    )
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('Choose at least one')).toBeInTheDocument()
    rerender(
      <Fieldset legend="Alerts" error="Choose at least one" errorHidden>
        <Checkbox aria-label="Goals" />
      </Fieldset>,
    )
    expect(screen.queryByText('Choose at least one')).toBeNull()
    expect(screen.getByRole('group', { name: 'Alerts' })).toHaveAttribute('data-invalid')
  })

  it('cascades readOnly to controls inside via context', () => {
    render(
      <Fieldset legend="Alerts" readOnly>
        <Checkbox aria-label="Goals" />
      </Fieldset>,
    )
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-readonly', 'true')
  })

  it('sets the variant for section headings, default otherwise', () => {
    const { rerender } = render(
      <Fieldset legend="Your details">
        <Checkbox aria-label="Keep me signed in" />
      </Fieldset>,
    )
    expect(screen.getByRole('group', { name: 'Your details' })).toHaveAttribute(
      'data-variant',
      'default',
    )
    rerender(
      <Fieldset legend="Your details" variant="section">
        <Checkbox aria-label="Keep me signed in" />
      </Fieldset>,
    )
    expect(screen.getByRole('group', { name: 'Your details' })).toHaveAttribute(
      'data-variant',
      'section',
    )
  })

  it('layout: stack by default, horizontal as a data attribute, inline hides the legend', () => {
    const { rerender } = render(
      <Fieldset legend="Plan">
        <Checkbox aria-label="Monthly" />
      </Fieldset>,
    )
    const group = screen.getByRole('group', { name: 'Plan' })
    expect(group).toHaveAttribute('data-layout', 'stack')
    rerender(
      <Fieldset legend="Plan" layout="horizontal">
        <Checkbox aria-label="Monthly" />
      </Fieldset>,
    )
    expect(group).toHaveAttribute('data-layout', 'horizontal')
    expect(screen.getByText('Plan').closest('legend')?.className).not.toMatch(/visuallyHidden/)
    rerender(
      <Fieldset legend="Plan" layout="inline">
        <Checkbox aria-label="Monthly" />
      </Fieldset>,
    )
    expect(screen.getByRole('group', { name: 'Plan' })).toHaveAttribute('data-layout', 'inline')
    expect(screen.getByText('Plan').closest('legend')?.className).toMatch(/visuallyHidden/)
  })
})
