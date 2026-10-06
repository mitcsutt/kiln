<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# AspectRatio

> A frame that keeps its proportions, for images, video, maps and charts.

Source: https://kiln.mitchellsutton.com/docs/ui/layout/aspect-ratio

`AspectRatio` holds a ratio as its width changes. Its child (an image, a video, an iframe, an SVG) fills it and is cropped with `object-fit: cover`. It has no edge or radius of its own: wrap it in `Media` or a `Card` for those.

The same chart framed at 16/9, 4/3 and 1/1.

```tsx
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
```

## API

`AspectRatioProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ratio` | `AspectRatioPreset \| number` | `16/9` | Width ÷ height, as a preset or a number (e.g. `1.91`). Default `16/9`. |

Also accepts every prop of `HTMLAttributes<HTMLDivElement>`.
