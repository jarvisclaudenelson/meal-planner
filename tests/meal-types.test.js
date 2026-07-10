import test from 'node:test'
import assert from 'node:assert/strict'

import {
  MEAL_TYPES,
  applyMealConfigUpdates,
  buildPositions,
  getDefaultMealConfig,
  normalizeMealConfig,
} from '../src/lib/mealTypes.js'

test('keeps both appliance categories available with the same defaults all year', () => {
  const expected = {
    'big-cook': 2,
    'slow-cooker': 1,
    griddle: 0,
    'no-cook': 1,
  }

  assert.deepEqual(getDefaultMealConfig(new Date(2026, 0, 10)), expected)
  assert.deepEqual(getDefaultMealConfig(new Date(2026, 6, 10)), expected)
})

test('adds griddle to legacy settings without changing the slow-cooker count', () => {
  const saved = { 'big-cook': 2, 'slow-cooker': 3, 'no-cook': 1 }
  const expected = { ...saved, griddle: 0 }

  assert.deepEqual(normalizeMealConfig(saved, new Date(2026, 0, 10)), expected)
  assert.deepEqual(normalizeMealConfig(saved, new Date(2026, 6, 10)), expected)
})

test('allows slow-cooker and griddle counts to be enabled together', () => {
  const updated = applyMealConfigUpdates(getDefaultMealConfig(), {
    'slow-cooker': 1,
    griddle: 2,
  })

  assert.equal(updated['slow-cooker'], 1)
  assert.equal(updated.griddle, 2)
})

test('builds distinct stored positions for slow cooker and griddle', () => {
  const config = {
    'big-cook': 2,
    'slow-cooker': 1,
    griddle: 1,
    'no-cook': 1,
  }
  const positions = buildPositions(config)

  assert.deepEqual(
    positions.map(({ key, type, label }) => ({ key, type, label })),
    [
      { key: 'big-cook-1', type: 'big-cook', label: 'Big Cook' },
      { key: 'big-cook-2', type: 'big-cook', label: 'Big Cook' },
      { key: 'slow-cooker-1', type: 'slow-cooker', label: 'Slow Cooker' },
      { key: 'griddle-1', type: 'griddle', label: 'Griddle' },
      { key: 'no-cook-1', type: 'no-cook', label: 'No Cook / Assemble' },
    ],
  )
})

test('lists griddle as a first-class meal and recipe type', () => {
  assert.ok(MEAL_TYPES.some(({ type, label }) => type === 'griddle' && label === 'Griddle'))
})
