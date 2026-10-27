import { useFieldValue, useTypedAppFormContext } from '@mitcsutt/kiln-forms'
import { Inline, Swatch, Text } from '@mitcsutt/kiln-ui'

import { settingsOptions } from '#features/studio/pages/Settings/utils/settingsKit'

/** Reads the form from context, typed by the shared options, and re-renders only on these values. */
export function BrandPreview() {
  const form = useTypedAppFormContext(settingsOptions)
  const colour = useFieldValue(form, 'brandColour')
  const name = useFieldValue(form, 'studioName')
  return (
    <Inline gap={2} align="center">
      <Swatch color={colour} size="lg" />
      <Text size="sm" tone="muted">
        {name || 'Your studio'} on receipts and the gallery
      </Text>
    </Inline>
  )
}
