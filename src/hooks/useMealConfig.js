import { useState, useCallback } from 'react'

const STORAGE_KEY = 'plaited-meal-config'
const DEFAULT_CONFIG = { 'big-cook': 2, 'slow-cooker': 1, 'no-cook': 1 }

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function useMealConfig() {
  const [config, setConfigState] = useState(load)

  const setConfig = useCallback((updates) => {
    setConfigState((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return [config, setConfig]
}
