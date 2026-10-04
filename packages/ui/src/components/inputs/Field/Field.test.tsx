import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Input } from '#components/inputs/Input'
import { Field } from './Field'
import { useFieldControl } from '#components/inputs/internal/FieldContext'

describe('Field', () => {
  it('associates the label with the control and forwards the ref to the wrapper', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Field ref={ref} label="Amount">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Amount')
    expect(input.tagName).toBe('INPUT')
    expect(ref.current).toContainElement(input)
  })

  it('wires description and error into aria-describedby and sets aria-invalid', () => {
    render(
      <Field label="Amount" description="Include GST" error="Enter an amount above $0">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Amount')
    expect(input).toHaveAccessibleDescription('Include GST Enter an amount above $0')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an amount above $0')
    expect(input.parentElement).toHaveAttribute('data-invalid')
  })

  it('has no aria-invalid or describedby without description/error', () => {
    render(
      <Field label="Payee">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Payee')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('accepts hint as an alias of description', () => {
    render(
      <Field label="Payee" hint="As it appears on the statement">
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Payee')).toHaveAccessibleDescription(
      'As it appears on the statement',
    )
  })

  it('marks required visually and with aria-required, and shows an optional hint', () => {
    const { rerender } = render(
      <Field label="Payee" required>
        <Input />
      </Field>,
    )
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true')
    rerender(
      <Field label="Payee" optional>
        <Input />
      </Field>,
    )
    expect(screen.getByText('Optional')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required')
  })

  it('error={true} marks invalid without rendering a message', () => {
    render(
      <Field label="Amount" error>
        <Input />
      </Field>,
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('clones wiring into any single element child, keeping its own id', () => {
    render(
      <Field label="Due date" description="Day of the month" error="Pick a day">
        <input id="due" type="number" aria-describedby="extra" />
      </Field>,
    )
    const input = screen.getByLabelText('Due date')
    expect(input).toHaveAttribute('id', 'due')
    expect(input.getAttribute('aria-describedby')).toBe('extra due-description due-error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('passes wiring to a render function', () => {
    render(
      <Field label="Budget" description="Monthly" required htmlFor="budget">
        {(props) => <input {...props} />}
      </Field>,
    )
    const input = screen.getByLabelText(/Budget/)
    expect(input).toHaveAttribute('id', 'budget')
    expect(input).toHaveAccessibleDescription('Monthly')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toBeRequired()
  })

  it('keeps a hidden label accessible', () => {
    render(
      <Field label="Search transactions" labelHidden>
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Search transactions')).toBeInTheDocument()
  })

  it('shows a warning and includes it in describedby, after description and before error', () => {
    render(
      <Field label="Password" description="At least 12 characters" warning="Weak password">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAccessibleDescription('At least 12 characters Weak password')
    expect(screen.getByText('Weak password')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('hides the warning once an error message is shown', () => {
    render(
      <Field label="Password" warning="Weak password" error="Too short">
        <Input />
      </Field>,
    )
    expect(screen.queryByText('Weak password')).toBeNull()
    expect(screen.getByRole('alert')).toHaveTextContent('Too short')
  })

  it('errorLive=false renders the message without role=alert, still described', () => {
    render(
      <Field label="Email" error="Required" errorLive={false}>
        <Input />
      </Field>,
    )
    expect(screen.queryByRole('alert')).toBeNull()
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAccessibleDescription('Required')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('errorHidden keeps aria-invalid but renders no message', () => {
    render(
      <Field label="Email" error="Required" errorHidden>
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByText('Required')).toBeNull()
  })

  it('sets the layout data attribute and renders the horizontal/inline DOM the same way', () => {
    const { rerender, container } = render(
      <Field label="Name">
        <Input />
      </Field>,
    )
    expect(container.firstElementChild).toHaveAttribute('data-layout', 'stack')
    rerender(
      <Field label="Name" layout="horizontal">
        <Input />
      </Field>,
    )
    expect(container.firstElementChild).toHaveAttribute('data-layout', 'horizontal')
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    rerender(
      <Field label="Name" layout="inline">
        <Input />
      </Field>,
    )
    expect(container.firstElementChild).toHaveAttribute('data-layout', 'inline')
    // inline forces the label visually hidden, but it's still the accessible name
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('validating shows a spinner and sets aria-busy on the control', () => {
    const { container } = render(
      <Field label="Team" validating>
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Team')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
  })

  it('readOnly sets the native readonly attribute on Input and keeps it focusable', () => {
    render(
      <Field label="Reference" readOnly>
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Reference')
    expect(input).toHaveAttribute('readonly')
    expect(input).not.toBeDisabled()
  })

  it('disables the control and exposes context via useFieldControl', () => {
    function Probe() {
      const ctx = useFieldControl()
      return <span data-testid="probe">{ctx ? String(ctx.disabled) : 'none'}</span>
    }
    render(
      <>
        <Field label="Locked" disabled>
          <Input />
        </Field>
        <Field label="Probe" disabled>
          <Probe />
        </Field>
        <Probe />
      </>,
    )
    expect(screen.getByLabelText('Locked')).toBeDisabled()
    const probes = screen.getAllByTestId('probe')
    expect(probes[0]).toHaveTextContent('true')
    expect(probes[1]).toHaveTextContent('none')
  })
})
