import { Grid, Stat } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Grid columns={{ base: 1, sm: 3 }} gap={6}>
      <Stat
        label="Passengers"
        value="18,432"
        delta={{ value: '6%', direction: 'up', tone: 'positive' }}
      />
      <Stat
        label="On time"
        value="94.1%"
        delta={{ value: '1.2 pts', direction: 'down', tone: 'critical' }}
        hint="Target 95%"
      />
      <Stat label="Sailings" value="1,206" delta={{ value: '0', direction: 'flat' }} />
    </Grid>
  )
}

export function Hero() {
  return (
    <Stat
      size="hero"
      label="Fares collected this month"
      value="£214,880"
      delta={{ value: '£12,400', direction: 'up', tone: 'positive' }}
      rule
    />
  )
}
