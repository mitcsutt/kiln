import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Accordion } from './Accordion'

function Faq(props: { type?: 'single' | 'multiple' }) {
  const items = (
    <>
      <Accordion.Item value="fixtures">
        <Accordion.Trigger>How are fixtures set?</Accordion.Trigger>
        <Accordion.Content>
          Every club plays every other club twice, in four blocks.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="scoring">
        <Accordion.Trigger>How does scoring work?</Accordion.Trigger>
        <Accordion.Content>
          Three points a win, one a draw, double for cup matches.
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
      screen.getByRole('heading', { level: 3, name: 'How are fixtures set?' }),
    ).toBeInTheDocument()
    const trigger = screen.getByRole('button', { name: 'How are fixtures set?' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(/four blocks/)).not.toBeInTheDocument()

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region', { name: 'How are fixtures set?' })).toHaveTextContent(
      'four blocks',
    )

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('single closes the previous item; multiple keeps both open', async () => {
    const { unmount } = render(<Faq />)
    await userEvent.click(screen.getByRole('button', { name: 'How are fixtures set?' }))
    await userEvent.click(screen.getByRole('button', { name: 'How does scoring work?' }))
    expect(screen.getByRole('button', { name: 'How are fixtures set?' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    unmount()

    render(<Faq type="multiple" />)
    await userEvent.click(screen.getByRole('button', { name: 'How are fixtures set?' }))
    await userEvent.click(screen.getByRole('button', { name: 'How does scoring work?' }))
    expect(screen.getByRole('button', { name: 'How are fixtures set?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'How does scoring work?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('works from the keyboard', async () => {
    render(<Faq />)
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'How are fixtures set?' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    const scoring = screen.getByRole('button', { name: 'How does scoring work?' })
    expect(scoring).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(scoring).toHaveAttribute('aria-expanded', 'true')
  })

  it('exposes variant, size and heading level; forwards refs', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Accordion ref={ref} type="single" variant="contained" size="sm" defaultValue="why">
        <Accordion.Item value="why">
          <Accordion.Trigger level={4}>Why was Wales eliminated?</Accordion.Trigger>
          <Accordion.Content>Third in Group B on goal difference.</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )
    expect(ref.current).toHaveAttribute('data-variant', 'contained')
    expect(ref.current).toHaveAttribute('data-size', 'sm')
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument()
    expect(screen.getByText(/goal difference/)).toBeVisible()
  })
})
