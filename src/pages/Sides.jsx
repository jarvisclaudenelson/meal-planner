import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react'
import { useMealPlan, buildPositions, getColorForPosition } from '../hooks/useMealPlan'
import { useMealConfig } from '../hooks/useMealConfig'
import { useRecipes } from '../hooks/useRecipes'
import { useWeekNav } from '../hooks/useWeekNav'
import RecipePicker from '../components/RecipePicker'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Sides() {
  const navigate = useNavigate()
  const [picker, setPicker] = useState(null)
  const [config] = useMealConfig()
  const { weekStart, weekNumber, prevWeek, nextWeek } = useWeekNav()

  const positions = buildPositions(config)

  const { plan, loading, addSide, removeSide } = useMealPlan(weekStart)
  const { allRecipes } = useRecipes()

  async function handleSelect(recipe) {
    if (!picker) return
    await addSide(picker, recipe.id)
    setPicker(null)
  }

  const filledPositions = positions.filter(pos => plan[pos.key]?.recipe)

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Sides</h1>
        </div>

        <div className="flex items-center justify-between px-4 pb-3">
          <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className="font-semibold text-gray-700 text-sm">Week {weekNumber}</span>
          <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filledPositions.length === 0 ? (
        <div className="text-center py-16 px-8 text-gray-400">
          <p className="text-lg font-medium">No meals picked yet</p>
          <p className="text-sm mt-1">Head to the Meals tab to pick this week's recipes first.</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {filledPositions.map((pos) => {
            const slot = plan[pos.key] ?? { recipe: null, sides: [] }
            const colors = getColorForPosition(positions, pos.key)
            const sides = slot.sides ?? []

            return (
              <div key={pos.key} className="space-y-2">
                {/* Meal header — color coded */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {slot.recipe?.name ?? pos.label}
                  </span>
                </div>

                {/* Sides for this meal */}
                <div className="space-y-1.5 pl-2">
                  {sides.map((side) => (
                    <div
                      key={side.id}
                      className={`flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg border ${colors.border} ring-1 ${colors.ring}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`} />
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/recipes/${side.id}`)}
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">{side.name}</p>
                        {side.total_time_min != null && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Clock size={10} />
                            {side.total_time_min} min
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeSide(pos.key, side.id)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Add side button */}
                  <button
                    onClick={() => setPicker(pos.key)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 border-2 border-dashed rounded-lg text-sm font-medium transition-colors ${colors.border} ${colors.text}`}
                  >
                    <Plus size={14} />
                    Add side for {slot.recipe?.name ?? pos.label}
                  </button>
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
        filter="side"
      />
    </div>
  )
}
