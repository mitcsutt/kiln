import {
  AspectRatio,
  Button,
  Card,
  ChipGroupField,
  ChoiceCardsField,
  Collapse,
  ComboboxField,
  Field,
  FileDrop,
  FileField,
  Grid,
  RatingField,
  SegmentedField,
  SelectField,
  Stack,
  SwitchField,
  TagsField,
  TagsInput,
  Text,
  Textarea,
  TextareaField,
  TextField,
  Transition,
} from '@mitcsutt/kiln-ui'
import { useState } from 'react'

import vase from '#assets/vase.svg'

/** The members' gallery wall: a plain, unbound form, nothing here leaves the browser. */
export function ShowYourWork() {
  const [selling, setSelling] = useState(false)
  const [sent, setSent] = useState(false)
  return (
    <Grid columns={{ base: 1, lg: 3 }} gap={6}>
      <Stack gap={4}>
        <AspectRatio ratio="4/3">
          <img src={vase} alt="Last month's wall favourite, a tall green vase" />
        </AspectRatio>
        <Text size="sm" tone="muted">
          Last month's favourite. The wall changes on the first Friday.
        </Text>
        <Transition open={sent} preset="slide-up">
          <Card variant="outline">
            <Card.Body>
              <Stack gap={2}>
                <Text weight="medium">On the shortlist</Text>
                <Text size="sm" tone="muted">
                  The wall committee meets on Thursday. You will hear by Friday.
                </Text>
              </Stack>
            </Card.Body>
          </Card>
        </Transition>
      </Stack>
      <Stack gap={4}>
        <TextField label="Title" placeholder="Untitled jar no. 4" />
        <TextareaField
          label="About the piece"
          description="What you were after, and what the kiln did instead."
          autoResize
          maxRows={6}
          maxLength={400}
          showCount
        />
        <SelectField
          label="Clay body"
          placeholder="Choose a clay"
          options={[
            { value: 'stoneware', label: 'Buff stoneware' },
            { value: 'porcelain', label: 'Porcelain' },
            { value: 'red', label: 'Red earthenware' },
          ]}
        />
        <SegmentedField
          label="Surface"
          defaultValue="glazed"
          options={[
            { value: 'glazed', label: 'Glazed' },
            { value: 'raw', label: 'Raw' },
            { value: 'slip', label: 'Slip' },
          ]}
        />
        <ComboboxField
          label="Made in a workshop?"
          placeholder="Type a workshop"
          options={[
            'Throw a bowl in a night',
            'Tall forms and collaring',
            'Handles that stay on',
          ].map((title) => ({ value: title, label: title }))}
          creatable
        />
        <TagsField
          label="Techniques"
          description="Press Enter or a comma to add one"
          defaultValue={['thrown']}
          maxTags={5}
          normalise="lowercase"
        />
        <Field label="Glazes used">
          <TagsInput
            defaultValue={['tenmoku']}
            maxTags={4}
            normalise="lowercase"
            placeholder="Add a glaze"
          />
        </Field>
        <RatingField
          label="How happy are you with it?"
          description="Honesty welcome. The wall likes a wonky one."
          clearable
        />
      </Stack>
      <Stack gap={4}>
        <FileField
          label="Main photo"
          description="A JPEG or PNG under 5 MB, on a plain background"
          accept="image/jpeg,image/png"
          maxSize={5_000_000}
          preview="thumbnails"
        />
        <Field label="Process photos" description="Up to three, from wedging to unloading">
          <FileDrop
            accept="image/*"
            multiple
            maxFiles={3}
            maxSize={5_000_000}
            preview="thumbnails"
          />
        </Field>
        <ChipGroupField
          label="Show it in"
          type="multiple"
          defaultValue={['wall']}
          options={[
            { value: 'wall', label: 'Gallery wall' },
            { value: 'window', label: 'Shop window' },
            { value: 'newsletter', label: 'Newsletter' },
          ]}
        />
        <ChoiceCardsField
          label="Return it"
          type="single"
          defaultValue="collect"
          options={[
            {
              value: 'collect',
              label: 'I will collect it',
              description: 'From the shelf by the door',
            },
            {
              value: 'keep',
              label: 'Keep it for the shop',
              description: 'If it sells, you get 70%',
              meta: '70%',
            },
          ]}
        />
        <SwitchField
          label="Selling it"
          checked={selling}
          onCheckedChange={setSelling}
          aria-controls="price-note"
        />
        <Collapse open={selling} id="price-note">
          <Field label="Note for the shop" description="A price, and anything a buyer should know">
            <Textarea
              placeholder="£40. Food safe, not oven safe."
              autoResize
              rows={2}
              maxRows={4}
            />
          </Field>
        </Collapse>
        <Button
          onClick={() => {
            setSent(true)
          }}
          disabled={sent}
        >
          {sent ? 'Submitted' : 'Submit to the wall'}
        </Button>
      </Stack>
    </Grid>
  )
}
