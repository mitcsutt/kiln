import { Grid, Skeleton, Spinner, Stack } from '@mitcsutt/kiln-ui'

/** What a route shows while its loader fetches: the page's shape, before its data. */
export function PageSkeleton() {
  return (
    <Stack gap={6} role="status" aria-busy="true" aria-label="Loading the page">
      <Stack gap={3}>
        <Skeleton width="1/4" height="text" />
        <Skeleton width="1/2" height="heading" />
        <Skeleton.Text lines={2} />
      </Stack>
      <Grid columns={{ base: 1, md: 3 }} gap={5}>
        <Skeleton height="block" />
        <Skeleton height="block" />
        <Skeleton height="block" />
      </Grid>
      <Spinner label="Loading" />
    </Stack>
  )
}
