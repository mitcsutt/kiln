import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { Card } from '#components/display/Card'
import { DataList } from '#components/display/DataList'
import { List } from '#components/display/List'
import { CheckboxField } from '#components/inputs/CheckboxField'
import { ChoiceCardsField } from '#components/inputs/ChoiceCardsField'
import { Fieldset } from '#components/inputs/Fieldset'
import { TextField } from '#components/inputs/TextField'
import { AppShell } from '#components/layout/AppShell'
import { Container } from '#components/layout/Container'
import { Grid } from '#components/layout/Grid'
import { Section } from '#components/layout/Section'
import { Split } from '#components/layout/Split'
import { Stack } from '#components/layout/Stack'
import { Stepper } from '#components/navigation/Stepper'
import { Amount } from '#components/typography/Amount'
import { Heading } from '#components/typography/Heading'
import { Text } from '#components/typography/Text'

/*
 * UI/Patterns/Checkout: paying for an order from an invented stationery shop, built only
 * from library components (no CSS module, no className, no inline style). The totals add up.
 */

const meta = {
  title: 'UI/Patterns/Checkout',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = [
  { name: 'Dot grid notebook, A5', detail: 'Moss green', quantity: 2, price: 14 },
  { name: 'Brass pencil sharpener', detail: 'Single hole', quantity: 1, price: 9.5 },
  { name: 'Fountain pen ink, 50 ml', detail: 'Harbour blue', quantity: 1, price: 12.25 },
]

const SUBTOTAL = ITEMS.reduce((sum, item) => sum + item.quantity * item.price, 0)

const DELIVERY = [
  {
    value: 'standard',
    label: 'Standard',
    description: '3 to 5 working days',
    meta: <Amount value={3.95} currency="GBP" />,
  },
  {
    value: 'next-day',
    label: 'Next day',
    description: 'Order by 2pm',
    meta: <Amount value={6.5} currency="GBP" />,
  },
]

const DELIVERY_COST = 3.95

export const Checkout: Story = {
  render: () => (
    <AppShell>
      <AppShell.Header>
        <Container>
          <Text weight="strong">Inkwell &amp; Grid</Text>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Section space={{ base: 6, md: 8 }}>
          <Container>
            <Stack gap={7}>
              <Stack gap={4}>
                <Heading level={1} size="xl">
                  Checkout
                </Heading>
                <Stepper
                  aria-label="Checkout progress"
                  value="details"
                  steps={[
                    { value: 'basket', label: 'Basket' },
                    { value: 'details', label: 'Details' },
                    { value: 'pay', label: 'Pay' },
                  ]}
                />
              </Stack>
              <Split ratio="7/5" collapseBelow="lg" gap={{ base: 7, lg: 8 }} align="start">
                <Stack as="form" gap={8} aria-label="Delivery and payment">
                  <Fieldset variant="section" legend="Contact">
                    <TextField label="Email" type="email" autoComplete="email" required />
                    <CheckboxField label="Send me the monthly new-stock letter" />
                  </Fieldset>
                  <Fieldset variant="section" legend="Delivery address">
                    <TextField label="Full name" autoComplete="name" required />
                    <TextField label="Address line 1" autoComplete="address-line1" required />
                    <Grid columns={{ base: 1, sm: 2 }} gap={5}>
                      <TextField label="Town or city" autoComplete="address-level2" required />
                      <TextField label="Postcode" autoComplete="postal-code" required />
                    </Grid>
                  </Fieldset>
                  <ChoiceCardsField
                    type="single"
                    label="Delivery"
                    options={DELIVERY}
                    defaultValue="standard"
                  />
                  <Button type="submit" size="lg">
                    Continue to payment
                  </Button>
                </Stack>
                <Card variant="outline">
                  <Card.Body>
                    <Stack gap={5}>
                      <Heading level={2} size="md">
                        Your order
                      </Heading>
                      <List aria-label="Items in your order" density="compact">
                        {ITEMS.map((item) => (
                          <List.Item key={item.name}>
                            <List.Content>
                              {item.name}
                              <List.Description>
                                {item.detail}, quantity {item.quantity}
                              </List.Description>
                            </List.Content>
                            <List.Trailing>
                              <Amount value={item.quantity * item.price} currency="GBP" />
                            </List.Trailing>
                          </List.Item>
                        ))}
                      </List>
                      <DataList divided>
                        <DataList.Item label="Subtotal">
                          <Amount value={SUBTOTAL} currency="GBP" />
                        </DataList.Item>
                        <DataList.Item label="Delivery">
                          <Amount value={DELIVERY_COST} currency="GBP" />
                        </DataList.Item>
                        <DataList.Item label="Total">
                          <Amount value={SUBTOTAL + DELIVERY_COST} currency="GBP" />
                        </DataList.Item>
                      </DataList>
                    </Stack>
                  </Card.Body>
                </Card>
              </Split>
            </Stack>
          </Container>
        </Section>
      </AppShell.Main>
    </AppShell>
  ),
}
