import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { DateTimeField } from './DateTimeField'

describe('DateTimeField', () => {
  it('labels the date-time group and marks it invalid from error; ref → box', () => {
    const ref = createRef<HTMLDivElement>()
    render(<DateTimeField ref={ref} label="Publish at" error="Pick a time after now" />)
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Publish at' }))
    expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveAttribute('aria-invalid', 'true')
  })
})
