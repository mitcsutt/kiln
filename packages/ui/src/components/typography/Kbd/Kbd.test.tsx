import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Kbd } from './Kbd'
import { Code } from '#components/typography/Code'
import { Prose } from '#components/typography/Prose'

describe('Kbd, Code and Prose', () => {
  it('render their semantic elements and forward refs', () => {
    const kbd = createRef<HTMLElement>()
    const code = createRef<HTMLElement>()
    const prose = createRef<HTMLElement>()
    render(
      <Prose ref={prose} as="article" size="lg">
        <p>
          Press <Kbd ref={kbd}>K</Kbd> or run <Code ref={code}>pnpm dev</Code>.
        </p>
      </Prose>,
    )
    expect(screen.getByText('K').tagName).toBe('KBD')
    expect(screen.getByText('pnpm dev').tagName).toBe('CODE')
    expect(kbd.current?.tagName).toBe('KBD')
    expect(code.current).toHaveAttribute('data-tone', 'neutral')
    expect(prose.current?.tagName).toBe('ARTICLE')
    expect(prose.current).toHaveAttribute('data-size', 'lg')
  })
})
