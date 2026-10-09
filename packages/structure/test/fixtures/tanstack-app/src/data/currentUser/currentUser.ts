import { queryStaleTimes } from '#constants/queryStaleTimes'
import type { ApiError } from '#types/ApiError'

export const currentUserQuery = { staleTime: queryStaleTimes.short }
export type CurrentUserError = ApiError
