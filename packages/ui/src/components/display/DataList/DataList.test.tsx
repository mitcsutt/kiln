import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { DataList } from './DataList'

describe('DataList', () => {
  it('renders a definition list of term/definition pairs', () => {
    const ref = createRef<HTMLDListElement>()
    const { container } = render(
      <DataList ref={ref} divided>
        <DataList.Item label="Venue">Harbour Park</DataList.Item>
        <DataList.Item label="Kick-off">11 June, 13:00</DataList.Item>
      </DataList>,
    )
    const dl = container.querySelector('dl')
    expect(ref.current).toBe(dl)
    expect(dl).toHaveAttribute('data-orientation', 'horizontal')
    expect(dl).toHaveAttribute('data-divided')
    const terms = screen.getAllByRole('term')
    const defs = screen.getAllByRole('definition')
    expect(terms.map((t) => t.textContent)).toEqual(['Venue', 'Kick-off'])
    expect(defs[0]).toHaveTextContent('Harbour Park')
  })

  it('supports vertical orientation', () => {
    const { container } = render(
      <DataList orientation="vertical">
        <DataList.Item label="Role">Design and build</DataList.Item>
      </DataList>,
    )
    expect(container.querySelector('dl')).toHaveAttribute('data-orientation', 'vertical')
  })
})
