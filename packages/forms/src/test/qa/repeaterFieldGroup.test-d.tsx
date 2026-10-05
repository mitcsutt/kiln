/**
 * Type test: typed item shorthand inside a Repeater whose `form` is a `withFieldGroup` group.
 * `RegistryOf` reads a group's registry from its `AppField` field components, so
 * `item.fields.TextField` is a typed bound component (and wrong paths still fail).
 */
import { kit } from '#kit/defaultKit'
import { Repeater } from '#components/layouts/Repeater'

interface Guest {
  name: string
  diet: string
}

export const Party = kit.withFieldGroup({
  defaultValues: { host: '', guests: [] as Guest[] },
  render: function Party({ group }) {
    return (
      <Repeater form={group} name="guests" label="Guests" newItem={{ name: '', diet: '' }}>
        {(item) => (
          <>
            <item.fields.TextField name="name" label="Name" />
            {/* @ts-expect-error a path that isn't on the item */}
            <item.fields.TextField name="nope" label="Nope" />
          </>
        )}
      </Repeater>
    )
  },
})
