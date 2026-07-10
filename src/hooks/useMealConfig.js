import { useState, useCallback } from 'react'
import { applyMealConfigUpdates, getDefaultMealConfig, normalizeMealConfig } from '../lib/mealTypes'

const STORAGE_KEY = 'plaited-meal-config'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultMealConfig()
    return normalizeMealConfig(JSON.parse(raw))
  } catch {
    return getDefaultMealConfig()
  }
}

export function useMealConfig() {
  const [config, setConfigState] = useState(load)

  const setConfig = useCallback((updates) => {
    setConfigState((prev) => {
      const next = applyMealConfigUpdates(prev, updates)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return [config, setConfig]
}
