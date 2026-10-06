import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { FileDrop, type FileDropProps } from '#components/inputs/FileDrop'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface FileFieldProps
  extends FieldLabelProps, Omit<FileDropProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * A labelled file picker with drag and drop, constraints and a preview.
 *
 * @remarks
 * `FileField` is a {@link Field | Field} around a {@link FileDrop | FileDrop}. The label names the
 * native file input.
 *
 * @privateRemarks
 * Label + FileDrop + description + warning + error. The label names the native file
 * input (the ref goes there too); `className`/`style` go to the field wrapper.
 * `onReject` reports files that weren't added — turn them into the field's error.
 *
 * <FileField label="Receipts" accept="image/*,.pdf" multiple maxSize={5_000_000} preview="thumbnails" />
 */
export const FileField = forwardRef<HTMLInputElement, FileFieldProps>(
  function FileField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { id, disabled, className, style, ...dropProps } = rest
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <FileDrop ref={ref} id={id} disabled={disabled} {...dropProps} />
      </Field>
    )
  },
)
