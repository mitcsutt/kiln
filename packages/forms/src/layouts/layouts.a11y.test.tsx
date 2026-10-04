import { screen, waitFor } from '@testing-library/react'
import { describe, it } from 'vitest'
import { SubmitButton } from '#components/SubmitButton'
import { expectNoAxeViolations } from '#test/a11y'
import { renderForm } from '#test/renderForm'
import {
  FormAccordion,
  FormAside,
  FormPanels,
  FormReview,
  FormRows,
  FormSection,
  FormSentence,
  FormSteps,
  FormTabs,
  Repeater,
} from '#layouts'

const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)

describe('layouts — axe', () => {
  it('sections, aside, rows, panels, tabs and accordion (after an invalid submit)', async () => {
    const { container, user } = renderForm(
      (f) => (
        <>
          <FormSection title="Your details">
            <f.TextField name="name" label="Full name" validators={{ onDynamic: required }} />
          </FormSection>
          <FormSection as="section" title="Contact">
            <f.TextField name="email" label="Email" />
          </FormSection>
          <FormAside title="Notifications" description="What we email you about.">
            <f.CheckboxField name="weekly" label="Weekly summary" />
          </FormAside>
          <FormRows>
            <f.TextField name="display" label="Display name" />
          </FormRows>
          <FormPanels>
            <FormPanels.Panel title="Billing address">
              <f.TextField name="street" label="Street" />
            </FormPanels.Panel>
          </FormPanels>
          <FormTabs label="More">
            <FormTabs.Tab value="company" label="Company">
              <f.TextField
                name="company"
                label="Company name"
                validators={{ onDynamic: required }}
              />
            </FormTabs.Tab>
            <FormTabs.Tab value="notes" label="Notes">
              <f.TextField name="notes" label="Notes" />
            </FormTabs.Tab>
          </FormTabs>
          <FormAccordion>
            <FormAccordion.Item value="extra" title="Extra">
              <f.TextField name="extra" label="Extra" />
            </FormAccordion.Item>
          </FormAccordion>
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      {
        defaultValues: {
          name: '',
          email: '',
          weekly: false,
          display: '',
          street: '',
          company: '',
          notes: '',
          extra: '',
        },
      },
    )
    await expectNoAxeViolations(container)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expectFocus('Full name')
    })
    await expectNoAxeViolations(container)
  })

  it('steps, repeater (list + table), sentence and review', async () => {
    const { container } = renderForm(
      (f) => (
        <>
          <FormSteps label="Sign-up steps">
            <FormSteps.Step value="you" title="You">
              <FormSentence label="Reading goal">
                I want to read <f.TextField name="goal" label="Goal" />.
              </FormSentence>
            </FormSteps.Step>
            <FormSteps.Step value="guests" title="Guests">
              <Repeater form={f} name="guests" label="Guests" newItem={{ name: '' }} reorderable>
                {(item) => <item.fields.TextField name="name" label="Name" />}
              </Repeater>
              <Repeater
                form={f}
                name="crew"
                label="Crew"
                variant="table"
                newItem={{ name: '' }}
                columns={[{ header: 'Name' }]}
              >
                {(item) => <item.fields.TextField name="name" label="Crew name" />}
              </Repeater>
            </FormSteps.Step>
            <FormSteps.Step value="review" title="Review">
              <FormReview title="Check your answers">
                <f.TextField name="goal" label="Goal" />
              </FormReview>
            </FormSteps.Step>
          </FormSteps>
        </>
      ),
      {
        defaultValues: {
          goal: 'Twelve novels',
          guests: [{ name: 'Ada' }, { name: 'Grace' }],
          crew: [{ name: 'Hedy' }],
        },
      },
    )
    await expectNoAxeViolations(container)
  })
})

function expectFocus(label: string) {
  if (document.activeElement !== screen.getByLabelText(label))
    throw new Error(`${label} is not focused`)
}
