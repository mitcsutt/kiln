import { useFieldControl } from '@mitcsutt/kiln-ui'

/** The native select inside the field: kiln-ui's `Field` hands it its id and descriptions. */
export function ConeSelect({
  options,
  value,
  onChange,
  onBlur,
}: {
  options: readonly { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  onBlur: () => void
}) {
  const control = useFieldControl()
  return (
    <select
      id={control?.id}
      aria-describedby={control?.describedBy}
      aria-invalid={control?.invalid ? true : undefined}
      disabled={control?.disabled}
      value={value}
      onChange={(event) => {
        onChange(event.target.value)
      }}
      onBlur={onBlur}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
