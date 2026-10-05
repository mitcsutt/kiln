/**
 * Every piece of library copy (D15). Override per kit (`createFormKit({ messages })`) or per form
 * (`useAppForm({ messages })`). Rule messages use `{value}` placeholders.
 */
export interface FormMessages {
  errorSummaryTitle: string
  errorCount: (n: number) => string
  submitFailed: string
  noChanges: string
  unsavedChanges: string
  saving: string
  saved: string
  saveFailed: string
  validating: string
  add: string
  remove: (item: string) => string
  moveUp: (item: string) => string
  moveDown: (item: string) => string
  item: (index: number) => string
  itemAdded: (item: string) => string
  itemRemoved: (item: string) => string
  itemMoved: (item: string, pos: number) => string
  maxItems: (max: number) => string
  /** Repeater (table): the header of the trailing item-actions column. */
  actions: string
  stepOf: (index: number, count: number, title: string) => string
  back: string
  next: string
  submit: string
  /** ResetButton's default text. */
  reset: string
  /** Stepper: visually hidden suffix after a completed step's label. */
  stepComplete: string
  /** Stepper: visually hidden suffix after the label of a step with errors. */
  stepError: string
  /** Stepper compact mode (narrow screens), before the current step's title: "Step 2 of 4". */
  stepCompact: (index: number, count: number) => string
  /** FormReview: the default text of the button that goes back to edit a step. */
  edit: string
  optionsFailed: string
  fileRejected: { type: string; size: string; count: string }
  rules: {
    required: string
    minLength: string
    maxLength: string
    pattern: string
    email: string
    url: string
    min: string
    max: string
    step: string
    integer: string
    minItems: string
    maxItems: string
    unique: string
    minDate: string
    maxDate: string
  }
  /** View mode: a checked boolean. */
  yes: string
  /** View mode: an unchecked boolean. */
  no: string
  /** View mode: an empty value. */
  notProvided: string
}

export const defaultMessages: FormMessages = {
  errorSummaryTitle: 'There is a problem',
  errorCount: (n) => (n === 1 ? '1 error' : `${String(n)} errors`),
  submitFailed: "Something went wrong and we couldn't send this. Try again.",
  noChanges: 'There are no changes to save',
  unsavedChanges: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Saved',
  saveFailed: "Couldn't save",
  validating: 'Checking…',
  add: 'Add',
  remove: (item) => `Remove ${item}`,
  moveUp: (item) => `Move ${item} up`,
  moveDown: (item) => `Move ${item} down`,
  item: (index) => `Item ${String(index + 1)}`,
  itemAdded: (item) => `${item} added`,
  itemRemoved: (item) => `${item} removed`,
  itemMoved: (item, pos) => `${item} moved to position ${String(pos)}`,
  maxItems: (max) => `You can add up to ${String(max)}`,
  actions: 'Actions',
  stepOf: (index, count, title) => `Step ${String(index)} of ${String(count)}: ${title}`,
  back: 'Back',
  next: 'Next',
  submit: 'Submit',
  reset: 'Reset',
  stepComplete: 'completed',
  stepError: 'has errors',
  stepCompact: (index, count) => `Step ${String(index)} of ${String(count)}`,
  edit: 'Edit',
  optionsFailed: "Couldn't load options",
  fileRejected: {
    type: "That file type isn't allowed",
    size: 'That file is too large',
    count: 'Too many files',
  },
  rules: {
    required: 'Enter a value',
    minLength: 'Enter at least {value} characters',
    maxLength: 'Enter {value} characters or fewer',
    pattern: 'Enter a value in the right format',
    email: 'Enter an email address, like name@example.com',
    url: 'Enter a web address, like https://example.com',
    min: 'Enter {value} or more',
    max: 'Enter {value} or less',
    step: 'Enter a multiple of {value}',
    integer: 'Enter a whole number',
    minItems: 'Choose at least {value}',
    maxItems: 'Choose {value} or fewer',
    unique: 'Each entry must be different',
    minDate: 'Enter a date on or after {value}',
    maxDate: 'Enter a date on or before {value}',
  },
  yes: 'Yes',
  no: 'No',
  notProvided: 'Not provided',
}

/** Replaces `{key}` placeholders with `params[key]`. Unknown keys are left as written. */
export function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key]
    // Rule params are strings and numbers; anything else prints as it would in a template.
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return value === undefined || value === null ? match : String(value)
  })
}

/** Deep-merges message overrides (one level for `rules` / `fileRejected`). */
export function mergeMessages(...layers: (Partial<FormMessages> | undefined)[]): FormMessages {
  let result: FormMessages = defaultMessages
  for (const layer of layers) {
    if (!layer) continue
    result = {
      ...result,
      ...layer,
      rules: { ...result.rules, ...layer.rules },
      fileRejected: { ...result.fileRejected, ...layer.fileRejected },
    }
  }
  return result
}

/**
 * Resolves a `$`-prefixed message key (`'$rules.minLength'`) against `messages` and interpolates
 * `params`. Plain messages are interpolated as-is.
 */
export function resolveMessage(
  message: string,
  messages: FormMessages,
  params?: Record<string, unknown>,
): string {
  if (!message.startsWith('$')) return interpolate(message, params)
  let node: unknown = messages
  for (const part of message.slice(1).split('.')) {
    if (node === null || typeof node !== 'object') return message
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? interpolate(node, params) : message
}
