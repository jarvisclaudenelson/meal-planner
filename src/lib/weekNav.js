import { addDays, formatDate, getWeekStart, parseLocalDate } from './dates.js'

// Shared app-wide week numbering.
// Week 1 starts on the first Saturday-backed meal-planner week we want every device to agree on.
// This makes the week after the French Dip Sliders / Ground Turkey Taco Bowls / Honey Garlic Chicken week
// (2026-04-18) show as Week 5 on every device.
export const APP_WEEK_START_DAY = 'saturday'
export const APP_WEEK_EPOCH = '2026-03-28'

export function weeksBetween(dateA, dateB) {
  const a = parseLocalDate(dateA)
  const b = parseLocalDate(dateB)
  return Math.round((b - a) / (7 * 24 * 60 * 60 * 1000))
}

export function getCurrentWeekStart(today = new Date()) {
  return formatDate(getWeekStart(today, APP_WEEK_START_DAY))
}

export function getWeekNumber(weekStart, epoch = APP_WEEK_EPOCH) {
  return weeksBetween(epoch, weekStart) + 1
}

export function shiftWeek(weekStart, deltaWeeks) {
  return formatDate(addDays(weekStart, deltaWeeks * 7))
}
