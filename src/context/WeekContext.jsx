import { createContext, useContext } from 'react'
import { useWeekNav } from '../hooks/useWeekNav'

const WeekContext = createContext(null)

export function WeekProvider({ children }) {
  const week = useWeekNav()
  return <WeekContext.Provider value={week}>{children}</WeekContext.Provider>
}

export function useWeek() {
  const ctx = useContext(WeekContext)
  if (!ctx) throw new Error('useWeek must be used within WeekProvider')
  return ctx
}
