import { fireEvent } from '@testing-library/react'
import { FormDateTimeField } from '#components/fields/FormDateTimeField'
import { runFieldConformance } from '#test/conformance'

runFieldConformance<string>('dateTime', {
  build: (props) => <FormDateTimeField {...props} />,
  valid: '2026-06-11T14:30',
  invalid: '',
  interact: (_user, control, value) => {
    fireEvent.change(control, { target: { value } })
  },
  viewText: /2026/,
})
