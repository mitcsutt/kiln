import {
  Amount,
  AmountField,
  AmountInput,
  Card,
  Field,
  NumberField,
  NumberInput,
  SliderField,
  Stack,
  Stat,
  SwitchField,
} from '@mitcsutt/kiln-ui'
import { useState } from 'react'

/**
 * A scratch calculator beside the invoice, built from kiln-ui's controls alone: nothing here is
 * submitted, so it needs no form library.
 */
export function FeeCalculator() {
  const [shelves, setShelves] = useState<number | null>(2)
  const [rate, setRate] = useState<number | null>(12)
  const [load, setLoad] = useState(75)
  const [glaze, setGlaze] = useState(true)
  const [deposit, setDeposit] = useState<number | null>(10)
  const [pieces, setPieces] = useState<number | null>(14)
  const total = (shelves ?? 0) * (rate ?? 0) * (load / 100) * (glaze ? 1.5 : 1) - (deposit ?? 0)
  return (
    <Card variant="outline">
      <Card.Header>
        <Card.Title>Firing fee calculator</Card.Title>
        <Card.Meta>Not saved</Card.Meta>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <NumberField
            label="Shelves"
            value={shelves}
            onValueChange={setShelves}
            min={1}
            max={8}
            stepper
          />
          <AmountField
            label="Rate per shelf"
            currency="GBP"
            locale="en-GB"
            value={rate}
            onValueChange={setRate}
          />
          <SliderField
            label="How full"
            value={load}
            onValueChange={setLoad}
            min={25}
            max={100}
            step={5}
            showValue
          />
          <SwitchField
            label="Glaze firing"
            description="Glaze firings cost half as much again."
            checked={glaze}
            onCheckedChange={setGlaze}
          />
          <Field label="Pieces in the load">
            <NumberInput value={pieces} onValueChange={setPieces} min={1} />
          </Field>
          <Field label="Deposit already paid">
            <AmountInput currency="GBP" locale="en-GB" value={deposit} onValueChange={setDeposit} />
          </Field>
          <Stat
            label="To invoice"
            value={<Amount value={Math.max(total, 0)} currency="GBP" locale="en-GB" />}
            hint={
              pieces ? (
                <Amount
                  value={Math.max(total, 0) / pieces}
                  currency="GBP"
                  locale="en-GB"
                  suffix=" a piece"
                />
              ) : undefined
            }
          />
        </Stack>
      </Card.Body>
    </Card>
  )
}
