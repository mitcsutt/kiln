import { currentUserQuery } from '#data/currentUser'
import { env } from '#config/env'
import type { Contact } from '#features/contacts/types/Contact'

export const contactQueries = {
  list: () => [] as Contact[],
  url: env.apiUrl,
  staleTime: currentUserQuery.staleTime,
}
