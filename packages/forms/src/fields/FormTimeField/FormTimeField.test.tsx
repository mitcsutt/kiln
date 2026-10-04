import { fireEvent } from '@testing-library/react'
import { FormTimeField } from '#fields/FormTimeField'
import { runFieldConformance } from '#test/conformance'

runFieldConformance<string>('time', {
  build: (props) => <FormTimeField {...props} />,
  valid: '14:30',
  invalid: '',
  interact: (_user, control, value) => {
    fireEvent.change(control, { target: { value } })
  },
  viewText: /30/,
})
