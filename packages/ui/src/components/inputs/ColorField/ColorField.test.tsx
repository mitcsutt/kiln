import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { ColorField } from './ColorField'

const TEAM = [
  { value: '#ff6b57', label: 'Coral' },
  { value: '#e8b730', label: 'Gold' },
  { value: '#1f9e8f', label: 'Teal' },
  { value: '#5b2a4e', label: 'Aubergine' },
]

describe('ColorField', () => {
  it('labels the hex input and the swatch group; wires description and error', () => {
    const ref = createRef<HTMLElement>()
    render(
      <ColorField
        ref={ref}
        label="Team colour"
        description="Shown on the fixture list"
        error="Pick a colour"
        swatches={TEAM}
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Team colour' })
    expect(ref.current).toBe(input)
    expect(input).toHaveAccessibleDescription('Shown on the fixture list Pick a colour')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('radiogroup', { name: 'Team colour presets' })).toBeInTheDocument()
  })

  it('swatchesOnly: the group is named by the label alone and described', async () => {
    const onValueChange = vi.fn()
    render(
      <ColorField
        label="Team colour"
        description="Shown on the fixture list"
        swatches={TEAM}
        swatchesOnly
        onValueChange={onValueChange}
      />,
    )
    const group = screen.getByRole('radiogroup', { name: 'Team colour' })
    expect(group).toHaveAccessibleDescription('Shown on the fixture list')
    await userEvent.click(screen.getByText('Team colour'))
    expect(screen.getByRole('radio', { name: 'Coral' })).toHaveFocus()
    await userEvent.click(screen.getByRole('radio', { name: 'Gold' }))
    expect(onValueChange).toHaveBeenCalledWith('#e8b730')
  })

  it('passes id, readOnly and disabled through', () => {
    const { rerender } = render(<ColorField id="colour" label="Colour" readOnly />)
    expect(screen.getByLabelText('Colour')).toHaveAttribute('id', 'colour')
    expect(screen.getByLabelText('Colour')).toHaveAttribute('readonly')
    rerender(<ColorField id="colour" label="Colour" disabled />)
    expect(screen.getByLabelText('Colour')).toBeDisabled()
  })
})
