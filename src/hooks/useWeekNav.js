import { useState, useCallback } from 'react'
import { useWeekStartDay } from './useWeekStartDay'
import { getWeekStart, formatDate, addDays } from '../lib/dates'

const EPOCH_KEY = 'plaited-week-epoch'

function getEpoch(startDay) {
  const stored = localStorage.getItem(EPOCH_KEY)
  if (stored) return stored
  // First use — set epoch to current week
  const epoch = formatDate(getWeekStart(new Date(), startDay))
  localStorage.setItem(EPOCH_KEY, epoch)
  return epoch
}

function weeksBetween(dateA, dateB) {
  const a = new Date(dateA)
  const b = new Date(dateB)
  return Math.round((b - a) / (7 * 24 * 60 * 60 * 1000))
}

/**
 * Returns a week number (1-based) and the underlying week_start date.
 * Week 1 = the first week the user used the app.
 * Replaces date-based URL params with a simple counter.
 */
export function useWeekNav() {
  const [startDay] = useWeekStartDay()
  const epoch = getEpoch(startDay)
  const currentWeekStart = formatDate(getWeekStart(new Date(), startDay))
  const [weekStart, setWeekStart] = useState(currentWeekStart)

  const weekNumber = weeksBetween(epoch, weekStart) + 1

  const prevWeek = useCallback(() => {
    setWeekStart((prev) => formatDate(addDays(prev, -7)))
  }, [])

  const nextWeek = useCallback(() => {
    setWeekStart((prev) => formatDate(addDays(prev, 7)))
  }, [])

  return { weekStart, weekNumber, prevWeek, nextWeek }
}
