// Parity fixtures (§10.11): every layout key and content kind, written in component mode and in
// schema mode. Render-equivalence tests and the "same form twice" stories iterate this list.
import { accordionFixture, stepsFixture, tabsFixture } from '#stories/fixtures/disclosure'
import {
  repeaterCardsFixture,
  repeaterListFixture,
  repeaterTableFixture,
} from '#stories/fixtures/collections'
import { contentFixture, reviewFixture, sentenceFixture, whenFixture } from '#stories/fixtures/flow'
import type { ParityFixture } from '#stories/fixtures/parity'
import {
  actionsFixture,
  asideFixture,
  gridFixture,
  inlineFixture,
  panelsFixture,
  rowsFixture,
  sectionFixture,
  stackFixture,
} from '#stories/fixtures/structure'

export type {
  ParityFixture,
  ParityDefinition,
  FixtureForm,
  FixtureSchema,
} from '#stories/fixtures/parity'
export { defineParity } from '#stories/fixtures/parity'

export const parityFixtures: readonly ParityFixture[] = [
  stackFixture,
  inlineFixture,
  gridFixture,
  sectionFixture,
  asideFixture,
  rowsFixture,
  panelsFixture,
  actionsFixture,
  tabsFixture,
  accordionFixture,
  stepsFixture,
  repeaterListFixture,
  repeaterTableFixture,
  repeaterCardsFixture,
  sentenceFixture,
  reviewFixture,
  whenFixture,
  contentFixture,
]
