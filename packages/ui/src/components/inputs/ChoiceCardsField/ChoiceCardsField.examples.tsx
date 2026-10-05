import { ChoiceCardsField } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <ChoiceCardsField
      label="Add-ons"
      description="Choose any"
      type="multiple"
      columns={{ base: 1, sm: 2 }}
      options={[
        {
          value: 'bike',
          label: 'Bike space',
          description: 'Reserved on every crossing',
          meta: '£2',
        },
        {
          value: 'lounge',
          label: 'Lounge',
          description: 'Quiet seats and a hot drink',
          meta: '£6',
        },
      ]}
    />
  )
}
