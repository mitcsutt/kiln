import { ChoiceCards } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <ChoiceCards
      aria-label="Pass"
      type="single"
      defaultValue="month"
      columns={{ base: 1, sm: 3 }}
      options={[
        { value: 'week', label: 'Week', description: 'Seven days from first use', meta: '£24' },
        { value: 'month', label: 'Month', description: 'A calendar month', meta: '£82' },
        {
          value: 'year',
          label: 'Year',
          description: 'Twelve months, night buses included',
          meta: '£790',
        },
      ]}
    />
  )
}
