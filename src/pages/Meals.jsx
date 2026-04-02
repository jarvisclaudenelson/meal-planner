import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, RefreshCw, Flame, Timer, Salad, X, Clock, Settings, Plus, Minus } from 'lucide-react'
import { useMealPlan, MEAL_TYPES, buildPositions, getColorForPosition } from '../hooks/useMealPlan'
import { useMealConfig } from '../hooks/useMealConfig'
import { useRecipes } from '../hooks/useRecipes'
import { useWeekNav } from '../hooks/useWeekNav'
import RecipePicker from '../components/RecipePicker'
import LoadingSpinner from '../components/LoadingSpinner'

const TYPE_ICONS = {
  'big-cook': Flame,
  'slow-cooker': Timer,
  'no-cook': Salad,
}

export default function Meals() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [picker, setPicker] = useState(null)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useMealConfig()
  const { weekStart, weekNumber, prevWeek, nextWeek } = useWeekNav()

  const positions = buildPositions(config)

  const { plan, loading, setMeal, clearMeal } = useMealPlan(weekStart)
  const { allRecipes } = useRecipes()

  async function handleSelect(recipe) {
    if (!picker) return
    await setMeal(picker.position, recipe.id)
    setPicker(null)
  }

  function getFilterTag() {
    if (!picker) return null
    const pos = positions.find(p => p.key === picker.position)
    return pos?.type ?? null
  }

  const totalMeals = positions.length

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">This Week's Meals</h1>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-xl transition-colors ${showConfig ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Config editor */}
        {showConfig && (
          <div className="px-4 pb-3 border-t border-gray-50 pt-3 space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Meals per week</p>
            {MEAL_TYPES.map(({ type, label }) => {
              const Icon = TYPE_ICONS[type]
              const count = config[type] ?? 0
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon size={14} className="text-gray-500" />}
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfig({ [type]: Math.max(0, count - 1) })}
                      disabled={count === 0}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-gray-800">{count}</span>
                    <button
                      onClick={() => setConfig({ [type]: Math.min(5, count + 1) })}
                      disabled={count >= 5}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
            <p className="text-xs text-gray-400 pt-1">{totalMeals} meal{totalMeals !== 1 ? 's' : ''} this week</p>
          </div>
        )}

        {/* Week navigation */}
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
      ) : positions.length === 0 ? (
        <div className="text-center py-16 px-8 text-gray-400">
          <p className="text-lg font-medium">No meals configured</p>
          <p className="text-sm mt-1">Tap the gear icon to set how many meals you want this week.</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {positions.map((pos) => {
            const slot = plan[pos.key] ?? { recipe: null, sides: [] }
            const recipe = slot.recipe
            const colors = getColorForPosition(positions, pos.key)
            const Icon = TYPE_ICONS[pos.type]
            const sideCount = slot.sides?.length ?? 0

            return (
              <div
                key={pos.key}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden ${colors.border}`}
              >
                {/* Color bar + label */}
                <div className={`flex items-center gap-2 px-4 py-2.5 ${colors.bg}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  {Icon && <Icon size={15} className={colors.text} />}
                  <span className={`text-sm font-semibold ${colors.text}`}>{pos.label}</span>
                  {sideCount > 0 && (
                    <span className={`ml-auto text-xs ${colors.text} opacity-70`}>
                      {sideCount} side{sideCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Meal content */}
                <div className="p-4">
                  {recipe ? (
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                      >
                        <p className="font-medium text-gray-900 text-sm truncate">{recipe.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {recipe.total_time_min != null && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={10} />
                              {recipe.total_time_min} min
                            </span>
                          )}
                          {recipe.servings && (
                            <span className="text-xs text-gray-400">{recipe.servings} servings</span>
                          )}
                          {recipe.protein_g != null && (
                            <span className="text-xs text-emerald-600">{Math.round(recipe.protein_g)}g protein</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPicker({ position: pos.key, type: pos.type })}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          title="Swap recipe"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={() => clearMeal(pos.key)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPicker({ position: pos.key, type: pos.type })}
                      className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:text-gray-500 text-sm font-medium transition-colors"
                    >
                      + Pick a {pos.label.toLowerCase()} recipe
                    </button>
                  )}
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
        filter={getFilterTag()}
      />
    </div>
  )
}
