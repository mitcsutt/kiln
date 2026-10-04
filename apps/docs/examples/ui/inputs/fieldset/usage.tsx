'use client'

import { Fieldset, Grid, TextField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Fieldset legend="Delivery address" description="We post passes second class.">
      <Grid columns={{ base: 1, sm: 2 }} gap={4}>
        <Grid.Item span={{ base: 1, sm: 2 }}>
          <TextField label="Street" autoComplete="address-line1" />
        </Grid.Item>
        <TextField label="Town" autoComplete="address-level2" />
        <TextField label="Postcode" autoComplete="postal-code" />
      </Grid>
    </Fieldset>
  )
}
