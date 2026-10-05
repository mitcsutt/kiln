import { fireEvent } from '@testing-library/react'
import { FormDateField } from '#components/fields/FormDateField'
import { runFieldConformance } from '#test/conformance'

runFieldConformance<string>('date', {
  build: (props) => <FormDateField {...props} />,
  valid: '2026-06-11',
  invalid: '',
  interact: (_user, control, value) => {
    fireEvent.change(control, { target: { value } })
  },
  viewText: /2026/,
})
