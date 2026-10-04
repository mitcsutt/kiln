import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Numeral } from './Numeral'
import { formatNumeral } from './format'

/** Match a <data> element by its full formatted text (figures and marks are split into runs). */
const byData = (text: string) =>
  screen.getByText((_, el) => el?.tagName === 'DATA' && el.textContent.replace(/\s/g, ' ') === text)

describe('Numeral', () => {
  it('formats en-AU by default inside <data value>', () => {
    const ref = createRef<HTMLDataElement>()
    render(<Numeral ref={ref} value={1234567.891} />)
    const el = byData('1,234,567.891')
    expect(el.tagName).toBe('DATA')
    expect(el).toHaveAttribute('value', '1234567.891')
    expect(ref.current).toBe(el)
  })

  it('uses a true minus sign', () => {
    render(<Numeral value={-3} />)
    expect(byData('−3')).toHaveAttribute('data-sign', 'negative')
  })

  it('applies format options and signDisplay', () => {
    render(
      <Numeral
        value={0.184}
        format={{ style: 'percent', maximumFractionDigits: 1 }}
        signDisplay="exceptZero"
      />,
    )
    expect(byData('+18.4%')).toBeInTheDocument()
  })

  it('colours by sign with tone="auto"', () => {
    render(
      <>
        <Numeral value={3} tone="auto" data-testid="pos" />
        <Numeral value={-2} tone="auto" data-testid="neg" />
        <Numeral value={0} tone="auto" data-testid="zero" />
      </>,
    )
    expect(screen.getByTestId('pos')).toHaveAttribute('data-tone', 'positive')
    expect(screen.getByTestId('neg')).toHaveAttribute('data-tone', 'critical')
    expect(screen.getByTestId('zero')).not.toHaveAttribute('data-tone')
  })

  it('treats negative zero as zero', () => {
    expect(formatNumeral(-0)).toBe('0')
  })

  it('respects the locale', () => {
    expect(formatNumeral(1234.5, 'de-DE')).toBe('1.234,5')
  })
})

describe('Numeral parts', () => {
  it('sets separators and symbols apart from the tabular figures', () => {
    const { container } = render(
      <Numeral value={-1017.4} format={{ style: 'currency', currency: 'AUD' }} />,
    )
    const marks = Array.from(container.querySelectorAll('data > span')).map((s) => s.textContent)
    expect(marks).toEqual(['$', ',', '.'])
    expect(container.querySelector('data')).toHaveTextContent('−$1,017.40')
  })

  it('sets a prefix and suffix as proportional marks around the figures', () => {
    const { container } = render(<Numeral value={47} prefix="≈" suffix=" pts" />)
    const data = container.querySelector('data') as HTMLElement
    expect(data).toHaveTextContent('≈47 pts')
    expect(data.firstElementChild).toHaveAttribute('data-affix', 'prefix')
    expect(data.lastElementChild).toHaveAttribute('data-affix', 'suffix')
    expect(data).toHaveAttribute('value', '47')
  })
})
