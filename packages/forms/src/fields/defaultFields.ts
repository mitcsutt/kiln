import { FormAmountField } from '#fields/FormAmountField'
import { FormCheckboxField } from '#fields/FormCheckboxField'
import { FormCheckboxGroupField } from '#fields/FormCheckboxGroupField'
import { FormChipsField } from '#fields/FormChipsField'
import { FormChoiceCardsField } from '#fields/FormChoiceCardsField'
import { FormColorField } from '#fields/FormColorField'
import { FormComboboxField } from '#fields/FormComboboxField'
import { FormDateField } from '#fields/FormDateField'
import { FormDateRangeField } from '#fields/FormDateRangeField'
import { FormDateTimeField } from '#fields/FormDateTimeField'
import { FormFileField } from '#fields/FormFileField'
import { FormHiddenField } from '#fields/FormHiddenField'
import { FormMultiChoiceCardsField } from '#fields/FormMultiChoiceCardsField'
import { FormMultiSelectField } from '#fields/FormMultiSelectField'
import { FormNumberField } from '#fields/FormNumberField'
import { FormOneTimeCodeField } from '#fields/FormOneTimeCodeField'
import { FormPasswordField } from '#fields/FormPasswordField'
import { FormRadioField } from '#fields/FormRadioField'
import { FormRangeField } from '#fields/FormRangeField'
import { FormRatingField } from '#fields/FormRatingField'
import { FormSegmentedField } from '#fields/FormSegmentedField'
import { FormSelectField } from '#fields/FormSelectField'
import { FormSliderField } from '#fields/FormSliderField'
import { FormSwitchField } from '#fields/FormSwitchField'
import { FormTagsField } from '#fields/FormTagsField'
import { FormTextareaField } from '#fields/FormTextareaField'
import { FormTextField } from '#fields/FormTextField'
import { FormTimeField } from '#fields/FormTimeField'
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
