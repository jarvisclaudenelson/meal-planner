import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMealPlan } from '../hooks/useMealPlan'
import { useRecipes } from '../hooks/useRecipes'
import { useWeekStartDay } from '../hooks/useWeekStartDay'
import { getOrderedDays, getWeekStart, formatDate, addDays, isToday } from '../lib/dates'
import MealSlot from '../components/MealSlot'
import RecipePicker from '../components/RecipePicker'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Plan() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [picker, setPicker] = useState(null) // { day, slot, type } | null
  const [startDay] = useWeekStartDay()
  const days = getOrderedDays(startDay)

  // Week from URL param, default to current week
  const weekParam = searchParams.get('week')
  const weekStart = weekParam ?? formatDate(getWeekStart(new Date(), startDay))

  function setWeek(date) {
    setSearchParams({ week: formatDate(date) })
  }

  function prevWeek() {
    setWeek(addDays(weekStart, -7))
  }

  function nextWeek() {
    setWeek(addDays(weekStart, 7))
  }

  const { plan, loading, setMeal, clearMeal } = useMealPlan(weekStart)
  const { allRecipes } = useRecipes()

  async function handleSelect(recipe) {
    if (!picker) return
    await setMeal(picker.day, picker.slot, recipe.id, picker.type)
    setPicker(null)
  }

  // Week range label: "Feb 24 – Mar 2"
  const weekEnd = addDays(weekStart, 6)
  const rangeLabel = `${formatDate(weekStart, 'MMM D')} – ${formatDate(weekEnd, 'MMM D')}`

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Meal Plan</h1>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between px-4 pb-3">
          <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className="font-semibold text-gray-700 text-sm">{rangeLabel}</span>
          <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="p-4 space-y-3">
          {days.map((day, i) => {
            const date = addDays(weekStart, i)
            const today = isToday(date)
            const slotData = plan[`${day}-dinner`] ?? { main: null, side: null }
            const dinner = slotData.main
            const side = slotData.side
            const lunchData = plan[`${day}-lunch`] ?? { main: null, side: null }
            const lunch = lunchData.main

            return (
              <div
                key={day}
                className={`bg-white rounded-xl border p-4 shadow-sm ${
                  today ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-100'
                }`}
              >
                {/* Day header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-gray-800 capitalize">{day}</span>
                  <span className="text-xs text-gray-400">{formatDate(date, 'MMM D')}</span>
                  {today && (
                    <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Dinner Main slot (primary) */}
                  <MealSlot
                    recipe={dinner}
                    label="Dinner Main"
                    primary
                    onTap={() => {
                      if (dinner) navigate(`/recipes/${dinner.id}`)
                      else setPicker({ day, slot: 'dinner', type: 'main' })
                    }}
                    onClear={() => clearMeal(day, 'dinner', 'main')}
                  />

                  {/* Dinner Side slot (secondary) */}
                  <MealSlot
                    recipe={side}
                    label="Veggie Side"
                    primary={false}
                    onTap={() => {
                      if (side) navigate(`/recipes/${side.id}`)
                      else setPicker({ day, slot: 'dinner', type: 'side' })
                    }}
                    onClear={() => clearMeal(day, 'dinner', 'side')}
                  />
                </div>

                {/* Lunch slot (tertiary) */}
                <div className="mt-4 pt-3 border-t border-gray-50">
                  <MealSlot
                    recipe={lunch}
                    label="Lunch"
                    primary={false}
                    onTap={() => {
                      if (lunch) navigate(`/recipes/${lunch.id}`)
                      else setPicker({ day, slot: 'lunch', type: 'main' })
                    }}
                    onClear={() => clearMeal(day, 'lunch', 'main')}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RecipePicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={handleSelect}
        recipes={allRecipes}
        filter={picker?.type === 'side' ? 'side' : null}
      />
    </div>
  )
}
