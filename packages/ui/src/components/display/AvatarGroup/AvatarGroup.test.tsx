import { render, screen } from '@testing-library/react'
import { Avatar } from '#components/display/Avatar'
import { AvatarGroup } from './AvatarGroup'

const members = ['Noor', 'Kofi', 'Ada', 'Ingrid', 'Mei', 'Theo']

describe('AvatarGroup', () => {
  it('shows at most `max` avatars and an accessible overflow count', () => {
    render(
      <AvatarGroup max={3} aria-label="Reacted">
        {members.map((n) => (
          <Avatar key={n} name={n} />
        ))}
      </AvatarGroup>,
    )
    expect(screen.getByRole('group', { name: 'Reacted' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Noor' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Ingrid' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: '3 more' })).toHaveTextContent('+3')
  })

  it('passes its size to avatars that do not set one', () => {
    const { container } = render(
      <AvatarGroup size="xs">
        <Avatar name="Noor" />
        <Avatar name="Kofi" size="lg" />
      </AvatarGroup>,
    )
    const [first, second] = Array.from(container.querySelectorAll('[data-color]'))
    expect(first).toHaveAttribute('data-size', 'xs')
    expect(second).toHaveAttribute('data-size', 'lg')
  })

  it('renders no overflow when everyone fits', () => {
    render(
      <AvatarGroup max={5}>
        <Avatar name="Noor" />
        <Avatar name="Kofi" />
      </AvatarGroup>,
    )
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })
})
