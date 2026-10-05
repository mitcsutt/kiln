import { AspectRatio, Grid } from '@mitcsutt/kiln-ui'

function Chart({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 160 90" role="img" aria-label={label}>
      <rect width="160" height="90" fill="var(--color-surface-sunken)" />
      <path
        d="M0 70 L40 52 L80 60 L120 28 L160 36"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="3"
      />
    </svg>
  )
}

export function Usage() {
  return (
    <Grid columns={{ base: 1, sm: 3 }} gap={4}>
      {(['16/9', '4/3', '1/1'] as const).map((ratio) => (
        <AspectRatio key={ratio} ratio={ratio}>
          <Chart label={`Passengers per hour, framed ${ratio}`} />
        </AspectRatio>
      ))}
    </Grid>
  )
}
