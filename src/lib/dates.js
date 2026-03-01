const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/** Returns Monday of the week containing `date`. Result is midnight local time. */
export function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const jsDay = d.getDay() // 0=Sun … 6=Sat
  const diff = jsDay === 0 ? -6 : 1 - jsDay
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Formats a Date (or date string) as `YYYY-MM-DD` or `MMM D`. */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  if (format === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`
  if (format === 'MMM D') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[d.getMonth()]} ${d.getDate()}`
  }
  return `${yyyy}-${mm}-${dd}`
}

/** Adds `n` days to a Date and returns the new Date. */
export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

/** Returns the lowercase day name for a Date (e.g. 'monday'). */
export function getDayOfWeek(date) {
  const jsDay = new Date(date).getDay()
  return DAYS[jsDay === 0 ? 6 : jsDay - 1]
}

/** Returns true if a Date is today (local time). */
export function isToday(date) {
  const today = new Date()
  const d = new Date(date)
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

export { DAYS }
