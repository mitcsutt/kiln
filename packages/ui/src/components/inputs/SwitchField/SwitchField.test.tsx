import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { SwitchField } from './SwitchField'

describe('SwitchField', () => {
  it('labels the switch, forwards the ref and wires description, warning and error', () => {
    const ref = createRef<HTMLButtonElement>()
    const { rerender } = render(
      <SwitchField
        ref={ref}
        label="Email me when rent is due"
        description="Three days before the 1st"
        warning="Your email isn't verified yet"
      />,
    )
    const sw = screen.getByRole('switch', { name: 'Email me when rent is due' })
    expect(ref.current).toBe(sw)
    expect(sw).toHaveAccessibleDescription(
      "Three days before the 1st Your email isn't verified yet",
    )
    rerender(
      <SwitchField label="Email me when rent is due" error="Turn this on to continue" required />,
    )
    expect(sw).toHaveAttribute('aria-invalid', 'true')
    expect(sw).toHaveAttribute('aria-required', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Turn this on to continue')
    expect(sw).toHaveAccessibleDescription('Turn this on to continue')
  })

  it('is uncontrolled with defaultChecked; clicking the label toggles', async () => {
    const onCheckedChange = vi.fn()
    render(<SwitchField label="Repeats monthly" defaultChecked onCheckedChange={onCheckedChange} />)
    const sw = screen.getByRole('switch')
    expect(sw).toBeChecked()
    await userEvent.click(screen.getByText('Repeats monthly'))
    expect(sw).not.toBeChecked()
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })

  it('is controlled with checked', async () => {
    function Controlled() {
      const [on, setOn] = useState(false)
      return (
        <>
          <SwitchField label="Repeats monthly" checked={on} onCheckedChange={setOn} />
          <output>{on ? 'on' : 'off'}</output>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole('switch'))
    expect(screen.getByRole('status')).toHaveTextContent('on')
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('readOnly holds even when uncontrolled; disabled disables', async () => {
    const onCheckedChange = vi.fn()
    const { rerender } = render(
      <SwitchField label="Sync" readOnly onCheckedChange={onCheckedChange} />,
    )
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(sw)
    expect(sw).not.toBeChecked()
    expect(onCheckedChange).not.toHaveBeenCalled()
    rerender(<SwitchField label="Sync" disabled />)
    expect(sw).toBeDisabled()
  })

  it('uses the given id, merges aria-describedby, and fires onBlur', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <p id="note">Applies to every account</p>
        <SwitchField
          id="sync"
          label="Sync"
          description="Every hour"
          aria-describedby="note"
          onBlur={onBlur}
        />
      </>,
    )
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('id', 'sync')
    expect(sw).toHaveAccessibleDescription('Applies to every account Every hour')
    await userEvent.click(sw)
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('submits name when on', async () => {
    render(
      <form data-testid="form">
        <SwitchField label="Sync" name="sync" />
      </form>,
    )
    const form = screen.getByTestId<HTMLFormElement>('form')
    expect(new FormData(form).get('sync')).toBeNull()
    await userEvent.click(screen.getByRole('switch'))
    expect(new FormData(form).get('sync')).toBe('on')
  })

  it('keeps the label for assistive tech only with labelHidden', () => {
    render(<SwitchField label="Sync" labelHidden />)
    expect(screen.getByRole('switch', { name: 'Sync' })).toBeInTheDocument()
  })
})
