import { createContext } from 'react'
import type { AvatarSize } from './avatarUtils'

/** Lets `AvatarGroup` size its children without repeating the prop. */
export const AvatarSizeContext = createContext<AvatarSize | undefined>(undefined)
