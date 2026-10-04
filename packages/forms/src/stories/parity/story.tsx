import type { ParityFixture } from '#stories/fixtures'
import { Parity } from './Parity'

/**
 * Story parameters for a parity pair. The two `<form>` landmarks are named apart
 * (`… (component mode)` / `… (schema mode)`), but the landmarks inside them (a titled
 * `FormSection`, an open accordion panel) are the same on both sides: that sameness is
 * what the pair shows. So axe's `landmark-unique` (a best-practice rule, not a WCAG one)
 * is off for these stories only; every other rule stays on.
 */
export const parityParameters = {
  controls: { disable: true },
  a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
} as const

/** A ready-made story object for one fixture. */
export function parityStory(
  fixture: ParityFixture,
  schema: unknown,
  components: readonly string[],
  name = 'Component and schema',
) {
  return {
    name,
    render: () => <Parity fixture={fixture} schema={schema} components={components} />,
    parameters: parityParameters,
  }
}
