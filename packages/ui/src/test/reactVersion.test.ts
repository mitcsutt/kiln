import { version } from 'react'
import { version as domVersion } from 'react-dom'

// Each Vitest config declares the React major it runs against (ADR 0004). If an alias
// stops applying, this fails instead of the React 18 pass silently testing React 19.
describe('React under test', () => {
  it('is the major this pass declares', () => {
    const expected = process.env.KILN_REACT_MAJOR
    expect(expected).toBeDefined()
    expect(version.split('.')[0]).toBe(expected)
    expect(domVersion.split('.')[0]).toBe(expected)
  })
})
