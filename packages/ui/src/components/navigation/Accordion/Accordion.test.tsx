import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Accordion } from './Accordion'

function Faq(props: { type?: 'single' | 'multiple' }) {
  const items = (
    <>
      <Accordion.Item value="trial">
        <Accordion.Trigger>How long is the free trial?</Accordion.Trigger>
        <Accordion.Content>
          Fourteen days on any plan, with every feature switched on.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="billing">
        <Accordion.Trigger>How does billing work?</Accordion.Trigger>
        <Accordion.Content>
          Monthly or yearly, per seat, prorated when seats change.
        </Accordion.Content>
      </Accordion.Item>
    </>
  )
  return props.type === 'multiple' ? (
    <Accordion type="multiple">{items}</Accordion>
  ) : (
    <Accordion type="single">{items}</Accordion>
  )
}

describe('Accordion', () => {
  it('wraps triggers in headings and expands/collapses on click (single is collapsible)', async () => {
    render(<Faq />)
    expect(
      screen.getByRole('heading', { level: 3, name: 'How long is the free trial?' }),
    ).toBeInTheDocument()
    const trigger = screen.getByRole('button', { name: 'How long is the free trial?' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(/every feature/)).not.toBeInTheDocument()

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region', { name: 'How long is the free trial?' })).toHaveTextContent(
      'every feature',
    )

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('single closes the previous item; multiple keeps both open', async () => {
    const { unmount } = render(<Faq />)
    await userEvent.click(screen.getByRole('button', { name: 'How long is the free trial?' }))
    await userEvent.click(screen.getByRole('button', { name: 'How does billing work?' }))
    expect(screen.getByRole('button', { name: 'How long is the free trial?' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    unmount()

    render(<Faq type="multiple" />)
    await userEvent.click(screen.getByRole('button', { name: 'How long is the free trial?' }))
    await userEvent.click(screen.getByRole('button', { name: 'How does billing work?' }))
    expect(screen.getByRole('button', { name: 'How long is the free trial?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'How does billing work?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('works from the keyboard', async () => {
    render(<Faq />)
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'How long is the free trial?' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    const billing = screen.getByRole('button', { name: 'How does billing work?' })
    expect(billing).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(billing).toHaveAttribute('aria-expanded', 'true')
  })

  it('exposes variant, size and heading level; forwards refs', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Accordion ref={ref} type="single" variant="contained" size="sm" defaultValue="why">
        <Accordion.Item value="why">
          <Accordion.Trigger level={4}>Why is this invoice overdue?</Accordion.Trigger>
          <Accordion.Content>It was due on 30 September and is still unpaid.</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )
    expect(ref.current).toHaveAttribute('data-variant', 'contained')
    expect(ref.current).toHaveAttribute('data-size', 'sm')
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument()
    expect(screen.getByText(/still unpaid/)).toBeVisible()
  })

  it('puts trailing content inside the trigger, before the chevron', () => {
    render(
      <Accordion type="single" collapsible>
        <Accordion.Item value="semifinal">
          <Accordion.Trigger trailing="+4.5">Beat North Point</Accordion.Trigger>
          <Accordion.Content>Two goals and a clean sheet.</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )
    const trigger = screen.getByRole('button', { name: /Beat North Point/ })
    expect(trigger).toHaveTextContent('Beat North Point+4.5')
    const trailing = screen.getByText('+4.5')
    expect(trailing.tagName).toBe('SPAN')
    expect(trailing.nextElementSibling?.tagName.toLowerCase()).toBe('svg')
  })
})
