import { TagsField } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <TagsField
      label="Labels"
      description="Press Enter or a comma to add one"
      defaultValue={['commute']}
      maxTags={5}
      normalise="lowercase"
    />
  )
}
