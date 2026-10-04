/**
 * Inactive FormSteps steps are hidden in a real browser, not only in jsdom.
 *
 * `StepPanel` puts `hidden` on a ui `Stack`. Stack's own class sets `display: flex`
 * (Stack.module.css `.stack`), and an author rule beats the UA `[hidden] { display: none }`, so
 * without an override inactive steps would render and their fields would be tab stops. jsdom has
 * no stylesheet by default, so the package's own tests can't see it: this test injects the real
 * Stack CSS (class renamed to the scoped name the test build gives it) and asks jsdom's cascade.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FormSteps } from '#layouts/FormSteps'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

const STACK_CSS = readFileSync(
  join(process.cwd(), '../ui/src/components/layout/Stack/Stack.module.css'),
  'utf8',
)

function injectStackCss(scopedClass: string): () => void {
  const style = document.createElement('style')
  style.textContent = STACK_CSS.replaceAll('.stack', `.${scopedClass}`)
  document.head.append(style)
  return () => {
    style.remove()
  }
}

describe('inactive FormSteps steps are not displayed', () => {
  it('the hidden step section computes display: none with ui CSS applied', () => {
    const { container } = renderForm(
      (f) => (
        <FormSteps label="Sign up">
          <FormSteps.Step value="account" title="Account">
            <f.TextField name="email" label="Email" />
          </FormSteps.Step>
          <FormSteps.Step value="profile" title="Profile">
            <f.TextField name="name" label="Display name" />
          </FormSteps.Step>
        </FormSteps>
      ),
      { defaultValues: { email: '', name: '' } },
    )
    const sections = [...container.querySelectorAll('section')]
    const inactive = sections.find((section) => section.hidden)
    expect(inactive).toBeDefined()
    const stackClass = [...(inactive?.classList ?? [])].find((name) => name.includes('stack'))
    expect(stackClass).toBeDefined()
    const remove = injectStackCss(stackClass ?? 'stack')
    try {
      expect(getComputedStyle(must(inactive)).display).toBe('none')
    } finally {
      remove()
    }
  })
})
