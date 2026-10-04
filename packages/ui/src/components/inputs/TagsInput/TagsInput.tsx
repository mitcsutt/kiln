import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type FocusEventHandler,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { cx } from '#utils/cx'
import { Tag, TagList } from '#components/display/Tag'
import type { InputProps } from '#components/inputs/Input'
import { useControllableState } from '#components/inputs/Combobox/useControllableState'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { useMergedRefs } from '#components/inputs/internal/refs'
import control from '#components/inputs/internal/control.module.css'
import styles from './TagsInput.module.css'

export type TagsRejectReason = 'duplicate' | 'max' | 'empty'

export interface TagsInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'onBlur'
> {
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (tags: string[]) => void
  /**
   * What ends a tag: single characters (`','`, `';'`, `' '`) and/or the keys `'Enter'` and
   * `'Tab'`. Character delimiters also split pasted text; `'Enter'` makes pasted line
   * breaks split too. Default `[',', 'Enter']`.
   */
  delimiters?: readonly string[]
  /** Further tags are rejected (`onReject(tag, 'max')`) once there are this many. */
  maxTags?: number
  /** Default `false`: a tag already in the list is rejected (`'duplicate'`). */
  allowDuplicates?: boolean
  /** `trim` (default) trims whitespace; `lowercase` trims and lower-cases; `none` keeps the text as typed. */
  normalise?: 'none' | 'trim' | 'lowercase'
  /** A typed tag wasn't added. */
  onReject?: (tag: string, reason: TagsRejectReason) => void
  /** Accessible name of a chip's remove button. Default `Remove <tag>`. */
  removeLabel?: (tag: string) => string
  /** Fires once focus leaves the whole control (input and chip buttons). */
  onBlur?: FocusEventHandler<HTMLElement>
}

const DEFAULT_DELIMITERS: readonly string[] = [',', 'Enter']
const KEY_DELIMITERS = new Set(['Enter', 'Tab'])
const defaultRemoveLabel = (tag: string) => `Remove ${tag}`

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Splits text on the character delimiters (and line breaks when Enter is a delimiter). */
function splitter(delimiters: readonly string[]): RegExp | null {
  const parts = delimiters.filter((d) => !KEY_DELIMITERS.has(d)).map(escapeRegExp)
  if (delimiters.includes('Enter')) parts.push('\\r?\\n')
  return parts.length > 0 ? new RegExp(parts.join('|')) : null
}

/**
 * Free-form tags in one box: type and press Enter (or a comma) to add, Backspace on an
 * empty box removes the last, each chip has a remove button. Paste splits on the
 * delimiters. The ref and native input props go to the text input; `className`/`style`
 * go to the box. With `name`, each tag is submitted as its own hidden input.
 *
 * <TagsInput placeholder="Add a label" defaultValue={['Design']} maxTags={8} />
 */
export const TagsInput = markFieldAware(
  forwardRef<HTMLInputElement, TagsInputProps>(function TagsInput(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      delimiters = DEFAULT_DELIMITERS,
      maxTags,
      allowDuplicates = false,
      normalise = 'trim',
      onReject,
      removeLabel = defaultRemoveLabel,
      size = 'md',
      leading,
      trailing,
      invalid: invalidProp,
      numeric = false,
      htmlSize,
      id: idProp,
      disabled: disabledProp,
      required: requiredProp,
      readOnly: readOnlyProp,
      inputMode,
      name,
      form,
      placeholder,
      className,
      style,
      onKeyDown,
      onPaste,
      onBlur,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    ref,
  ) {
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      required: requiredProp,
      disabled: disabledProp,
      readOnly: readOnlyProp,
    })
    const interactive = !field.disabled && !field.readOnly
    const inputRef = useRef<HTMLInputElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)
    const composedRef = useMergedRefs(ref, inputRef)

    const [tags, setTags] = useControllableState<readonly string[]>(
      valueProp,
      defaultValue ?? [],
      (next) => onValueChange?.([...next]),
    )
    const [draft, setDraft] = useState('')
    const split = splitter(delimiters)

    const clean = (text: string) =>
      normalise === 'none'
        ? text
        : normalise === 'lowercase'
          ? text.trim().toLowerCase()
          : text.trim()

    /** Adds every candidate it can, reporting the rest. Returns whether anything was added. */
    const commit = (candidates: readonly string[]): boolean => {
      if (!interactive) return false
      const next = [...tags]
      for (const raw of candidates) {
        const tag = clean(raw)
        if (tag.trim() === '') {
          if (raw !== '') onReject?.(raw, 'empty')
          continue
        }
        if (!allowDuplicates && next.includes(tag)) {
          onReject?.(tag, 'duplicate')
          continue
        }
        if (maxTags !== undefined && next.length >= maxTags) {
          onReject?.(tag, 'max')
          continue
        }
        next.push(tag)
      }
      if (next.length === tags.length) return false
      setTags(next)
      return true
    }

    const commitDraft = () => {
      if (draft === '') return
      commit([draft])
      setDraft('')
    }

    const removeAt = (index: number) => {
      if (!interactive) return
      setTags(tags.filter((_, i) => i !== index))
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value
      // Typed (or IME/mobile-inserted) delimiter characters end a tag.
      if (split?.test(text)) {
        const parts = text.split(split)
        const last = parts.pop() ?? ''
        commit(parts)
        setDraft(last)
        return
      }
      setDraft(text)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || event.nativeEvent.isComposing) return
      const isDelimiter =
        delimiters.includes(event.key) && (KEY_DELIMITERS.has(event.key) || event.key.length === 1)
      if (isDelimiter && interactive) {
        if (event.key === 'Tab') {
          // Tab still moves focus; only a non-empty draft becomes a tag.
          commitDraft()
          return
        }
        if (draft === '' && event.key === 'Enter') return // let Enter submit the form
        event.preventDefault()
        commitDraft()
        return
      }
      if (event.key === 'Backspace' && draft === '' && interactive && tags.length > 0) {
        event.preventDefault()
        removeAt(tags.length - 1)
      }
    }

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      onPaste?.(event)
      if (event.defaultPrevented || !interactive || !split) return
      const text = event.clipboardData.getData('text')
      if (!split.test(text)) return
      event.preventDefault()
      const input = event.currentTarget
      const start = input.selectionStart ?? draft.length
      const end = input.selectionEnd ?? draft.length
      const combined = draft.slice(0, start) + text + draft.slice(end)
      commit(combined.split(split))
      setDraft('')
    }

    /** Focus left the whole control: a half-typed tag is kept, not lost. */
    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null
      if (next && rootRef.current?.contains(next)) return
      commitDraft()
      onBlur?.(event)
    }

    // Clicking the box's padding focuses the input, like one native control.
    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement
      if (target === inputRef.current || target.closest('button, a, input')) return
      event.preventDefault()
      inputRef.current?.focus()
    }

    return (
      <div
        ref={rootRef}
        className={cx(control.box, styles.root, className)}
        style={style}
        data-size={size}
        data-invalid={field.invalid || undefined}
        data-disabled={field.disabled || undefined}
        data-readonly={field.readOnly || undefined}
        onPointerDown={handlePointerDown}
        onBlur={handleBlur}
      >
        {leading != null ? (
          <span className={styles.adornment} data-slot="leading">
            {leading}
          </span>
        ) : null}
        <div className={styles.values}>
          {tags.length > 0 ? (
            <TagList className={styles.chips}>
              {tags.map((tag, index) => (
                <Tag
                  // Duplicates are allowed when asked for, so the index is part of the key.
                  key={`${String(index)}:${tag}`}
                  className={styles.chip}
                  onRemove={
                    interactive
                      ? () => {
                          removeAt(index)
                          inputRef.current?.focus()
                        }
                      : undefined
                  }
                  removeLabel={removeLabel(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </TagList>
          ) : null}
          <input
            ref={composedRef}
            id={field.id}
            type="text"
            className={styles.input}
            value={draft}
            size={htmlSize}
            placeholder={tags.length === 0 ? placeholder : undefined}
            disabled={field.disabled}
            readOnly={field.readOnly}
            inputMode={inputMode ?? (numeric ? 'decimal' : undefined)}
            enterKeyHint="enter"
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
            aria-required={field.required || undefined}
            aria-busy={field.busy || undefined}
            {...rest}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />
        </div>
        {trailing != null ? (
          <span className={styles.adornment} data-slot="trailing">
            {trailing}
          </span>
        ) : null}
        {name !== undefined
          ? tags.map((tag, index) => (
              <input
                key={`${String(index)}:${tag}`}
                type="hidden"
                name={name}
                value={tag}
                form={form}
                disabled={field.disabled || undefined}
              />
            ))
          : null}
      </div>
    )
  }),
)
