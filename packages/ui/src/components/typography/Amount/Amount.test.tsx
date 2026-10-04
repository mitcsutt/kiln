import { render, screen } from '@testing-library/react'
import { Amount } from './Amount'

/** Match a <data> element by its full formatted text (figures and marks are split into runs). */
const byData = (text: string) =>
  screen.getByText((_, el) => el?.tagName === 'DATA' && el.textContent.replace(/\s/g, ' ') === text)

describe('Amount', () => {
  it('formats AUD in en-AU with two decimals by default', () => {
    render(<Amount value={4182.6} />)
    const el = byData('$4,182.60')
    expect(el.tagName).toBe('DATA')
    expect(el).toHaveAttribute('value', '4182.6')
  })

  it('shows negatives with a true minus', () => {
    render(<Amount value={-82.4} />)
    expect(byData('−$82.40')).toBeInTheDocument()
  })

  it('puts accounting negatives in parentheses in the critical tone', () => {
    render(<Amount value={-1234.5} accounting />)
    const el = byData('($1,234.50)')
    expect(el).toHaveAttribute('data-tone', 'critical')
    expect(el).toHaveAttribute('data-accounting')
  })

  it('leaves accounting positives in the default tone', () => {
    render(<Amount value={1234.5} accounting />)
    expect(byData('$1,234.50')).not.toHaveAttribute('data-tone')
  })

  it('supports precision, sign and compact', () => {
    render(
      <>
        <Amount value={1200} precision={0} showSign />
        <Amount value={1234567} compact />
        <Amount value={0} showSign />
      </>,
    )
    expect(byData('+$1,200')).toBeInTheDocument()
    expect(byData('$1.2M')).toBeInTheDocument()
    expect(byData('$0.00')).toBeInTheDocument()
  })

  it('formats other currencies', () => {
    render(<Amount value={12} currency="USD" />)
    expect(byData('USD 12.00')).toBeInTheDocument()
  })

  it('reserves the width of ")" on non-negative accounting amounts, hidden from the text', () => {
    const { container } = render(
      <>
        <Amount value={1234.5} accounting data-testid="pos" />
        <Amount value={0} accounting data-testid="zero" />
        <Amount value={-1234.5} accounting data-testid="neg" />
        <Amount value={1234.5} data-testid="plain" />
      </>,
    )
    const pad = (id: string) =>
      container.querySelector(`[data-testid="${id}"] [data-accounting-pad]`)
    expect(pad('pos')).not.toBeNull()
    expect(pad('pos')).toHaveAttribute('aria-hidden', 'true')
    expect(pad('pos')?.parentElement).toHaveAttribute('data-affix', 'suffix')
    expect(pad('zero')).not.toBeNull()
    expect(pad('neg')).toBeNull()
    expect(pad('plain')).toBeNull()
    // The pad adds no characters: copy/paste and the accessible text stay "$1,234.50".
    expect(container.querySelector('[data-testid="pos"]')?.textContent).toBe('$1,234.50')
  })
})
