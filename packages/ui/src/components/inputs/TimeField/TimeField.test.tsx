import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { TimeField } from './TimeField'

describe('TimeField', () => {
  it('labels the time group and wires the description; ref → box', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <TimeField
        ref={ref}
        label="Opens at"
        description="Local time"
        hourCycle={24}
        defaultValue="08:30"
      />,
    )
    const group = screen.getByRole('group', { name: 'Opens at' })
    expect(ref.current).toBe(group)
    expect(group).toHaveAccessibleDescription('Local time')
    expect(screen.getByRole('spinbutton', { name: 'Hour' })).toHaveTextContent('08')
  })
})
