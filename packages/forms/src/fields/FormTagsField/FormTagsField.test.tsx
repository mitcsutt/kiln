import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { ComponentType, ReactNode } from 'react'
import { FormTagsField } from '#fields/FormTagsField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

const addTags = async (user: UserEvent, control: HTMLElement, value: readonly string[]) => {
  // Remove any existing chips (Backspace on an empty box removes the last), then type the new ones.
  await user.click(control)
  for (let i = 0; i < 10; i++) await user.keyboard('{Backspace}')
  for (const tag of value) await user.type(control, `${tag},`)
}

runFieldConformance<readonly string[]>('tags', {
  build: (props) => <FormTagsField {...props} placeholder="Add a label" />,
  valid: ['design', 'research'],
  invalid: [],
  interact: addTags,
  display: () =>
    screen
      .queryAllByRole('listitem')
      .map((li) => li.textContent)
      .join(', '),
  shown: (value) => value.join(', '),
  viewText: /design/,
})

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

describe('FormTagsField', () => {
  it('emits a new string[] on each add/remove, submitted via one hidden input per tag', async () => {
    const { form, user, container } = renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return <AppField name="labels">{() => <FormTagsField label="Labels" />}</AppField>
      },
      { defaultValues: { labels: ['design'] as string[] } },
    )
    const control = screen.getByLabelText('Labels')
    await user.click(control)
    await user.type(control, 'research,')
    expect(form.state.values.labels).toEqual(['design', 'research'])
    const formElement = must(container.querySelector('form'))
    expect(new FormData(formElement).getAll('labels')).toEqual(['design', 'research'])
  })

  it('renders the tags in view mode', () => {
    renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return <AppField name="labels">{() => <FormTagsField label="Labels" />}</AppField>
      },
      {
        defaultValues: { labels: ['design', 'research'] as string[] },
        formProps: { mode: 'view' },
      },
    )
    expect(screen.getByText('design')).toBeInTheDocument()
    expect(screen.getByText('research')).toBeInTheDocument()
  })

  it('renders "not provided" in view mode when there are no tags', () => {
    renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return <AppField name="labels">{() => <FormTagsField label="Labels" />}</AppField>
      },
      { defaultValues: { labels: [] as string[] }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Not provided')).toBeInTheDocument()
  })
})
