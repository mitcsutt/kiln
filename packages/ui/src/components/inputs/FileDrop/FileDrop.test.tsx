import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, StrictMode, useState } from 'react'
import { Field } from '#components/inputs/Field'
import { FileDrop, type FileValue, type StoredFile } from './FileDrop'
import { formatFileSize, matchesAccept } from './fileUtils'
import { must } from '#test/must'

function file(name: string, type: string, bytes = 1200): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

const receipt = () => file('hardware-receipt.jpg', 'image/jpeg', 240_000)
const invoice = () => file('power-bill-march.pdf', 'application/pdf', 1_800_000)
const notes = () => file('notes.txt', 'text/plain', 300)

const stored: StoredFile = {
  id: 'r-114',
  name: 'grocer-receipt.png',
  size: 98_000,
  type: 'image/png',
  url: 'https://example.test/r-114.png',
}

const input = () => screen.getByLabelText<HTMLInputElement>('Receipts')
const zone = () => must(input().parentElement)
const names = () =>
  screen.queryAllByRole('listitem').map((item) => item.querySelector('.name')?.textContent)

function setup() {
  // applyAccept off: the component must enforce `accept` itself (drops bypass the picker).
  return userEvent.setup({ applyAccept: false })
}

describe('fileUtils', () => {
  it('matches accept tokens: extensions, exact types and wildcards', () => {
    expect(matchesAccept({ name: 'a.PDF', type: 'application/pdf' }, '.pdf')).toBe(true)
    expect(matchesAccept({ name: 'a.jpg', type: 'image/jpeg' }, 'image/*')).toBe(true)
    expect(matchesAccept({ name: 'a.jpg', type: 'image/jpeg' }, 'application/pdf, .png')).toBe(
      false,
    )
    expect(matchesAccept({ name: 'a.txt', type: 'text/plain' }, undefined)).toBe(true)
  })

  it('formats sizes with Intl, decimal units', () => {
    expect(formatFileSize(300)).toBe('300 bytes')
    expect(formatFileSize(240_000)).toBe('240 kB')
    expect(formatFileSize(1_800_000)).toBe('1.8 MB')
  })
})

describe('FileDrop', () => {
  it('the native file input is the labelled, focusable control and gets the ref', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <Field label="Receipts" description="JPG, PNG or PDF">
        <FileDrop ref={ref} accept="image/*,.pdf" multiple />
      </Field>,
    )
    expect(ref.current).toBe(input())
    expect(input()).toHaveAttribute('type', 'file')
    expect(input()).toHaveAttribute('accept', 'image/*,.pdf')
    expect(input()).toHaveAttribute('multiple')
    expect(input()).toHaveAccessibleDescription('JPG, PNG or PDF')
    input().focus()
    expect(input()).toHaveFocus()
  })

  it('outside a Field the browse label names the input', () => {
    render(<FileDrop browseLabel="choose receipts" />)
    expect(screen.getByLabelText('choose receipts')).toHaveAttribute('type', 'file')
  })

  it('adds picked files (multiple appends) and lists name + size', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<FileDrop aria-label="Receipts" multiple onValueChange={onValueChange} />)
    const first = receipt()
    await user.upload(input(), first)
    expect(onValueChange).toHaveBeenLastCalledWith([first])
    const second = invoice()
    await user.upload(input(), second)
    expect(onValueChange).toHaveBeenLastCalledWith([first, second])
    expect(names()).toEqual(['hardware-receipt.jpg', 'power-bill-march.pdf'])
    expect(screen.getByText('1.8 MB')).toBeInTheDocument()
  })

  it('single: a new file replaces the current one', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<FileDrop aria-label="Receipts" defaultValue={[stored]} onValueChange={onValueChange} />)
    const next = invoice()
    await user.upload(input(), next)
    expect(onValueChange).toHaveBeenLastCalledWith([next])
  })

  it('rejects by type, size and count, in one onReject call', async () => {
    const user = setup()
    const onReject = vi.fn()
    const onValueChange = vi.fn()
    render(
      <FileDrop
        aria-label="Receipts"
        accept="image/*,.pdf"
        multiple
        maxFiles={2}
        maxSize={1_000_000}
        defaultValue={[stored]}
        onReject={onReject}
        onValueChange={onValueChange}
      />,
    )
    const ok = receipt()
    const big = invoice()
    const text = notes()
    const extra = file('second-receipt.png', 'image/png', 500)
    await user.upload(input(), [ok, big, text, extra])
    expect(onValueChange).toHaveBeenLastCalledWith([stored, ok])
    expect(onReject).toHaveBeenCalledTimes(1)
    expect(onReject).toHaveBeenCalledWith([
      { file: big, reason: 'size' },
      { file: text, reason: 'type' },
      { file: extra, reason: 'count' },
    ])
  })

  it('accepts dropped files, with data-dragging while over the zone', () => {
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    render(
      <FileDrop
        aria-label="Receipts"
        accept="image/*"
        multiple
        onValueChange={onValueChange}
        onReject={onReject}
      />,
    )
    const dropped = receipt()
    const text = notes()
    fireEvent.dragEnter(zone(), { dataTransfer: { files: [dropped], dropEffect: 'none' } })
    expect(zone()).toHaveAttribute('data-dragging')
    fireEvent.dragOver(zone(), { dataTransfer: { files: [dropped], dropEffect: 'none' } })
    fireEvent.drop(zone(), { dataTransfer: { files: [dropped, text] } })
    expect(zone()).not.toHaveAttribute('data-dragging')
    expect(onValueChange).toHaveBeenLastCalledWith([dropped])
    expect(onReject).toHaveBeenCalledWith([{ file: text, reason: 'type' }])
  })

  it('drag leave clears data-dragging once the pointer is out of the zone', () => {
    render(<FileDrop aria-label="Receipts" />)
    fireEvent.dragEnter(zone(), { dataTransfer: { files: [] } })
    fireEvent.dragEnter(must(zone().querySelector('span')), { dataTransfer: { files: [] } })
    fireEvent.dragLeave(must(zone().querySelector('span')))
    expect(zone()).toHaveAttribute('data-dragging')
    fireEvent.dragLeave(zone())
    expect(zone()).not.toHaveAttribute('data-dragging')
  })

  it('removes a file with its button and returns focus to the input', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(
      <FileDrop
        aria-label="Receipts"
        multiple
        defaultValue={[stored]}
        removeLabel={(name) => `Remove receipt ${name}`}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Remove receipt grocer-receipt.png' }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
    expect(input()).toHaveFocus()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders StoredFiles (name, size, thumbnail url) next to new Files', () => {
    render(
      <FileDrop
        aria-label="Receipts"
        multiple
        preview="thumbnails"
        defaultValue={[stored, { id: 'x', name: 'statement.pdf' }]}
      />,
    )
    expect(names()).toEqual(['grocer-receipt.png', 'statement.pdf'])
    expect(screen.getByText('98 kB')).toBeInTheDocument()
    expect(document.querySelector('img')).toHaveAttribute('src', stored.url)
    expect(screen.getByText('PDF')).toBeInTheDocument()
  })

  describe('object URLs', () => {
    const created: string[] = []
    const revoked: string[] = []
    const original = {
      create: URL.createObjectURL.bind(URL),
      revoke: URL.revokeObjectURL.bind(URL),
    }

    beforeEach(() => {
      created.length = 0
      revoked.length = 0
      let n = 0
      URL.createObjectURL = vi.fn(() => {
        const url = `blob:test/${String(++n)}`
        created.push(url)
        return url
      })
      URL.revokeObjectURL = vi.fn((url: string) => {
        revoked.push(url)
      })
    })
    afterEach(() => {
      URL.createObjectURL = original.create
      URL.revokeObjectURL = original.revoke
    })

    it('creates thumbnails for image Files and revokes them on removal and unmount', async () => {
      const user = setup()
      const a = receipt()
      const b = file('homewares-receipt.png', 'image/png', 4000)
      const { unmount } = render(
        <FileDrop
          aria-label="Receipts"
          multiple
          preview="thumbnails"
          defaultValue={[a, b, invoice()]}
        />,
      )
      expect(created).toEqual(['blob:test/1', 'blob:test/2'])
      expect(document.querySelectorAll('img')).toHaveLength(2)
      await user.click(screen.getByRole('button', { name: 'Remove hardware-receipt.jpg' }))
      expect(revoked).toEqual(['blob:test/1'])
      unmount()
      expect(revoked).toEqual(['blob:test/1', 'blob:test/2'])
    })

    it('list preview never creates object URLs', () => {
      render(<FileDrop aria-label="Receipts" multiple defaultValue={[receipt()]} />)
      expect(created).toEqual([])
    })

    it('is balanced under StrictMode', () => {
      const { unmount } = render(
        <StrictMode>
          <FileDrop
            aria-label="Receipts"
            multiple
            preview="thumbnails"
            defaultValue={[receipt()]}
          />
        </StrictMode>,
      )
      unmount()
      expect(revoked.sort()).toEqual([...created].sort())
    })
  })

  it('syncs the input FileList through DataTransfer when available', async () => {
    const added: File[] = []
    class FakeDataTransfer {
      items = { add: (f: File) => added.push(f) }
      files = [] as unknown as FileList
    }
    const original = (globalThis as { DataTransfer?: unknown }).DataTransfer
    ;(globalThis as { DataTransfer?: unknown }).DataTransfer = FakeDataTransfer
    try {
      const user = setup()
      render(<FileDrop aria-label="Receipts" multiple defaultValue={[stored]} />)
      const picked = receipt()
      await user.upload(input(), picked)
      // StoredFiles aren't Files: only the new file goes into the FileList.
      expect(added).toContain(picked)
      expect(added.every((f) => f instanceof File)).toBe(true)
    } finally {
      ;(globalThis as { DataTransfer?: unknown }).DataTransfer = original
    }
  })

  it('carries name on the input, so FormData sends the picked file', async () => {
    const user = setup()
    const { container } = render(
      <form>
        <FileDrop aria-label="Receipts" name="receipts" />
      </form>,
    )
    const picked = receipt()
    await user.upload(input(), picked)
    expect(new FormData(must(container.querySelector('form'))).getAll('receipts')).toEqual([picked])
  })

  it('an all-rejected pick leaves nothing in the input, so FormData does not send it', async () => {
    const user = setup()
    const onReject = vi.fn()
    const { container } = render(
      <form>
        <FileDrop aria-label="Receipts" name="receipts" accept="image/*" onReject={onReject} />
      </form>,
    )
    const text = notes()
    await user.upload(input(), text)
    expect(onReject).toHaveBeenCalledWith([{ file: text, reason: 'type' }])
    expect(input().files).toHaveLength(0)
    expect(
      new FormData(must(container.querySelector('form')))
        .getAll('receipts')
        .filter((v) => v instanceof File && v.name !== ''),
    ).toEqual([])
  })

  it('re-picking the same rejected file reports it again', async () => {
    const user = setup()
    const onReject = vi.fn()
    render(<FileDrop aria-label="Receipts" accept="image/*" onReject={onReject} />)
    const text = notes()
    await user.upload(input(), text)
    await user.upload(input(), text)
    expect(onReject).toHaveBeenCalledTimes(2)
  })

  it('an all-rejected pick resyncs the FileList to the accepted value (DataTransfer path)', async () => {
    const lists: File[][] = []
    class FakeDataTransfer {
      private added: File[] = []
      items = { add: (f: File) => this.added.push(f) }
      get files() {
        lists.push(this.added)
        throw new Error('jsdom cannot assign a fake FileList')
      }
    }
    const original = (globalThis as { DataTransfer?: unknown }).DataTransfer
    ;(globalThis as { DataTransfer?: unknown }).DataTransfer = FakeDataTransfer
    try {
      const user = setup()
      const kept = receipt()
      render(<FileDrop aria-label="Receipts" accept="image/*" multiple defaultValue={[kept]} />)
      lists.length = 0
      await user.upload(input(), notes())
      // Value unchanged, but the input was rebuilt from it: just the kept file.
      expect(lists).toEqual([[kept]])
    } finally {
      ;(globalThis as { DataTransfer?: unknown }).DataTransfer = original
    }
  })

  it('readOnly: no picker, drops ignored, no remove buttons', () => {
    const onValueChange = vi.fn()
    render(
      <FileDrop
        aria-label="Receipts"
        readOnly
        defaultValue={[stored]}
        onValueChange={onValueChange}
      />,
    )
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    input().dispatchEvent(click)
    expect(click.defaultPrevented).toBe(true)
    fireEvent.drop(zone(), { dataTransfer: { files: [receipt()] } })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(zone()).toHaveAttribute('data-readonly')
  })

  it('disabled: input disabled, drops ignored', () => {
    const onValueChange = vi.fn()
    render(<FileDrop aria-label="Receipts" disabled onValueChange={onValueChange} />)
    expect(input()).toBeDisabled()
    fireEvent.drop(zone(), { dataTransfer: { files: [receipt()] } })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(zone()).toHaveAttribute('data-disabled')
  })

  it('invalid from a Field sets aria-invalid and data-invalid', () => {
    render(
      <Field label="Receipts" error="Add at least one receipt">
        <FileDrop />
      </Field>,
    )
    expect(input()).toHaveAttribute('aria-invalid', 'true')
    expect(zone()).toHaveAttribute('data-invalid')
  })

  it('clicking the zone opens the picker (clicks the input)', async () => {
    const user = setup()
    render(<FileDrop aria-label="Receipts" />)
    const onClick = vi.fn()
    input().addEventListener('click', onClick)
    await user.click(zone())
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('onBlur fires when focus leaves the whole control', async () => {
    const user = setup()
    const onBlur = vi.fn()
    render(
      <>
        <FileDrop aria-label="Receipts" multiple defaultValue={[stored]} onBlur={onBlur} />
        <button type="button">Next</button>
      </>,
    )
    input().focus()
    await user.tab() // to the file's remove button
    expect(screen.getByRole('button', { name: /Remove/ })).toHaveFocus()
    expect(onBlur).not.toHaveBeenCalled()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('is controlled', async () => {
    const user = setup()
    function Controlled() {
      const [files, setFiles] = useState<readonly FileValue[]>([stored])
      return (
        <>
          <FileDrop aria-label="Receipts" multiple value={files} onValueChange={setFiles} />
          <button
            type="button"
            onClick={() => {
              setFiles([])
            }}
          >
            Clear
          </button>
        </>
      )
    }
    render(<Controlled />)
    await user.upload(input(), receipt())
    expect(names()).toEqual(['grocer-receipt.png', 'hardware-receipt.jpg'])
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(names()).toEqual([])
  })
})
