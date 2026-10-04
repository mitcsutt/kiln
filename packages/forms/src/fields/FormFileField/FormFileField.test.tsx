import { fireEvent, screen } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ComponentType, ReactNode } from 'react'
import type { FileValue } from '@mitcsutt/kiln-ui'
import { FormFileField } from '#fields/FormFileField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

const receipt = (name = 'receipt.jpg') =>
  new File([new Uint8Array(10)], name, { type: 'image/jpeg' })
const textFile = () => new File(['x'], 'notes.txt', { type: 'text/plain' })

/** Single-file mode (no `multiple`): a new upload replaces the current file, so going to any
 * target is either "upload one" or, for empty, "remove the current one". */
const interact = async (user: UserEvent, control: HTMLElement, value: readonly FileValue[]) => {
  if (value.length === 0) {
    const button = screen.queryByRole('button', { name: /^Remove /i })
    if (button) await user.click(button)
    return
  }
  await user.upload(control, value as File[])
}

runFieldConformance<readonly FileValue[]>('file', {
  build: (props) => <FormFileField {...props} />,
  valid: [receipt()],
  invalid: [],
  interact,
  display: () =>
    screen
      .queryAllByRole('listitem')
      .map((li) => li.querySelector('span span')?.textContent)
      .join(', '),
  shown: (value) => value.map((f) => f.name).join(', '),
  viewText: 'receipt.jpg',
  // With a file present, one Tab reaches the file's own remove button (still "within the
  // control", per FileDrop's blur contract): keep tabbing past the remove buttons.
  leaveControl: async (user) => {
    await user.tab()
    for (let guard = 0; guard < 10; guard += 1) {
      const active = document.activeElement
      if (!(
        active instanceof HTMLButtonElement &&
        /^Remove /i.test(active.getAttribute('aria-label') ?? active.textContent)
      ))
        return
      await user.tab()
    }
  },
})

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

describe('FormFileField', () => {
  it('value / onValueChange are FileValue[]', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const { form } = renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return (
          <AppField name="receipts">{() => <FormFileField label="Receipts" multiple />}</AppField>
        )
      },
      { defaultValues: { receipts: [] as FileValue[] } },
    )
    const picked = receipt()
    await user.upload(screen.getByLabelText('Receipts'), [picked])
    expect(form.state.values.receipts).toEqual([picked])
  })

  it('turns a rejection into the field error, via messages.fileRejected', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onReject = vi.fn()
    const { form } = renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return (
          <AppField name="receipts">
            {() => <FormFileField label="Receipts" accept="image/*" onReject={onReject} />}
          </AppField>
        )
      },
      { defaultValues: { receipts: [] as FileValue[] } },
    )
    const input = screen.getByLabelText('Receipts')
    await user.upload(input, [textFile()])
    expect(onReject).toHaveBeenCalledWith([{ file: expect.any(File) as unknown, reason: 'type' }])
    expect(await screen.findByText("That file type isn't allowed")).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    // Still an empty value — the rejected file was never added.
    expect(form.state.values.receipts).toEqual([])

    // A valid upload afterwards clears the injected error.
    await user.upload(input, [receipt()])
    expect(screen.queryByText("That file type isn't allowed")).not.toBeInTheDocument()
  })

  it('a rejected file shows and announces its error at once, before any blur', async () => {
    renderForm((f) => <f.FileField name="receipts" label="Receipts" accept="image/*" />, {
      defaultValues: { receipts: [] as readonly FileValue[] },
    })
    const input = screen.getByLabelText('Receipts')
    // A bare change event: no focus/blur, like the OS chooser returning a file.
    fireEvent.change(input, { target: { files: [textFile()] } })
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent("That file type isn't allowed")
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows a warning once focus really leaves the control, and does not block submit', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onSubmit = vi.fn()
    renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return (
          <>
            <AppField name="receipts">
              {() => <FormFileField label="Receipts" warn={() => 'Large files upload slowly'} />}
            </AppField>
            <button type="submit">Save</button>
          </>
        )
      },
      { defaultValues: { receipts: [receipt()] as FileValue[] }, onSubmit },
    )
    screen.getByLabelText('Receipts').focus()
    // One file is present: the first tab reaches its own remove button (still "inside" the
    // control, per FileDrop's blur contract) — the second actually leaves it.
    await user.tab()
    expect(screen.queryByText('Large files upload slowly')).not.toBeInTheDocument()
    await user.tab()
    expect(await screen.findByText('Large files upload slowly')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('renders file names in view mode, and "not provided" when empty', () => {
    renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return <AppField name="receipts">{() => <FormFileField label="Receipts" />}</AppField>
      },
      { defaultValues: { receipts: [] as FileValue[] }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Not provided')).toBeInTheDocument()
  })
})
