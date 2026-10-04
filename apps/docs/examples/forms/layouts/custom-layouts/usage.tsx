'use client'

import {
  ErrorSummary,
  FieldScope,
  FieldViewListBoundary,
  Form,
  SubmitButton,
  useAppForm,
  useFieldScope,
  useScopeErrors,
} from '@mitcsutt/kiln-forms'
import { Badge, Box, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

function Count() {
  const scope = useFieldScope()
  const errors = useScopeErrors(scope)
  return errors > 0 ? <Badge tone="critical">{errors}</Badge> : null
}

/** A layout of your own: a framed group that counts the errors inside it. */
function Leg({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FieldScope>
      <Box padding={5} border radius="surface">
        <Stack gap={4}>
          <Inline justify="between">
            <Text weight="strong">{title}</Text>
            <Count />
          </Inline>
          <FieldViewListBoundary>{children}</FieldViewListBoundary>
        </Stack>
      </Box>
    </FieldScope>
  )
}

const required = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() ? undefined : message),
})

export default function Usage() {
  const form = useAppForm({ defaultValues: { outFrom: '', outTo: '', backFrom: '', backTo: '' } })
  return (
    <Form form={form} aria-label="Return journey">
      <Stack gap={5}>
        <ErrorSummary />
        <Leg title="Outward">
          <form.TextField
            name="outFrom"
            label="From"
            validators={required('Enter where you leave from')}
          />
          <form.TextField
            name="outTo"
            label="To"
            validators={required('Enter where you are going')}
          />
        </Leg>
        <Leg title="Return">
          <form.TextField
            name="backFrom"
            label="From"
            validators={required('Enter where you come back from')}
          />
          <form.TextField
            name="backTo"
            label="To"
            validators={required('Enter where you come back to')}
          />
        </Leg>
        <SubmitButton>Find sailings</SubmitButton>
      </Stack>
    </Form>
  )
}
