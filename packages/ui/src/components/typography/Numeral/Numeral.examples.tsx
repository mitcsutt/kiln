import { formatNumeral, Inline, Numeral, signOf, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={4}>
      <Inline gap={2} align="baseline">
        <Numeral value={18432} size="2xl" />
        <Text tone="muted">passengers this week</Text>
      </Inline>
      <Inline gap={5}>
        <Numeral
          value={0.184}
          format={{ style: 'percent', maximumFractionDigits: 1 }}
          signDisplay="exceptZero"
          tone="auto"
        />
        <Numeral
          value={-0.042}
          format={{ style: 'percent', maximumFractionDigits: 1 }}
          signDisplay="exceptZero"
          tone="auto"
        />
        <Numeral value={7.4} suffix=" km" />
        <Numeral value={1250000} format={{ notation: 'compact' }} />
      </Inline>
    </Stack>
  )
}

const change = -0.042

export function Format() {
  return (
    <Stack gap={2}>
      <Text>Plain string: {formatNumeral(18432)}</Text>
      <Text>
        Sign of {change}: {signOf(change)}
      </Text>
    </Stack>
  )
}
