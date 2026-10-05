import { Form, FormSentence, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({
    defaultValues: {
      day: 'weekdays',
      time: '07:30',
      minutes: 10,
    },
  })
  return (
    <Form form={form} aria-label="Departure reminder">
      <Stack gap={5}>
        <FormSentence label="Departure reminder">
          Remind me on{' '}
          <form.SelectField
            name="day"
            label="Days"
            options={[
              { value: 'weekdays', label: 'weekdays' },
              { value: 'weekends', label: 'weekends' },
              { value: 'every', label: 'every day' },
            ]}
          />{' '}
          at <form.TimeField name="time" label="Time" />,{' '}
          <form.NumberField name="minutes" label="Minutes before" min={5} max={60} htmlSize={3} />{' '}
          minutes before my sailing.
        </FormSentence>
        <SubmitButton>Set reminder</SubmitButton>
      </Stack>
    </Form>
  )
}
