import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { must } from '#test/must'
import { Toaster } from './Toaster'
import { resetToasts, toast } from './toast'

afterEach(() => {
  act(() => {
    resetToasts()
  })
  vi.useRealTimers()
})

function region() {
  return screen.getByRole('region', { name: /Notifications/ })
}

describe('Toaster', () => {
  it('shows a toast raised from outside React in a labelled region', () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Invoice sent', description: 'Kittiwake Ltd, £1,240.00', tone: 'positive' })
    })
    const item = within(region()).getByRole('listitem')
    expect(item).toHaveAttribute('data-tone', 'positive')
    expect(within(item).getByText('Invoice sent')).toBeInTheDocument()
    expect(within(item).getByText('Kittiwake Ltd, £1,240.00')).toBeInTheDocument()
    expect(region()).toHaveAccessibleName('Notifications (F8)')
  })

  it('takes plain text as the title', () => {
    render(<Toaster />)
    act(() => {
      toast('Link copied')
    })
    expect(within(region()).getByText('Link copied')).toBeInTheDocument()
  })

  it('updates rather than stacks a toast with the same id', () => {
    render(<Toaster />)
    act(() => {
      toast({ id: 'sync', title: 'Sync failed', tone: 'critical' })
      toast({ id: 'sync', title: 'Sync failed again', tone: 'critical' })
    })
    const items = within(region()).getAllByRole('listitem')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent('Sync failed again')
    expect(items[0]).toHaveAttribute('data-updated')
  })

  it('closes from the close button with its label, and with toast.dismiss', async () => {
    const onDismiss = vi.fn()
    render(<Toaster closeLabel="Close message" />)
    let id = ''
    act(() => {
      id = toast({ title: 'Draft saved', onDismiss })
      toast({ title: 'Export ready' })
    })
    const [close] = within(region()).getAllByRole('button', { name: 'Close message' })
    await userEvent.click(must(close))
    expect(onDismiss).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(within(region()).queryByText('Draft saved')).not.toBeInTheDocument()
    })
    expect(id).toMatch(/^toast-/)
    act(() => {
      toast.dismiss()
    })
    await waitFor(() => {
      expect(within(region()).queryByText('Export ready')).not.toBeInTheDocument()
    })
  })

  it('runs the action and closes', async () => {
    const onClick = vi.fn()
    render(<Toaster />)
    act(() => {
      toast({ title: 'Invoice archived', action: { label: 'Undo', onClick } })
    })
    await userEvent.click(within(region()).getByRole('button', { name: 'Undo' }))
    expect(onClick).toHaveBeenCalled()
    await waitFor(() => {
      expect(within(region()).queryByText('Invoice archived')).not.toBeInTheDocument()
    })
  })

  it('shows only the newest `max` toasts; older ones wait their turn', async () => {
    render(<Toaster max={2} />)
    let third = ''
    act(() => {
      toast('First')
      toast('Second')
      third = toast('Third')
    })
    expect(within(region()).queryByText('First')).not.toBeInTheDocument()
    expect(within(region()).getByText('Second')).toBeInTheDocument()
    expect(within(region()).getByText('Third')).toBeInTheDocument()
    act(() => {
      toast.dismiss(third)
    })
    await waitFor(() => {
      expect(within(region()).getByText('First')).toBeInTheDocument()
    })
  })

  it('times out after its duration, and critical toasts stay', () => {
    vi.useFakeTimers()
    render(<Toaster />)
    act(() => {
      toast({ title: 'Copied', duration: 1000 })
      toast({ title: 'Payment failed', tone: 'critical' })
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(within(region()).queryByText('Copied')).not.toBeInTheDocument()
    expect(within(region()).getByText('Payment failed')).toBeInTheDocument()
  })

  it('turns a promise toast into its result', async () => {
    render(<Toaster />)
    let resolve: (value: number) => void = () => undefined
    const work = new Promise<number>((done) => {
      resolve = done
    })
    act(() => {
      void toast.promise(work, {
        loading: 'Saving 3 rows',
        success: (rows) => `Saved ${String(rows)} rows`,
        error: 'Could not save',
      })
    })
    const loading = within(region()).getByRole('listitem')
    expect(loading).toHaveAttribute('data-loading')
    expect(within(loading).queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
    await act(async () => {
      resolve(3)
      await work
    })
    const done = within(region()).getByRole('listitem')
    expect(done).toHaveTextContent('Saved 3 rows')
    expect(done).toHaveAttribute('data-tone', 'positive')
    expect(done).not.toHaveAttribute('data-loading')
  })

  it('replaces the loading message rather than merging into it', async () => {
    render(<Toaster />)
    const cancel = vi.fn()
    let resolve: () => void = () => undefined
    const work = new Promise<void>((done) => {
      resolve = done
    })
    act(() => {
      void toast.promise(work, {
        loading: {
          title: 'Uploading',
          description: '3 receipts',
          action: { label: 'Cancel', onClick: cancel },
        },
        success: 'Uploaded',
        error: 'Upload failed',
      })
    })
    const loading = within(region()).getByRole('listitem')
    expect(loading).toHaveTextContent('3 receipts')
    expect(within(loading).getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    await act(async () => {
      resolve()
      await work
    })
    const done = within(region()).getByRole('listitem')
    expect(done).toHaveTextContent('Uploaded')
    expect(done).not.toHaveTextContent('3 receipts')
    expect(within(done).queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
  })

  it('drops the loading title when a stage brings none of its own', async () => {
    render(<Toaster />)
    const work = Promise.reject(new Error('Server busy'))
    await act(async () => {
      await toast
        .promise(work, {
          loading: 'Uploading receipts',
          success: 'Uploaded',
          error: { description: 'The server is busy. Try again in a minute.' },
        })
        .catch(() => undefined)
    })
    const item = within(region()).getByRole('listitem')
    expect(item).toHaveTextContent('The server is busy. Try again in a minute.')
    expect(item).not.toHaveTextContent('Uploading receipts')
  })

  it('reports a rejected promise in the critical tone', async () => {
    render(<Toaster />)
    const work = Promise.reject(new Error('Server busy'))
    await act(async () => {
      await toast
        .promise(work, {
          loading: 'Saving',
          success: 'Saved',
          error: (error) => (error instanceof Error ? error.message : 'Failed'),
        })
        .catch(() => undefined)
    })
    const item = within(region()).getByRole('listitem')
    expect(item).toHaveTextContent('Server busy')
    expect(item).toHaveAttribute('data-tone', 'critical')
  })

  it('takes the theme of the place it is mounted', () => {
    render(
      <div data-theme="riso" data-mode="dark">
        <Toaster />
      </div>,
    )
    act(() => {
      toast('Saved')
    })
    const list = within(region()).getByRole('list')
    expect(list).toHaveAttribute('data-theme', 'riso')
    expect(list).toHaveAttribute('data-mode', 'dark')
  })
})

describe('Toaster, mounted twice', () => {
  it('shows each toast once, in the first Toaster', () => {
    render(
      <>
        <Toaster label="First ({hotkey})" />
        <Toaster label="Second ({hotkey})" />
      </>,
    )
    act(() => {
      toast('Saved')
    })
    expect(screen.getAllByText('Saved')).toHaveLength(1)
    expect(screen.getByRole('region', { name: 'First (F8)' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Second (F8)' })).not.toBeInTheDocument()
  })
})
