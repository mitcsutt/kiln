---
'@mitcsutt/kiln-forms': none
---

Add `useTypedAppFormContext(options)`, which returns the form from the nearest `<Form>` or `<form.AppForm>` typed against the values of the shared `formOptions`, so a component nested at any depth can render bound fields and read values without a `form` prop. `useFormContext` and the new hook now throw an error that names `<Form>` and `<form.AppForm>` when used outside a form. The package hasn't been released, so this changeset bumps nothing.
