import { contactFixtures } from '#features/contacts/testing/contactFixtures'
import { userFixtures } from '#testing/userFixtures'

export const contactQueries = { list: () => [...contactFixtures, ...userFixtures] }
