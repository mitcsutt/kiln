import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
} from 'react'
import { unstable_PasswordToggleField as PasswordToggleField } from 'radix-ui'
import { EyeIcon, EyeOffIcon } from '#icons'
import { IconButton } from '#components/actions/IconButton'
import { Input, type InputProps } from '#components/inputs/Input'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { useMergedRefs } from '#components/inputs/internal/refs'
import styles from './PasswordInput.module.css'

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'trailing'> {
  /** Required: tells password managers whether to fill a saved password or offer a new one. */
  autoComplete: 'current-password' | 'new-password'
  /** Whether the password shows as text. Controlled; pair with `onVisibleChange`. */
  visible?: boolean
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  /** Accessible name of the toggle while hidden. Default `'Show password'`. */
  showLabel?: string
  /** Accessible name of the toggle while shown. Default `'Hide password'`. */
  hideLabel?: string
}

/**
 * A password input with a show/hide toggle at the end of the box (Radix
 * PasswordToggleField). The toggle is an IconButton whose name says what pressing it
 * does; submitting or resetting the form hides the password again. The ref goes to the
 * input; `onBlur` fires only when focus leaves the input *and* its toggle.
 *
 * <PasswordInput autoComplete="current-password" />
 */
export const PasswordInput = markFieldAware(
  forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
    {
      autoComplete,
      visible: visibleProp,
      defaultVisible = false,
      onVisibleChange,
      showLabel = 'Show password',
      hideLabel = 'Hide password',
      size = 'md',
      id: idProp,
      disabled: disabledProp,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const field = useResolvedField({ id: idProp, disabled: disabledProp })
    const autoId = useId()
    const inputId = field.id ?? `${autoId}password`
    const inputRef = useRef<HTMLInputElement>(null)
    const composedRef = useMergedRefs(ref, inputRef)
    const [internalVisible, setInternalVisible] = useState(defaultVisible)
    const visible = visibleProp ?? internalVisible
    const setVisible = (next: boolean) => {
      if (visibleProp === undefined) setInternalVisible(next)
      if (next !== visible) onVisibleChange?.(next)
    }
    const setVisibleRef = useRef(setVisible)
    setVisibleRef.current = setVisible

    // Submitting or resetting the form hides the password (a shown password shouldn't
    // survive into the next screen or a reset form).
    useEffect(() => {
      const formElement = inputRef.current?.form
      if (!formElement) return
      const hide = () => {
        setVisibleRef.current(false)
      }
      formElement.addEventListener('submit', hide)
      formElement.addEventListener('reset', hide)
      return () => {
        formElement.removeEventListener('submit', hide)
        formElement.removeEventListener('reset', hide)
      }
    }, [])

    // Blur counts only when focus leaves the whole box (input + toggle).
    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      const box = event.currentTarget.parentElement
      if (box && event.relatedTarget instanceof Node && box.contains(event.relatedTarget)) return
      onBlur?.(event)
    }
    const handleToggleBlur = (event: FocusEvent<HTMLButtonElement>) => {
      const input = inputRef.current
      if (!input || !onBlur) return
      const box = input.parentElement
      if (box && event.relatedTarget instanceof Node && box.contains(event.relatedTarget)) return
      // Same event, typed for the input's handler: the target is the toggle that lost focus.
      onBlur(event as unknown as FocusEvent<HTMLInputElement>)
    }

    // A pointer press keeps focus (and the caret) in the input.
    const keepFocus = (event: MouseEvent) => {
      if (document.activeElement === inputRef.current) event.preventDefault()
    }

    return (
      <PasswordToggleField.Root visible={visible} onVisibilityChange={setVisible}>
        <Input
          ref={composedRef}
          {...rest}
          id={inputId}
          size={size}
          disabled={disabledProp}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          onBlur={handleBlur}
          trailing={
            <PasswordToggleField.Toggle
              asChild
              id={`${inputId}-toggle`}
              aria-controls={inputId}
              aria-label={visible ? hideLabel : showLabel}
            >
              <IconButton
                className={styles.toggle}
                size="sm"
                label={visible ? hideLabel : showLabel}
                icon={visible ? <EyeOffIcon /> : <EyeIcon />}
                disabled={field.disabled}
                onMouseDown={keepFocus}
                onBlur={handleToggleBlur}
              />
            </PasswordToggleField.Toggle>
          }
        />
      </PasswordToggleField.Root>
    )
  }),
)
