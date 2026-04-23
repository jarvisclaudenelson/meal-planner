import { useState, useCallback } from 'react'
import { getCurrentWeekStart, getWeekNumber, shiftWeek } from '../lib/weekNav.js'

/**
 * Returns a shared app-wide week number (1-based) and the underlying week_start date.
 * Week numbers are intentionally global instead of browser-local so every device agrees.
 */
export function useWeekNav() {
  const currentWeekStart = getCurrentWeekStart()
  const [weekStart, setWeekStart] = useState(currentWeekStart)

  const weekNumber = getWeekNumber(weekStart)

  const prevWeek = useCallback(() => {
    setWeekStart((prev) => shiftWeek(prev, -1))
  }, [])

  const nextWeek = useCallback(() => {
    setWeekStart((prev) => shiftWeek(prev, 1))
  }, [])

  return { weekStart, weekNumber, prevWeek, nextWeek }
}
