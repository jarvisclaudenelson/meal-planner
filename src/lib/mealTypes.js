export const MEAL_TYPES = [
  { type: 'big-cook', label: 'Big Cook' },
  { type: 'slow-cooker', label: 'Slow Cooker' },
  // Griddle replaces the slow-cooker appliance slot in summer. Reusing the
  // storage type keeps existing Supabase position constraints compatible.
  { type: 'griddle', label: 'Griddle', storageType: 'slow-cooker' },
  { type: 'no-cook', label: 'No Cook / Assemble' },
]

const MAX_MEALS_PER_TYPE = 5

export function isSummer(date = new Date()) {
  const month = date.getMonth()
  return month >= 5 && month <= 7
}

export function getDefaultMealConfig(date = new Date()) {
  const summer = isSummer(date)
  return {
    'big-cook': 2,
    'slow-cooker': summer ? 0 : 1,
    griddle: summer ? 1 : 0,
    'no-cook': 1,
  }
}

function normalizeCount(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(MAX_MEALS_PER_TYPE, Math.max(0, Math.trunc(number)))
}

export function normalizeMealConfig(savedConfig, date = new Date()) {
  const defaults = getDefaultMealConfig(date)
  if (!savedConfig || typeof savedConfig !== 'object') return defaults

  const config = { ...defaults }
  for (const { type } of MEAL_TYPES) {
    if (Object.prototype.hasOwnProperty.call(savedConfig, type)) {
      config[type] = normalizeCount(savedConfig[type])
    }
  }

  // Slow cooker and griddle represent one appliance-centered weekly slot.
  // Migrate existing configurations automatically as the season changes.
  if (isSummer(date)) {
    const hasSlowCooker = Object.prototype.hasOwnProperty.call(savedConfig, 'slow-cooker')
    const hasGriddle = Object.prototype.hasOwnProperty.call(savedConfig, 'griddle')

    if (hasSlowCooker && !hasGriddle) {
      config.griddle = config['slow-cooker']
      config['slow-cooker'] = 0
    } else if (config.griddle === 0 && config['slow-cooker'] > 0) {
      config.griddle = config['slow-cooker']
      config['slow-cooker'] = 0
    } else if (config.griddle > 0 && config['slow-cooker'] > 0) {
      config['slow-cooker'] = 0
    }
  } else if (config['slow-cooker'] === 0 && config.griddle > 0) {
    config['slow-cooker'] = config.griddle
    config.griddle = 0
  } else if (config['slow-cooker'] > 0 && config.griddle > 0) {
    config.griddle = 0
  }

  return config
}

export function applyMealConfigUpdates(config, updates) {
  const next = { ...config }
  for (const [type, count] of Object.entries(updates)) {
    next[type] = normalizeCount(count)
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'griddle') && next.griddle > 0) {
    next['slow-cooker'] = 0
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'slow-cooker') && next['slow-cooker'] > 0) {
    next.griddle = 0
  }

  return next
}

/** Build weekly positions from a meal config. */
export function buildPositions(config) {
  const positions = []
  for (const { type, label, storageType = type } of MEAL_TYPES) {
    const count = normalizeCount(config[type])
    for (let i = 1; i <= count; i++) {
      positions.push({ key: `${storageType}-${i}`, label, type })
    }
  }
  return positions
}
