import { useEffect } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Form } from '#components/Form'
import { SubmitButton } from '#components/SubmitButton'
import { useFormStatus } from '#core/hooks/useFormStatus'
import { mergeDirty, useServerValues } from '#core/hooks/useServerValues'
import { kit } from '#kit'

interface Contact {
  name: string
  email: string
  tags: string[]
}

let api: ReturnType<typeof kit.useAppForm<Contact>> | null = null

function Dirty() {
  const { isDirty } = useFormStatus()
  return <output aria-label="Dirty">{String(isDirty)}</output>
}

function Edit({ data, onSubmit }: { data: Contact | undefined; onSubmit?: () => void }) {
  const form = kit.useAppForm<Contact>({
    defaultValues: { name: '', email: '', tags: [] },
    onSubmit,
  })
  useEffect(() => {
    api = form
  })
  useServerValues(form, data)
  return (
    <Form form={form} aria-label="Contact">
      <form.TextField name="name" label="Name" />
      <form.TextField name="email" label="Email" />
      <Dirty />
      <SubmitButton>Save</SubmitButton>
    </Form>
  )
}

const v1: Contact = { name: 'Ada', email: 'ada@old.example', tags: [] }

describe('useServerValues', () => {
  it('refresh while editing: untouched fields take server values, edits survive', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Edit data={v1} />)
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
    expect(screen.getByRole('status', { name: 'Dirty' })).toHaveTextContent('false')
    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Ada L')
    rerender(<Edit data={{ ...v1, email: 'ada@new.example' }} />)
    expect(screen.getByLabelText('Email')).toHaveValue('ada@new.example')
    expect(screen.getByLabelText('Name')).toHaveValue('Ada L')
    expect(screen.getByRole('status', { name: 'Dirty' })).toHaveTextContent('true')
  })

  it('array add → remove round trip is clean', async () => {
    render(<Edit data={v1} />)
    act(() => {
      api?.pushFieldValue('tags', 'vip')
    })
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'Dirty' })).toHaveTextContent('true'),
    )
    act(() => {
      void api?.removeFieldValue('tags', 0)
    })
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'Dirty' })).toHaveTextContent('false'),
    )
  })

  it('save → clean, and a refetch of the saved data stays clean', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { rerender } = render(<Edit data={v1} onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Email'), 'm')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'Dirty' })).toHaveTextContent('false'),
    )
    rerender(<Edit data={{ ...v1, email: 'ada@old.examplem' }} onSubmit={onSubmit} />)
    expect(screen.getByRole('status', { name: 'Dirty' })).toHaveTextContent('false')
    expect(screen.getByLabelText('Email')).toHaveValue('ada@old.examplem')
  })

  it('keeps visible errors across a refresh', async () => {
    const { rerender } = render(<Edit data={v1} />)
    act(() => {
      api?.setFieldMeta('name', (prev) => ({
        ...prev,
        isBlurred: true,
        errorMap: { onServer: 'Name is reserved' },
      }))
    })
    expect(await screen.findByText('Name is reserved')).toBeInTheDocument()
    rerender(<Edit data={{ ...v1, email: 'x@y.z' }} />)
    expect(screen.getByText('Name is reserved')).toBeInTheDocument()
  })
})

describe('mergeDirty', () => {
  it('keeps leaves the user changed and takes the rest from the server', () => {
    expect(mergeDirty({ a: 1, b: { c: 1 } }, { a: 2, b: { c: 1 } }, { a: 3, b: { c: 5 } })).toEqual(
      { a: 2, b: { c: 5 } },
    )
    expect(mergeDirty({ list: [1] }, { list: [1, 2] }, { list: [9] })).toEqual({ list: [1, 2] })
  })
})
