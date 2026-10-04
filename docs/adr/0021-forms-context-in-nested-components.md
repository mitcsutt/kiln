# 0021. Reading a `kiln-forms` form from context in nested components

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

Forms are often split across components nested several levels deep: layout components that pass children through, sections that render fields, summaries that read values, footers that read status. `kiln-forms` already put the form in React context: `<Form form={form}>` and `<form.AppForm>` both provide it, and `useFormStatus()`, `SubmitButton`, `ErrorSummary` and the layouts read it from there. The only public way for an app's own component to read it was `useFormContext()`, which is TanStack's untyped hook. It returns a form whose values are `Record<string, never>`, without the kit's typed `form.<Kind>Field` shorthand, and outside a form it throws an error about TanStack's `formComponent`, which a kiln-forms user never writes.

The typed alternatives both pass the form down as a prop: `withForm` for a section and `withFieldGroup` for a reusable set of fields. Neither helps a component three levels below the form without threading `form` through every component in between.

TanStack Form 1.33 has a typed context hook, `useTypedAppFormContext(formOptions)`, on the object `createFormHook` returns. The kit didn't expose it, and TanStack's version types the form without the kit's shorthand fields.

## Decision

- **The kit exposes `useTypedAppFormContext(options)`**, with TanStack's name and calling convention, as `kit.useTypedAppFormContext` and a named export of the default kit. It returns the form from the nearest `<Form>` or `<form.AppForm>` as a `KitForm<T, M, R>`. `T` and `M` are inferred from the options, and `R` is the kit's field registry, so `form.TextField name="…"` is checked against the values the same way it is on the form `useAppForm` returns.
- **The options carry the type, not runtime behaviour.** Context can't carry a type, and an explicit `useTypedAppFormContext<Values>()` would be an unchecked cast that's easy to get wrong. Taking the shared `formOptions` object, which the docs already teach for `withForm`, ties the nested component's type to the object the form was made from. Like `withForm`, it trusts that the form in context was made from those options.
- **Only the type is restored.** `useAppForm` assigns the shorthand fields and the view-mode-aware `AppField` to the TanStack form object itself, and both providers put that same object in context. The hook doesn't wrap or rebind anything, so view mode, `FieldPresentation` and every field behave as they do on the form returned by `useAppForm`.
- **`useFormContext` keeps its type and gets a clear error.** It stays the untyped hook for code that works with any form, like a custom layout. Outside a form, it and `useTypedAppFormContext` throw `No form in context: render this component inside <Form form={form}> or <form.AppForm>.`
- **No other new API.** `useFieldValue(form, name)`, `useFormStatus()`, `form.Subscribe` and `useSelector` already cover reading values and state, so the docs show them with the typed form instead of adding context-only variants.

## Consequences

- A component at any depth can render bound fields, read values and subscribe to state with typed paths, as long as the app shares its options through `formOptions`. Tests cover a field and value and status readers three components below `<Form>` and `<form.AppForm>`, in view mode and outside a form. Type tests cover typed values, submit meta, path errors and the required options.
- A component that reads the form from context with the wrong options type-checks against the wrong values. This is the same trust `withForm` asks for, and the docs recommend one shared options object per form.
- A form made without a kit, from plain TanStack, has no shorthand fields at runtime even though the type says it does. Kit forms are the only ones the package documents.
- The docs gain Forms › Getting started › Form context, and the `component-mode` skill ships it as a reference.
