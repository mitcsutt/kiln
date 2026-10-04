import type { ParityFixture } from '#stories/fixtures'
import { Parity } from './Parity'

/**
 * Story parameters for a parity pair. The two `<form>` landmarks are named apart
 * (`… (component mode)` / `… (schema mode)`), so every axe rule stays on.
 */
export const parityParameters = {
  controls: { disable: true },
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
