import { useEffect } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Form } from '#components/form/Form'
import { SubmitButton } from '#components/form/SubmitButton'
import { useFormStatus } from '#hooks/useFormStatus'
import { mergeDirty, useServerValues } from '#hooks/useServerValues'
import { kit } from '#kit/defaultKit'

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

describe('useServerValues error restore', () => {
  interface Invite {
    email: string
    city: string
  }
  const required = ({ value }: { value: string }) => (value === '' ? 'Enter an email' : undefined)

  function Invite({
    data,
    errorVisibility,
  }: {
    data?: Invite
    errorVisibility?: 'blur' | 'submit'
  }) {
    const form = kit.useAppForm<Invite>({
      defaultValues: { email: '', city: 'Leeds' },
      errorVisibility,
    })
    useServerValues(form, data)
    return (
      <Form form={form} aria-label="Invite">
        <form.TextField name="email" label="Email" validators={{ onDynamic: required }} />
        <form.TextField name="city" label="City" />
        <SubmitButton>Send</SubmitButton>
      </Form>
    )
  }

  async function submitEmpty() {
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Send' }))
    await act(() => Promise.resolve())
    expect(screen.getByText('Enter an email')).toBeInTheDocument()
  }

  it('drops an error when the refresh replaces the value it was about', async () => {
    const { rerender } = render(<Invite />)
    await submitEmpty()
    rerender(<Invite data={{ email: 'ines@example.com', city: 'Leeds' }} />)
    expect(screen.getByLabelText('Email')).toHaveValue('ines@example.com')
    expect(screen.queryByText('Enter an email')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid', 'true')
  })

  it.each(['blur', 'submit'] as const)(
    'keeps a visible error visible under errorVisibility %s when its value survives',
    async (errorVisibility) => {
      const { rerender } = render(<Invite errorVisibility={errorVisibility} />)
      await submitEmpty()
      rerender(<Invite errorVisibility={errorVisibility} data={{ email: '', city: 'York' }} />)
      expect(screen.getByLabelText('City')).toHaveValue('York')
      expect(screen.getByText('Enter an email')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    },
  )

  it('restores errors after a submit without announcing them again', async () => {
    const { rerender } = render(<Invite />)
    await submitEmpty()
    rerender(<Invite data={{ email: '', city: 'York' }} />)
    expect(screen.getByText('Enter an email')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('still announces a new error after a refresh in a never-submitted form', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Invite errorVisibility="blur" />)
    const email = screen.getByLabelText('Email')
    await user.type(email, 'a')
    await user.clear(email)
    await user.tab()
    expect(await screen.findByText('Enter an email')).toBeInTheDocument()
    rerender(<Invite errorVisibility="blur" data={{ email: '', city: 'York' }} />)
    expect(screen.getByText('Enter an email')).toBeInTheDocument()
    await user.type(email, 'a')
    await waitFor(() => expect(screen.queryByText('Enter an email')).not.toBeInTheDocument())
    await user.clear(email)
    expect(await screen.findByRole('alert')).toHaveTextContent('Enter an email')
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
