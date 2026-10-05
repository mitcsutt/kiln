import { Form, FormPanel, FormPanels, useAppForm } from '@mitcsutt/kiln-forms'
import { Button } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({
    defaultValues: {
      home: { label: 'Home', stop: 'Harbour Square' },
      work: { label: 'Work', stop: 'Northpoint Library' },
    },
  })
  return (
    <Form form={form} aria-label="Saved places">
      <FormPanels columns={{ base: 1, md: 2 }}>
        <FormPanel title="Home" description="Your usual starting point">
          <form.TextField name="home.stop" label="Nearest stop" />
        </FormPanel>
        <FormPanel
          title="Work"
          actions={
            <Button size="sm" variant="ghost" tone="critical">
              Remove
            </Button>
          }
        >
          <form.TextField name="work.stop" label="Nearest stop" />
        </FormPanel>
      </FormPanels>
    </Form>
  )
}
