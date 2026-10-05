import { FormAmountField } from '#components/fields/FormAmountField'
import { FormCheckboxField } from '#components/fields/FormCheckboxField'
import { FormCheckboxGroupField } from '#components/fields/FormCheckboxGroupField'
import { FormChipsField } from '#components/fields/FormChipsField'
import { FormChoiceCardsField } from '#components/fields/FormChoiceCardsField'
import { FormColorField } from '#components/fields/FormColorField'
import { FormComboboxField } from '#components/fields/FormComboboxField'
import { FormDateField } from '#components/fields/FormDateField'
import { FormDateRangeField } from '#components/fields/FormDateRangeField'
import { FormDateTimeField } from '#components/fields/FormDateTimeField'
import { FormFileField } from '#components/fields/FormFileField'
import { FormHiddenField } from '#components/fields/FormHiddenField'
import { FormMultiChoiceCardsField } from '#components/fields/FormMultiChoiceCardsField'
import { FormMultiSelectField } from '#components/fields/FormMultiSelectField'
import { FormNumberField } from '#components/fields/FormNumberField'
import { FormOneTimeCodeField } from '#components/fields/FormOneTimeCodeField'
import { FormPasswordField } from '#components/fields/FormPasswordField'
import { FormRadioField } from '#components/fields/FormRadioField'
import { FormRangeField } from '#components/fields/FormRangeField'
import { FormRatingField } from '#components/fields/FormRatingField'
import { FormSegmentedField } from '#components/fields/FormSegmentedField'
import { FormSelectField } from '#components/fields/FormSelectField'
import { FormSliderField } from '#components/fields/FormSliderField'
import { FormSwitchField } from '#components/fields/FormSwitchField'
import { FormTagsField } from '#components/fields/FormTagsField'
import { FormTextareaField } from '#components/fields/FormTextareaField'
import { FormTextField } from '#components/fields/FormTextField'
import { FormTimeField } from '#components/fields/FormTimeField'
/**
 * The default field registry: kind → bound field (`text` → `form.TextField` / `field.TextField`).
 */
export const defaultFields = {
  text: FormTextField,
  textarea: FormTextareaField,
  select: FormSelectField,
  checkbox: FormCheckboxField,
  date: FormDateField,
  time: FormTimeField,
  dateTime: FormDateTimeField,
  hidden: FormHiddenField,
  password: FormPasswordField,
  number: FormNumberField,
  amount: FormAmountField,
  oneTimeCode: FormOneTimeCodeField,
  color: FormColorField,
  switch: FormSwitchField,
  dateRange: FormDateRangeField,
  radio: FormRadioField,
  segmented: FormSegmentedField,
  choiceCards: FormChoiceCardsField,
  multiChoiceCards: FormMultiChoiceCardsField,
  checkboxGroup: FormCheckboxGroupField,
  chips: FormChipsField,
  slider: FormSliderField,
  range: FormRangeField,
  rating: FormRatingField,
  combobox: FormComboboxField,
  multiSelect: FormMultiSelectField,
  tags: FormTagsField,
  file: FormFileField,
}
