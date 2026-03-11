import { useState, useEffect } from 'react'

const STORAGE_KEY = 'weekStartDay'
const DEFAULT = 'saturday'

/**
 * Stores and retrieves the user's preferred week-start day.
 * Returns [startDay, setStartDay] — same API as useState.
 */
export function useWeekStartDay() {
  const [startDay, setStartDay] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, startDay)
  }, [startDay])

  return [startDay, setStartDay]
}
