import test from 'node:test'
import assert from 'node:assert/strict'

import {
  MEAL_TYPES,
  applyMealConfigUpdates,
  buildPositions,
  getDefaultMealConfig,
  normalizeMealConfig,
} from '../src/lib/mealTypes.js'

test('uses a griddle appliance slot instead of slow cooker during summer', () => {
  const config = getDefaultMealConfig(new Date(2026, 6, 10))

  assert.deepEqual(config, {
    'big-cook': 2,
    'slow-cooker': 0,
    griddle: 1,
    'no-cook': 1,
  })
})

test('uses a slow-cooker appliance slot outside summer', () => {
  const config = getDefaultMealConfig(new Date(2026, 0, 10))

  assert.equal(config['slow-cooker'], 1)
  assert.equal(config.griddle, 0)
})

test('migrates the legacy slow-cooker slot to griddle during summer', () => {
  const config = normalizeMealConfig(
    { 'big-cook': 2, 'slow-cooker': 1, 'no-cook': 1 },
    new Date(2026, 6, 10),
  )

  assert.equal(config['slow-cooker'], 0)
  assert.equal(config.griddle, 1)
})

test('preserves a custom legacy appliance count when migrating to griddle', () => {
  const config = normalizeMealConfig(
    { 'big-cook': 2, 'slow-cooker': 3, 'no-cook': 1 },
    new Date(2026, 6, 10),
  )

  assert.equal(config['slow-cooker'], 0)
  assert.equal(config.griddle, 3)
})

test('preserves a disabled legacy appliance slot during summer migration', () => {
  const config = normalizeMealConfig(
    { 'big-cook': 2, 'slow-cooker': 0, 'no-cook': 1 },
    new Date(2026, 6, 10),
  )

  assert.equal(config['slow-cooker'], 0)
  assert.equal(config.griddle, 0)
})

test('uses June through August as the summer boundary', () => {
  assert.equal(getDefaultMealConfig(new Date(2026, 4, 31)).griddle, 0)
  assert.equal(getDefaultMealConfig(new Date(2026, 5, 1)).griddle, 1)
  assert.equal(getDefaultMealConfig(new Date(2026, 7, 31)).griddle, 1)
  assert.equal(getDefaultMealConfig(new Date(2026, 8, 1)).griddle, 0)
})

test('migrates a summer griddle count back to slow cooker outside summer', () => {
  const config = normalizeMealConfig(
    { 'big-cook': 2, 'slow-cooker': 0, griddle: 3, 'no-cook': 1 },
    new Date(2026, 0, 10),
  )

  assert.equal(config['slow-cooker'], 3)
  assert.equal(config.griddle, 0)
})

test('keeps slow-cooker and griddle counts mutually exclusive', () => {
  const summerConfig = getDefaultMealConfig(new Date(2026, 6, 10))
  const updated = applyMealConfigUpdates(summerConfig, { 'slow-cooker': 1 })

  assert.equal(updated['slow-cooker'], 1)
  assert.equal(updated.griddle, 0)
})

test('builds a griddle recipe slot using the existing appliance storage position', () => {
  const config = getDefaultMealConfig(new Date(2026, 6, 10))
  const positions = buildPositions(config)

  assert.deepEqual(
    positions.map(({ key, type, label }) => ({ key, type, label })),
    [
      { key: 'big-cook-1', type: 'big-cook', label: 'Big Cook' },
      { key: 'big-cook-2', type: 'big-cook', label: 'Big Cook' },
      { key: 'slow-cooker-1', type: 'griddle', label: 'Griddle' },
      { key: 'no-cook-1', type: 'no-cook', label: 'No Cook / Assemble' },
    ],
  )
})

test('lists griddle as a first-class meal and recipe type', () => {
  assert.ok(MEAL_TYPES.some(({ type, label }) => type === 'griddle' && label === 'Griddle'))
})
