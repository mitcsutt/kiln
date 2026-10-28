import {
  FieldPresentation,
  FieldViewList,
  Form,
  FormAccordion,
  FormAccordionItem,
  FormAside,
  FormGrid,
  FormPanel,
  FormPanels,
  FormRows,
  FormSection,
  FormStatus,
  FormTab,
  FormTabs,
  useAutosave,
  useServerValues,
} from '@mitcsutt/kiln-forms'
import { Inline, Page, Stack, Text } from '@mitcsutt/kiln-ui'

import { PageHeader } from '#components/PageHeader'
import {
  GLAZES,
  saveStudioSettings,
  searchGlazes,
  type StudioSettings,
} from '#features/studio/data/members'
import { settingsKit, settingsOptions } from '#features/studio/pages/Settings/utils/settingsKit'

import { BrandPreview } from './components/BrandPreview'
import { CharacterCount } from './components/CharacterCount'
import { GlazeLookup } from './components/GlazeLookup'
import { PasswordForm } from './components/PasswordForm'
import { SaveFooter } from './components/SaveFooter'
import { SettingsGroup } from './components/SettingsGroup'

const DAYS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
]

const CONES = [4, 5, 6, 7, 8, 9, 10].map((cone) => ({ value: cone, label: `Cone ${String(cone)}` }))

const loadGlazes = async ({ query }: { query: string }) =>
  (await searchGlazes(query)).map(({ value, label, description }) => ({
    value,
    label,
    description,
  }))

/** The studio's settings: saved as you change them, with the password in a form of its own. */
export function Settings({ settings }: { settings: StudioSettings }) {
  const form = settingsKit.useAppForm({ ...settingsOptions, defaultValues: settings })
  // A refetch updates fields the reader hasn't touched, and keeps their edits.
  useServerValues(form, settings)
  useAutosave(form, saveStudioSettings, { debounceMs: 700 })
  return (
    <Page>
      <PageHeader
        kicker="Studio admin"
        title="Settings"
        description="Changes save as you make them. Try clearing the studio name to see autosave hold off."
        theme="paper"
        actions={<FormStatus form={form} />}
      />
      <Form form={form} aria-label="Studio settings">
        <Stack gap={6}>
          <FormTabs label="Settings">
            <FormTab value="studio" label="Studio">
              <Stack gap={8} dividers>
                <FormAside
                  headingLevel={2}
                  title="Profile"
                  description="Shown on receipts and the public gallery."
                >
                  <form.AppField
                    name="studioName"
                    validators={{
                      onDynamic: ({ value }) =>
                        value.trim() ? undefined : 'The studio needs a name',
                    }}
                  >
                    {(field) => (
                      <Stack gap={1}>
                        <field.TextField label="Studio name" />
                        <CharacterCount max={40} />
                      </Stack>
                    )}
                  </form.AppField>
                  <form.TextField name="contactEmail" label="Contact email" type="email" />
                  <form.ColorField name="brandColour" label="Brand colour" />
                  <BrandPreview />
                  <form.HiddenField name="studioId" />
                </FormAside>
                <FormAside
                  headingLevel={2}
                  title="Opening hours"
                  description="Members see these on the door rota."
                >
                  <FormGrid columns={{ base: 1, sm: 2 }}>
                    <form.TimeField name="openFrom" label="Opens" />
                    <form.TimeField name="openTo" label="Closes" />
                  </FormGrid>
                  <form.ChipsField name="closedDays" label="Closed on" options={DAYS} />
                  <form.DateTimeField name="nextOpenStudio" label="Next open studio" />
                </FormAside>
                <FormAside headingLevel={2} title="Sharing">
                  <FieldPresentation layout="horizontal">
                    <FormRows>
                      <form.SwitchField name="newsletter" label="Monthly newsletter" />
                      <form.SwitchField
                        name="publicGallery"
                        label="Public gallery"
                        description="Finished pieces appear on the community page."
                      />
                    </FormRows>
                  </FieldPresentation>
                </FormAside>
              </Stack>
            </FormTab>
            <FormTab value="firing" label="Firing">
              <Stack gap={6}>
                <FormAccordion defaultValue={['defaults']}>
                  <FormAccordionItem
                    value="defaults"
                    title="Defaults"
                    description="What a new firing starts from"
                  >
                    <form.ConeField name="defaultCone" label="Glaze firing cone" options={CONES} />
                    <form.RangeField
                      name="bisqueRange"
                      label="Bisque range (°C)"
                      min={850}
                      max={1100}
                      step={10}
                    />
                    <form.SliderField
                      name="coolingHours"
                      label="Cooling time (hours)"
                      min={6}
                      max={24}
                    />
                    <form.SegmentedField
                      name="units"
                      label="Temperatures in"
                      options={[
                        { value: 'celsius', label: '°C' },
                        { value: 'fahrenheit', label: '°F' },
                      ]}
                    />
                  </FormAccordionItem>
                  <FormAccordionItem value="materials" title="Materials">
                    <form.RadioField
                      name="clayBody"
                      label="House clay"
                      options={[
                        { value: 'stoneware', label: 'Buff stoneware' },
                        { value: 'porcelain', label: 'Porcelain' },
                        { value: 'earthenware', label: 'Red earthenware' },
                      ]}
                    />
                    <form.AmountField
                      name="shelfFee"
                      label="Shelf fee per firing"
                      currency="GBP"
                      locale="en-GB"
                    />
                  </FormAccordionItem>
                </FormAccordion>
                <FormPanels columns={{ base: 1, md: 2 }}>
                  <FormPanel title="Featured glaze" description="Shown on the welcome screen">
                    <form.ComboboxField
                      name="featuredGlaze"
                      label="Glaze"
                      placeholder="Search glazes"
                      loadOptions={loadGlazes}
                    />
                  </FormPanel>
                  <FormPanel title="Glazes in stock">
                    <form.MultiSelectField name="stockedGlazes" label="Stocked" options={GLAZES} />
                  </FormPanel>
                </FormPanels>
              </Stack>
            </FormTab>
            <FormTab value="integrations" label="Integrations">
              <Stack gap={6}>
                <SettingsGroup
                  title="Kiln controller webhook"
                  description="Posted when a firing ends or a kiln faults."
                >
                  <form.JsonField
                    name="webhook"
                    label="Webhook"
                    validators={{
                      onDynamic: ({ value }) =>
                        value.includes('"url"') ? undefined : 'The webhook needs a url',
                    }}
                  />
                </SettingsGroup>
                <FormSection title="What members see">
                  <FieldPresentation mode="view">
                    <FieldViewList divided>
                      <form.TextField name="studioName" label="Studio" />
                      <form.TextField name="contactEmail" label="Contact" />
                      <form.TimeField name="openFrom" label="Opens" />
                      <form.TimeField name="openTo" label="Closes" />
                    </FieldViewList>
                  </FieldPresentation>
                </FormSection>
                <Stack gap={3}>
                  <Text weight="strong">Glaze shelf</Text>
                  <GlazeLookup />
                </Stack>
              </Stack>
            </FormTab>
          </FormTabs>
          <SaveFooter />
        </Stack>
      </Form>
      <Inline>
        <PasswordForm />
      </Inline>
    </Page>
  )
}
