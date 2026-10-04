import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FocusEvent,
  type FocusEventHandler,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { CloseIcon, UploadIcon } from '#icons'
import { cx } from '#utils/cx'
import { useControllableState } from '#components/inputs/Combobox/useControllableState'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { useMergedRefs } from '#components/inputs/internal/refs'
import messageStyles from '#components/inputs/internal/messages.module.css'
import { extensionOf, formatFileSize, isFile, isImage, matchesAccept } from './fileUtils'
import styles from './FileDrop.module.css'

/** A file that already lives somewhere (uploaded earlier): shown and removable, never re-sent. */
export interface StoredFile {
  id: string
  name: string
  /** Bytes. */
  size?: number
  /** MIME type, e.g. `image/jpeg`. */
  type?: string
  /** Where to preview it (thumbnails). */
  url?: string
}

export type FileValue = File | StoredFile

export type FileRejectReason = 'type' | 'size' | 'count'

export interface FileRejection {
  file: File
  reason: FileRejectReason
}

export interface FileDropProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'onBlur'
> {
  value?: readonly FileValue[]
  defaultValue?: readonly FileValue[]
  onValueChange?: (files: FileValue[]) => void
  /** Native `accept`: extensions (`.pdf`), MIME types (`image/png`) or wildcards (`image/*`). Also checked on drop. */
  accept?: string
  /** Several files (added to the list). Without it a new file replaces the current one. */
  multiple?: boolean
  /** With `multiple`: the most files the list may hold. */
  maxFiles?: number
  /** Largest file accepted, in bytes. */
  maxSize?: number
  /** Files that weren't added, and why. One call per pick or drop. */
  onReject?: (rejections: readonly FileRejection[]) => void
  /** `list` (default): name and size rows. `thumbnails`: a grid with image previews. */
  preview?: 'list' | 'thumbnails'
  /** Default "Drop files here or". */
  dropLabel?: ReactNode
  /** Default "choose files". Also the input's name when nothing else labels it. */
  browseLabel?: string
  /** Accessible name of a file's remove button. Default `Remove <name>`. */
  removeLabel?: (name: string) => string
  name?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Critical border + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  /** Fires once focus leaves the whole control (the input and the remove buttons). */
  onBlur?: FocusEventHandler<HTMLElement>
}

/**
 * Object URLs for the image Files in `files`, created as files arrive and revoked as
 * they leave and on unmount.
 */
function useObjectUrls(files: readonly FileValue[], enabled: boolean): ReadonlyMap<File, string> {
  const images = useMemo(
    () => (enabled ? files.filter((file): file is File => isFile(file) && isImage(file)) : []),
    [files, enabled],
  )
  const cacheRef = useRef(new Map<File, string>())
  const [urls, setUrls] = useState<ReadonlyMap<File, string>>(() => new Map())

  useEffect(() => {
    const cache = cacheRef.current
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return
    const wanted = new Set(images)
    let changed = false
    for (const [file, url] of cache) {
      if (!wanted.has(file)) {
        URL.revokeObjectURL(url)
        cache.delete(file)
        changed = true
      }
    }
    for (const file of images) {
      if (!cache.has(file)) {
        cache.set(file, URL.createObjectURL(file))
        changed = true
      }
    }
    if (changed) setUrls(new Map(cache))
  }, [images])

  useEffect(() => {
    const cache = cacheRef.current
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url)
      cache.clear()
    }
  }, [])

  return urls
}

const defaultRemoveLabel = (name: string) => `Remove ${name}`

/* ─── FileDrop ────────────────────────────────────────────────────────────── */

/**
 * Pick or drop files. The real control is the native `<input type="file">` (visually
 * hidden, labelled by the surrounding Field, focus ring on the zone); drag-and-drop is an
 * enhancement. Files are held in state, not uploaded: `value` is `File`s plus any
 * `StoredFile`s from an earlier upload. The input's `FileList` is kept in sync where the
 * browser allows it, so a native form submit sends the current files.
 * The ref goes to the file input; `className`/`style` and other props go to the wrapper.
 *
 * <FileDrop accept="image/*,.pdf" multiple maxFiles={5} maxSize={5_000_000} preview="thumbnails" />
 */
export const FileDrop = markFieldAware(
  forwardRef<HTMLInputElement, FileDropProps>(function FileDrop(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      accept,
      multiple = false,
      maxFiles,
      maxSize,
      onReject,
      preview = 'list',
      dropLabel = 'Drop files here or',
      browseLabel = 'choose files',
      removeLabel = defaultRemoveLabel,
      name,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      required: requiredProp,
      invalid: invalidProp,
      onBlur,
      id: idProp,
      className,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
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

    const [files, setFiles] = useControllableState<readonly FileValue[]>(
      valueProp,
      defaultValue ?? [],
      (next) => onValueChange?.([...next]),
    )
    const [dragging, setDragging] = useState(false)
    const dragDepth = useRef(0)
    const urls = useObjectUrls(files, preview === 'thumbnails')

    /**
     * Make the native input's FileList equal to the File values, so FormData sends them.
     * DataTransfer is the only way to build a FileList; where it's missing (or `files`
     * can't be assigned) the input is emptied when it holds no accepted file, so a rejected
     * pick is never submitted and picking the same file again still fires `change`.
     */
    const syncInput = (values: readonly FileValue[]) => {
      const input = inputRef.current
      if (!input) return
      const accepted = values.filter(isFile)
      try {
        if (typeof DataTransfer === 'undefined') throw new Error('no DataTransfer')
        const transfer = new DataTransfer()
        for (const file of accepted) transfer.items.add(file)
        input.files = transfer.files
      } catch {
        if (accepted.length === 0) input.value = ''
      }
    }

    useEffect(() => {
      syncInput(files)
    }, [files])

    /** Validates and adds; returns the value the control now holds. */
    const addFiles = (incoming: readonly File[]): readonly FileValue[] => {
      if (!interactive || incoming.length === 0) return files
      const limit = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1
      const base = multiple ? files : []
      const accepted: File[] = []
      const rejections: FileRejection[] = []
      for (const file of incoming) {
        if (!matchesAccept(file, accept)) rejections.push({ file, reason: 'type' })
        else if (maxSize !== undefined && file.size > maxSize)
          rejections.push({ file, reason: 'size' })
        else if (base.length + accepted.length >= limit) rejections.push({ file, reason: 'count' })
        else accepted.push(file)
      }
      const next = accepted.length > 0 ? [...base, ...accepted] : files
      if (accepted.length > 0) setFiles(next)
      if (rejections.length > 0) onReject?.(rejections)
      return next
    }

    const removeAt = (index: number) => {
      if (!interactive) return
      setFiles(files.filter((_, i) => i !== index))
      inputRef.current?.focus()
    }

    /* ─── Events ─── */
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const next = addFiles(Array.from(event.target.files ?? []))
      // Resync even when the value didn't change (every file rejected): the input still
      // holds the rejected pick, which would be submitted and would block a re-pick.
      syncInput(next)
    }

    // Read-only: focusable, but the picker never opens.
    const handleInputClick = (event: MouseEvent<HTMLInputElement>) => {
      if (!interactive) event.preventDefault()
    }

    // The whole zone opens the picker; the input itself handles its own clicks.
    const handleZoneClick = (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === inputRef.current || !interactive) return
      inputRef.current?.click()
    }

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (!interactive) return
      dragDepth.current += 1
      setDragging(true)
    }
    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = interactive ? 'copy' : 'none'
    }
    const handleDragLeave = () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1)
      if (dragDepth.current === 0) setDragging(false)
    }
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      dragDepth.current = 0
      setDragging(false)
      addFiles(Array.from(event.dataTransfer.files))
    }

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null
      if (next && rootRef.current?.contains(next)) return
      onBlur?.(event)
    }

    /* ─── Render ─── */
    // Outside a Field and with no aria label, the browse text names the input.
    const fallbackLabel = ariaLabel ?? ((ariaLabelledBy ?? field.labelId) ? undefined : browseLabel)

    return (
      <div
        ref={rootRef}
        className={cx(styles.root, className)}
        data-disabled={field.disabled || undefined}
        data-readonly={field.readOnly || undefined}
        onBlur={handleBlur}
        {...rest}
      >
        {/* The file input inside the zone is the keyboard path; a click anywhere on the zone
            is a bigger pointer target for the same input. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className={styles.zone}
          data-dragging={dragging || undefined}
          data-invalid={field.invalid || undefined}
          data-disabled={field.disabled || undefined}
          data-readonly={field.readOnly || undefined}
          onClick={handleZoneClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadIcon className={styles.icon} />
          <span className={styles.prompt} aria-hidden="true">
            {dropLabel} <span className={styles.browse}>{browseLabel}</span>
          </span>
          <input
            ref={composedRef}
            id={field.id}
            type="file"
            className={cx(messageStyles.visuallyHidden, styles.input)}
            name={name}
            accept={accept}
            multiple={multiple}
            disabled={field.disabled}
            aria-label={fallbackLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
            aria-required={field.required || undefined}
            aria-busy={field.busy || undefined}
            onChange={handleChange}
            onClick={handleInputClick}
          />
        </div>
        {files.length > 0 ? (
          <ul className={styles.list} data-preview={preview}>
            {files.map((file, index) => {
              const thumb =
                preview === 'thumbnails' && isImage(file)
                  ? isFile(file)
                    ? urls.get(file)
                    : file.url
                  : undefined
              const ext = extensionOf(file.name)
              return (
                <li
                  key={
                    isFile(file)
                      ? `${String(index)}:${file.name}:${String(file.size)}`
                      : `stored:${file.id}`
                  }
                  className={styles.item}
                >
                  {preview === 'thumbnails' ? (
                    <span className={styles.thumb} aria-hidden="true">
                      {thumb ? (
                        <img src={thumb} alt="" className={styles.image} />
                      ) : (
                        <span className={styles.ext}>{ext || 'FILE'}</span>
                      )}
                    </span>
                  ) : null}
                  <span className={styles.meta}>
                    <span className={styles.name}>{file.name}</span>
                    {file.size !== undefined ? (
                      <span className={styles.size}>{formatFileSize(file.size)}</span>
                    ) : null}
                  </span>
                  {interactive ? (
                    <button
                      type="button"
                      className={styles.remove}
                      aria-label={removeLabel(file.name)}
                      onClick={() => {
                        removeAt(index)
                      }}
                    >
                      <CloseIcon />
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    )
  }),
)
