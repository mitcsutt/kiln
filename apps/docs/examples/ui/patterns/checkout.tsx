'use client'

import {
  Amount,
  Button,
  ChoiceCardsField,
  Container,
  DataList,
  Divider,
  Heading,
  Inline,
  List,
  Section,
  Split,
  Stack,
  Text,
  TextField,
} from '@mitcsutt/kiln-ui'

const BASKET = [
  { name: 'Annual pass', detail: 'Unlimited 45-minute rides', price: 96 },
  { name: 'Helmet, medium', detail: 'Collect at Harbour Square', price: 24.5 },
] as const

const subtotal = BASKET.reduce((sum, item) => sum + item.price, 0)

export default function Checkout() {
  return (
    <Section space={7}>
      <Container width="content">
        <Split ratio="7/5" gap={8}>
          <Stack gap={6}>
            <Heading level={2} size="2xl">
              Checkout
            </Heading>
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="ines@example.com"
            />
            <ChoiceCardsField
              label="Collection"
              type="single"
              defaultValue="station"
              columns={{ base: 1, sm: 2 }}
              options={[
                {
                  value: 'station',
                  label: 'Collect at a station',
                  description: 'Ready from tomorrow, 08:00',
                  meta: 'Free',
                },
                {
                  value: 'post',
                  label: 'Post it to me',
                  description: 'Two to three working days',
                  meta: '£3.20',
                },
              ]}
            />
            <TextField
              label="Discount code"
              optional
              description="From your employer's cycle scheme, if you have one."
            />
          </Stack>
          <Stack gap={5}>
            <Text weight="strong">Your order</Text>
            <List divided>
              {BASKET.map((item) => (
                <List.Item key={item.name}>
                  <List.Content>
                    <Text weight="medium">{item.name}</Text>
                    <List.Description>{item.detail}</List.Description>
                  </List.Content>
                  <List.Trailing>
                    <Amount value={item.price} currency="GBP" />
                  </List.Trailing>
                </List.Item>
              ))}
            </List>
            <Divider />
            <DataList orientation="horizontal">
              <DataList.Item label="Subtotal">
                <Amount value={subtotal} currency="GBP" />
              </DataList.Item>
              <DataList.Item label="Collection">Free</DataList.Item>
            </DataList>
            <Inline justify="between" align="baseline">
              <Text weight="strong">Total</Text>
              <Amount value={subtotal} currency="GBP" size="2xl" />
            </Inline>
            <Button fullWidth size="lg">
              Pay £120.50
            </Button>
            <Text size="sm" tone="muted">
              Your pass starts the day you collect it, not the day you pay.
            </Text>
          </Stack>
        </Split>
      </Container>
    </Section>
  )
}
