import { defineFormSchema, Form, SchemaNode, useAppForm } from '@mitcsutt/kiln-forms'
import { Grid, Stack, toast } from '@mitcsutt/kiln-ui'

import { saveProposal, type SessionProposal } from '#features/community/data/openStudio'

const schema = defineFormSchema<SessionProposal>()({
  version: 1,
  root: {
    layout: 'stack',
    children: [
      { id: 'title', kind: 'text', name: 'title', label: 'Session', rules: [{ rule: 'required' }] },
      {
        id: 'kind',
        kind: 'segmented',
        name: 'kind',
        label: 'Kind',
        options: [
          { value: 'demo', label: 'Demo' },
          { value: 'hands-on', label: 'Hands on' },
          { value: 'sale', label: 'Sale' },
        ],
        rules: [{ rule: 'required', message: 'Choose a kind of session' }],
      },
      {
        id: 'minutes',
        kind: 'number',
        name: 'minutes',
        label: 'Minutes',
        rules: [{ rule: 'min', value: 15 }],
      },
      { id: 'messy', kind: 'switch', name: 'messy', label: 'Visitors get clay on them' },
      {
        id: 'notes',
        kind: 'textarea',
        name: 'notes',
        label: 'What you need',
        when: { field: 'messy', op: 'truthy' },
      },
      { id: 'submit', content: 'submit', label: 'Propose it' },
    ],
  },
})

/** Schema mode, placed node by node: the schema owns the rules, the page owns the layout. */
export function ProposalForm() {
  const form = useAppForm<SessionProposal>({
    defaultValues: { title: '', kind: null, minutes: 45, messy: false, notes: '' },
    afterSubmit: 'reset',
    onSubmit: async ({ value }) => {
      await saveProposal(value)
      toast({ title: 'Proposal added to Ideas', description: value.title, tone: 'positive' })
    },
  })
  return (
    <Form form={form} aria-label="Propose a session">
      <Stack gap={4}>
        <Grid columns={{ base: 1, md: 2 }} gap={4}>
          <SchemaNode form={form} schema={schema} id="title" />
          <SchemaNode form={form} schema={schema} id="kind" />
          <SchemaNode form={form} schema={schema} id="minutes" />
          <SchemaNode form={form} schema={schema} id="messy" />
        </Grid>
        <SchemaNode form={form} schema={schema} id="notes" />
        <SchemaNode form={form} schema={schema} id="submit" />
      </Stack>
    </Form>
  )
}
