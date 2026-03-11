const ALL_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// Default kept for backward-compat; consumers should prefer getOrderedDays()
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/** Maps day name → JS getDay() index (0=Sun … 6=Sat). */
const DAY_TO_JS = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }

/** Returns the ordered days array starting from `startDay`. */
export function getOrderedDays(startDay = 'saturday') {
  const idx = ALL_DAYS.indexOf(startDay)
  if (idx === -1) return DAYS
  return [...ALL_DAYS.slice(idx), ...ALL_DAYS.slice(0, idx)]
}

/** Returns the start of the week containing `date`, where the week begins on `startDay`. */
export function getWeekStart(date = new Date(), startDay = 'saturday') {
  const d = new Date(date)
  const jsDay = d.getDay() // 0=Sun … 6=Sat
  const startJs = DAY_TO_JS[startDay] ?? 1
  const diff = ((jsDay - startJs + 7) % 7)
  d.setDate(d.getDate() - diff)
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
  return ALL_DAYS[new Date(date).getDay()]
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
