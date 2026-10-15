import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import { stubDndBrowserApis } from '#testing'

stubDndBrowserApis()

afterEach(() => {
  cleanup()
})
