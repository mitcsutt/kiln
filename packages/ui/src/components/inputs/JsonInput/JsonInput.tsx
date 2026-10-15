import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
} from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import { Button } from '#components/actions/Button'
import { CopyButton } from '#components/actions/CopyButton'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { joinIds, useMergedRefs } from '#components/inputs/internal/refs'
import { useLatest } from '#components/inputs/internal/useLatest'
import control from '#components/inputs/internal/control.module.css'
import { formatJson, minifyJson, parseJson, tokenizeJson, type JsonIndent } from './json'
import styles from './JsonInput.module.css'

// Layout effects warn during server rendering; on the server there's nothing to restore anyway.
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

/** Why the text isn't acceptable. A syntax error has the line and column it points at. */
export interface JsonInputError {
  message: string
  line?: number
  column?: number
}

/** What a JSON text holds, and whether it's acceptable. */
export interface JsonValidation {
  /** The parsed value, when the text is valid JSON. `undefined` when it's empty or invalid. */
  parsed: unknown
  /** `true` when the text is valid JSON that passes `validate`, or is empty. */
  valid: boolean
  /** Why it isn't valid. */
  error?: JsonInputError
}

export interface JsonInputProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'defaultValue' | 'wrap' | 'rows' | 'cols' | 'children'
> {
  /** The text (controlled). */
  value?: string
  /** The starting text (uncontrolled). */
  defaultValue?: string
  /** Called with the new text, and what it holds, on every change. */
  onValueChange?: (value: string, validation: JsonValidation) => void
  /**
   * Called when the validation the input shows changes: once typing pauses for
   * `validationDelay`, on blur, and straight away when the text becomes valid again.
   */
  onValidationChange?: (validation: JsonValidation) => void
  /**
   * Your own rules for a value that parses: return a message to reject it, or `undefined` to
   * accept it. Wire a JSON Schema validator in here.
   */
  validate?: (parsed: unknown) => string | undefined
  /** How long typing has to pause before an error shows, in ms. Default `500`. */
  validationDelay?: number
  /** How Format indents: `2` (default), `4` or `'tab'`. Also what Tab inserts. */
  indent?: JsonIndent
  /** Sort object keys when formatting or minifying. */
  sortKeys?: boolean
  /** Format the text when the input loses focus, if it's valid. */
  formatOnBlur?: boolean
  /** Close brackets and quotes as you type them. Default `true`. */
  autoClose?: boolean
  /** Number the lines. Default `true`. */
  lineNumbers?: boolean
  /** Wrap long lines instead of scrolling sideways. */
  wrap?: boolean
  /** Show the Format, Minify and Copy actions above the text. Default `true`. */
  toolbar?: boolean
  /** The least height, in lines. Default `4`. */
  minRows?: number
  /** Grow with the text up to this many lines, then scroll. Without it, it keeps growing. */
  maxRows?: number
  /** Critical border and `aria-invalid`, on top of its own validation. Set for you inside a `Field`. */
  invalid?: boolean
  /** Name of the copy action. Default "Copy JSON". */
  copyLabel?: string
}

const EMPTY: JsonValidation = { parsed: undefined, valid: true }

/** Parses `text` and runs `validate` on the result. Empty text is valid and holds nothing. */
export function validateJson(
  text: string,
  validate?: (parsed: unknown) => string | undefined,
): JsonValidation {
  if (text.trim() === '') return EMPTY
  const parsed = parseJson(text)
  if (!parsed.ok) {
    const { message, line, column } = parsed.error
    return { parsed: undefined, valid: false, error: { message, line, column } }
  }
  const message = validate?.(parsed.value)
  return message === undefined
    ? { parsed: parsed.value, valid: true }
    : { parsed: parsed.value, valid: false, error: { message } }
}

/** Whether two validations would show the same thing. `parsed` is compared by its JSON text. */
function sameValidation(a: JsonValidation, b: JsonValidation): boolean {
  return (
    a.valid === b.valid &&
    a.error?.message === b.error?.message &&
    a.error?.line === b.error?.line &&
    a.error?.column === b.error?.column &&
    (a.parsed === b.parsed || JSON.stringify(a.parsed) === JSON.stringify(b.parsed))
  )
}

const PAIRS: Record<string, string> = { '{': '}', '[': ']', '"': '"' }
const CLOSERS = new Set(['}', ']', '"'])

const unitOf = (indent: JsonIndent) => (indent === 'tab' ? '\t' : ' '.repeat(indent))

/** Start of the line `offset` is on. */
const lineStart = (text: string, offset: number) => text.lastIndexOf('\n', offset - 1) + 1

/**
 * A JSON editor in a field box: it highlights with the theme, numbers the lines, marks the line
 * with an error, and formats or minifies on demand.
 *
 * @remarks
 * `JsonInput` is for JSON that people edit by hand: a config blob, a request payload, a fixture.
 * It parses as you type and, once typing pauses, marks the line that's wrong and sets
 * `aria-invalid`. It never changes text that isn't valid. `onValueChange` gets the text and what
 * it holds (`parsed`, `valid` and `error`) on every change. For a labelled field that shows the
 * error message, use {@link JsonField | JsonField}.
 *
 * Format re-indents the text (`indent` is `2`, `4` or `'tab'`), and Minify puts it on one line.
 * Both keep numbers and strings exactly as written, so a long ID or a price like `1.50` survives,
 * and both keep the order of keys unless you pass `sortKeys`. `formatOnBlur` formats valid text
 * as the input loses focus.
 *
 * It grows with its content from `minRows` up to `maxRows`, then scrolls. `readOnly` makes it a
 * viewer: no Format or Minify, and Tab moves on as usual.
 *
 * ## Keyboard
 *
 * - **Tab** indents, and **Shift+Tab** outdents, the line or the selected lines. To leave the
 *   editor with the keyboard, press **Escape**, then **Tab**. Screen readers hear this in the
 *   input's description.
 * - **Enter** keeps the indent, and indents again after `{` or `[`.
 * - Typing `{`, `[` or `"` closes it for you (`autoClose`), and typing the closer steps over it.
 * - **Shift+Alt+F** formats.
 *
 * ## Your own rules and JSON Schema
 *
 * `validate` gets the parsed value and returns a message to reject it. That's where a JSON Schema
 * validator goes, so Kiln doesn't bundle one. With [Ajv](https://ajv.js.org):
 *
 * ```tsx
 * import Ajv from 'ajv'
 * import { JsonField } from '@mitcsutt/kiln-ui'
 *
 * const ajv = new Ajv()
 * const check = ajv.compile(payloadSchema)
 *
 * export function PayloadField() {
 *   return (
 *     <JsonField
 *       label="Payload"
 *       validate={(value) => (check(value) ? undefined : ajv.errorsText(check.errors))}
 *     />
 *   )
 * }
 * ```
 *
 * @privateRemarks
 * A transparent textarea over a highlighted <pre> in the same grid cell, so the browser does the
 * editing, selection, undo and IME, and the <pre> only paints. Highlighting is a built-in JSON
 * tokenizer rather than the shiki `highlight` entry: JSON's grammar is small enough to get exactly
 * right without a peer dependency, so the field works the same everywhere. Edits from the keyboard
 * go through execCommand('insertText') so they stay on the native undo stack.
 */
export const JsonInput = markFieldAware(
  forwardRef<HTMLTextAreaElement, JsonInputProps>(function JsonInput(
    {
      value: valueProp,
      defaultValue = '',
      onValueChange,
      onValidationChange,
      validate,
      validationDelay = 500,
      indent = 2,
      sortKeys = false,
      formatOnBlur = false,
      autoClose = true,
      lineNumbers = true,
      wrap = false,
      toolbar = true,
      minRows = 4,
      maxRows,
      invalid: invalidProp,
      copyLabel = 'Copy JSON',
      id: idProp,
      disabled: disabledProp,
      required: requiredProp,
      readOnly: readOnlyProp,
      className,
      style,
      onChange,
      onKeyDown,
      onBlur,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    ref,
  ) {
    const area = useRef<HTMLTextAreaElement>(null)
    const composedRef = useMergedRefs(ref, area)
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly: readOnlyProp,
    })
    const editable = !field.disabled && !field.readOnly
    const hintId = useId()

    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const text = valueProp ?? uncontrolled
    const latest = useLatest({ onValueChange, onValidationChange, validate })

    const validation = useMemo(() => validateJson(text, validate), [text, validate])
    const [shown, setShown] = useState<JsonValidation>(validation)
    const [announcement, setAnnouncement] = useState({ text: '', count: 0 })
    // A new node each time, so the same message ("Formatted") is announced again.
    const announce = (message: string) => {
      setAnnouncement((previous) => ({ text: message, count: previous.count + 1 }))
    }
    const escaped = useRef(false)
    const pendingSelection = useRef<[number, number] | null>(null)

    const show = (next: JsonValidation) => {
      setShown((previous) => (sameValidation(previous, next) ? previous : next))
    }

    // Show a fix at once; hold a new error back until typing pauses.
    useEffect(() => {
      if (validation.valid) {
        show(validation)
        return
      }
      const timer = setTimeout(() => {
        show(validation)
      }, validationDelay)
      return () => {
        clearTimeout(timer)
      }
    }, [validation, validationDelay])

    useEffect(() => {
      latest.current.onValidationChange?.(shown)
    }, [shown, latest])

    // Restore the caret after an edit that went through state rather than the browser.
    useIsomorphicLayoutEffect(() => {
      const selection = pendingSelection.current
      if (selection && area.current) {
        pendingSelection.current = null
        area.current.setSelectionRange(selection[0], selection[1])
      }
    })

    const commit = (next: string) => {
      if (valueProp === undefined) setUncontrolled(next)
      latest.current.onValueChange?.(next, validateJson(next, latest.current.validate))
    }

    /**
     * Replace `start`–`end` with `insert`, then select `selection` (by default, a caret after the
     * insert). Through the browser's own editing where it can, so Undo works, or through state.
     */
    const edit = (
      start: number,
      end: number,
      insert: string,
      selection: [number, number] = [start + insert.length, start + insert.length],
    ) => {
      const el = area.current
      if (!el) return
      const next = text.slice(0, start) + insert + text.slice(end)
      el.focus()
      el.setSelectionRange(start, end)
      // execCommand is deprecated, but it's the only edit that joins the native undo stack.
      const native =
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- see above
        typeof document.execCommand === 'function' &&
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- see above
        document.execCommand(insert === '' ? 'delete' : 'insertText', false, insert)
      if (native && el.value === next) {
        el.setSelectionRange(...selection)
        return
      }
      pendingSelection.current = selection
      commit(next)
    }

    const reformat = (mode: 'format' | 'minify') => {
      const next =
        mode === 'format' ? formatJson(text, { indent, sortKeys }) : minifyJson(text, { sortKeys })
      if (next === undefined) {
        const line = validation.error?.line
        announce(
          text.trim() === ''
            ? 'Nothing to format'
            : `Fix the error${line ? ` on line ${String(line)}` : ''} first`,
        )
        show(validation)
        return
      }
      announce(mode === 'format' ? 'Formatted' : 'Minified')
      if (next === text) return
      const caret = Math.min(area.current?.selectionStart ?? 0, next.length)
      edit(0, text.length, next, [caret, caret])
    }

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event)
      commit(event.target.value)
    }

    const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
      onBlur?.(event)
      escaped.current = false
      show(validation)
      if (formatOnBlur && editable && validation.valid) {
        const next = formatJson(text, { indent, sortKeys })
        if (next !== undefined && next !== text) commit(next)
      }
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || event.nativeEvent.isComposing || !editable) return
      const el = event.currentTarget
      const { selectionStart: start, selectionEnd: end } = el
      const unit = unitOf(indent)

      if (event.key === 'Escape') {
        escaped.current = true
        announce('Press Tab to leave the editor')
        return
      }
      if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        if (escaped.current) {
          escaped.current = false
          return
        }
        event.preventDefault()
        const from = lineStart(text, start)
        const multiline = text.slice(start, end).includes('\n')
        if (!event.shiftKey && !multiline) {
          edit(start, end, unit)
          return
        }
        const to = end > start && text[end - 1] === '\n' ? end - 1 : end
        const block = text.slice(from, to)
        const lines = block.split('\n')
        const changed = lines.map((line) =>
          event.shiftKey
            ? line.startsWith(unit)
              ? line.slice(unit.length)
              : line.replace(/^[ \t]+/, (lead) => lead.slice(unit.length))
            : `${unit}${line}`,
        )
        const next = changed.join('\n')
        if (next === block) return
        // Keep the lines selected, so Tab and Shift+Tab can be pressed again.
        edit(from, to, next, [from, from + next.length])
        return
      }
      escaped.current = false

      if (event.key === 'F' || event.code === 'KeyF') {
        if (event.shiftKey && event.altKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault()
          reformat('format')
        }
        return
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return

      if (event.key === 'Enter') {
        event.preventDefault()
        const from = lineStart(text, start)
        const lead = /^[ \t]*/.exec(text.slice(from, start))?.[0] ?? ''
        const before = text.slice(0, start).trimEnd().at(-1)
        const after = text[end]
        const opens = before === '{' || before === '['
        if (opens && after === PAIRS[before]) {
          const inner = `\n${lead}${unit}`
          const caret = start + inner.length
          edit(start, end, `${inner}\n${lead}`, [caret, caret])
        } else {
          edit(start, end, `\n${lead}${opens ? unit : ''}`)
        }
        return
      }
      if (event.key === 'Backspace' && start === end && start > 0) {
        const open = text.charAt(start - 1)
        if (autoClose && PAIRS[open] !== undefined && text[start] === PAIRS[open]) {
          event.preventDefault()
          edit(start - 1, start + 1, '')
        }
        return
      }
      if (!autoClose || event.key.length !== 1) return
      if (CLOSERS.has(event.key) && start === end && text[start] === event.key) {
        // Step over the closer that was typed for you.
        if (event.key !== '"' || text[start - 1] !== '\\') {
          event.preventDefault()
          el.setSelectionRange(start + 1, start + 1)
          return
        }
      }
      const close = PAIRS[event.key]
      if (close === undefined) return
      if (event.key === '"') {
        const previous = text[start - 1] ?? ''
        const next = text[end] ?? ''
        if (/[\w"\\]/.test(previous) || /[\w"]/.test(next)) return
      }
      event.preventDefault()
      const selected = text.slice(start, end)
      const caret = start + 1 + selected.length
      edit(start, end, `${event.key}${selected}${close}`, [caret, caret])
    }

    const lines = useMemo(() => tokenizeJson(text), [text])
    const errorLine = shown.error?.line
    const invalid = field.invalid || !shown.valid
    const digits = String(lines.length).length

    return (
      <div
        className={cx(control.box, styles.root, className)}
        style={mergeStyles(
          {
            '--_min-rows': minRows,
            '--_max-rows': maxRows,
            '--_digits': digits,
          } as CSSProperties,
          style,
        )}
        data-invalid={invalid || undefined}
        data-disabled={field.disabled || undefined}
        data-readonly={field.readOnly || undefined}
        data-wrap={wrap || undefined}
        data-line-numbers={lineNumbers || undefined}
        data-max-rows={maxRows ? '' : undefined}
      >
        {toolbar ? (
          <div className={styles.toolbar}>
            {editable ? (
              <>
                <Button
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  onClick={() => {
                    reformat('format')
                  }}
                >
                  Format
                </Button>
                <Button
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  onClick={() => {
                    reformat('minify')
                  }}
                >
                  Minify
                </Button>
              </>
            ) : null}
            <CopyButton
              className={styles.copy}
              value={() => text}
              label={copyLabel}
              size="sm"
              disabled={field.disabled}
            />
          </div>
        ) : null}
        <div className={styles.scroller}>
          <div className={styles.stack}>
            <pre className={styles.highlight} aria-hidden="true">
              {lines.map((tokens, i) => (
                <span
                  key={i}
                  className={styles.line}
                  data-line={lineNumbers ? i + 1 : undefined}
                  data-error={errorLine === i + 1 || undefined}
                >
                  {tokens.map((token, j) =>
                    token.type ? (
                      <span key={j} className={styles.token} data-token={token.type}>
                        {token.content}
                      </span>
                    ) : (
                      token.content
                    ),
                  )}
                </span>
              ))}
            </pre>
            <textarea
              ref={composedRef}
              id={field.id}
              className={styles.textarea}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              wrap={wrap ? 'soft' : 'off'}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              disabled={field.disabled}
              readOnly={field.readOnly}
              required={requiredProp ?? field.required}
              aria-describedby={joinIds(field.describedBy, editable ? hintId : undefined)}
              aria-invalid={invalid || undefined}
              aria-required={field.required || undefined}
              aria-busy={field.busy || undefined}
              {...rest}
            />
          </div>
        </div>
        {editable ? (
          <span id={hintId} hidden>
            Tab inserts an indent. Press Escape, then Tab, to leave the editor.
          </span>
        ) : null}
        <span className={styles.status} role="status">
          {announcement.text ? <span key={announcement.count}>{announcement.text}</span> : null}
        </span>
      </div>
    )
  }),
)
