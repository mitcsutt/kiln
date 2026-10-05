import { Grid, Media } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Grid columns={{ base: 1, sm: 2 }} gap={5}>
      <Media
        src="/images/harbour.svg"
        alt="The ferry at Harbour Square pier at dusk"
        ratio="16/9"
        caption="Harbour Square at dusk"
      />
      <Media
        src="/missing/route-map.png"
        alt="Route map of the coastal line"
        ratio="16/9"
        caption="When an image fails, the frame keeps its shape"
      />
    </Grid>
  )
}
