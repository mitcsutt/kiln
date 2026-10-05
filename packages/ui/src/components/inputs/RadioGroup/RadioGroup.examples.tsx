import { Inline, RadioGroup, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <RadioGroup aria-label="Deck" defaultValue="upper">
      {[
        { value: 'upper', label: 'Upper deck' },
        { value: 'lower', label: 'Lower deck' },
        { value: 'car', label: 'Car deck', disabled: true },
      ].map((option) => (
        <Inline key={option.value} gap={3}>
          <RadioGroup.Item
            value={option.value}
            id={`deck-${option.value}`}
            disabled={option.disabled}
          />
          <Text as="label" htmlFor={`deck-${option.value}`}>
            {option.label}
          </Text>
        </Inline>
      ))}
    </RadioGroup>
  )
}
