import test from 'node:test'
import assert from 'node:assert/strict'

import {
  APP_WEEK_EPOCH,
  APP_WEEK_START_DAY,
  getCurrentWeekStart,
  getWeekNumber,
} from '../src/lib/weekNav.js'

test('uses a shared Saturday epoch so the week after French Dip Sliders week is Week 5', () => {
  assert.equal(APP_WEEK_START_DAY, 'saturday')
  assert.equal(APP_WEEK_EPOCH, '2026-03-28')
  assert.equal(getWeekNumber('2026-04-18'), 4)
  assert.equal(getWeekNumber('2026-04-25'), 5)
})

test('computes the current week start from the shared Saturday boundary', () => {
  assert.equal(getCurrentWeekStart(new Date('2026-04-23T12:00:00')), '2026-04-18')
})
