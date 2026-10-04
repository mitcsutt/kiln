/**
 * Wave E QA — QA-STEPS-1 root cause: ui layout primitives defeat the `hidden` attribute.
 *
 * Each primitive's root class sets `display` (`.stack { display: flex }` …). Author CSS beats the
 * UA `[hidden] { display: none }`, so `<Stack hidden>` stays on screen. `@mitcsutt/kiln-forms` FormSteps
 * relies on `<Stack hidden>` for inactive steps. jsdom loads no stylesheets in this package's
 * tests, so the real module CSS is injected here (class names are non-scoped in this config).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ComponentType, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ActionBar } from '#components/layout/ActionBar'
import { Box } from '#components/layout/Box'
import { Grid } from '#components/layout/Grid'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'

type Primitive = ComponentType<{ hidden?: boolean; children?: ReactNode }>
const cases: [string, Primitive][] = [
  ['Stack', Stack as Primitive],
  ['Inline', Inline as Primitive],
  ['Grid', Grid as Primitive],
  ['Box', Box as Primitive],
  ['ActionBar', ActionBar as Primitive],
]

let styles: HTMLStyleElement[] = []
afterEach(() => {
  for (const style of styles) style.remove()
  styles = []
})

function inject(name: string) {
  const style = document.createElement('style')
  style.textContent = readFileSync(
    join(process.cwd(), `src/components/layout/${name}/${name}.module.css`),
    'utf8',
  )
  document.head.append(style)
  styles.push(style)
}

describe('QA: layout primitives honour `hidden`', () => {
  for (const [name, Component] of cases) {
    it(`${name} hidden computes display: none (QA-STEPS-1 root cause)`, () => {
      inject(name)
      const { container } = render(<Component hidden>Content</Component>)
      const element = container.firstElementChild as HTMLElement
      expect(element.hidden).toBe(true)
      expect(getComputedStyle(element).display).toBe('none')
    })
  }
})
