export const MEAL_TYPES = [
  { type: 'big-cook', label: 'Big Cook' },
  { type: 'slow-cooker', label: 'Slow Cooker' },
  { type: 'griddle', label: 'Griddle' },
  { type: 'no-cook', label: 'No Cook / Assemble' },
]

const MAX_MEALS_PER_TYPE = 5
export const MEAL_CONFIG_VERSION = 2

export function getDefaultMealConfig() {
  return {
    'big-cook': 2,
    'slow-cooker': 1,
    griddle: 1,
    'no-cook': 1,
    version: MEAL_CONFIG_VERSION,
  }
}

function normalizeCount(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(MAX_MEALS_PER_TYPE, Math.max(0, Math.trunc(number)))
}

export function normalizeMealConfig(savedConfig) {
  const defaults = getDefaultMealConfig()
  if (!savedConfig || typeof savedConfig !== 'object') return defaults

  const config = { ...defaults }
  for (const { type } of MEAL_TYPES) {
    if (Object.prototype.hasOwnProperty.call(savedConfig, type)) {
      config[type] = normalizeCount(savedConfig[type])
    }
  }

  // Version 1 could hide one appliance slot. Upgrade once so both are visible;
  // version 2 settings still respect a deliberate zero count.
  const savedVersion = Number(savedConfig.version)
  if (!Number.isFinite(savedVersion) || savedVersion < MEAL_CONFIG_VERSION) {
    config['slow-cooker'] = Math.max(1, config['slow-cooker'])
    config.griddle = Math.max(1, config.griddle)
  }
  config.version = MEAL_CONFIG_VERSION

  return config
}

export function applyMealConfigUpdates(config, updates) {
  const next = { ...config }
  for (const [type, count] of Object.entries(updates)) {
    next[type] = normalizeCount(count)
  }

  return next
}

/** Build weekly positions from a meal config. */
export function buildPositions(config) {
  const positions = []
  for (const { type, label } of MEAL_TYPES) {
    const count = normalizeCount(config[type])
    for (let i = 1; i <= count; i++) {
      positions.push({ key: `${type}-${i}`, label, type })
    }
  }
  return positions
}
