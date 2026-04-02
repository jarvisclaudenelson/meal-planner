import { useNavigate } from 'react-router-dom'
import { Search, Star, Zap, Dumbbell, Baby, ArrowUpDown, UtensilsCrossed, Salad, Flame, Timer, Leaf } from 'lucide-react'
import { useRecipes } from '../hooks/useRecipes'
import RecipeCard from '../components/RecipeCard'
import LoadingSpinner from '../components/LoadingSpinner'

const FILTER_CHIPS = [
  { key: 'mealsOnly', label: 'Meals', icon: UtensilsCrossed },
  { key: 'sidesOnly', label: 'Sides', icon: Salad },
  { key: 'bigCook', label: 'Big Cook', icon: Flame },
  { key: 'slowCooker', label: 'Slow Cooker', icon: Timer },
  { key: 'noCook', label: 'No Cook', icon: Leaf },
  { key: 'starred', label: 'Starred', icon: Star },
  { key: 'quickOnly', label: 'Quick (<30 min)', icon: Zap },
  { key: 'highProtein', label: 'High Protein', icon: Dumbbell },
  { key: 'kidFriendly', label: 'Kid-Friendly', icon: Baby },
]

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'protein', label: 'Protein' },
  { value: 'time', label: 'Time' },
]

export default function Recipes() {
  const navigate = useNavigate()
  const {
    recipes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sort,
    setSort,
    toggleStar,
  } = useRecipes()

  const TYPE_KEYS = ['mealsOnly', 'sidesOnly', 'bigCook', 'slowCooker', 'noCook']

  function toggleFilter(key) {
    setFilters((prev) => {
      // Type filters are mutually exclusive
      if (TYPE_KEYS.includes(key)) {
        const cleared = {}
        for (const k of TYPE_KEYS) cleared[k] = false
        return { ...prev, ...cleared, [key]: !prev[key] }
      }
      return { ...prev, [key]: !prev[key] }
    })
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400">
        <p className="font-medium">Failed to load recipes</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-gray-100">Recipes</h1>

          {/* Search */}
          <div className="relative mt-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search recipes…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-700 rounded-xl text-sm text-gray-100 outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-none">
            {FILTER_CHIPS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filters[key]
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}

            {/* Sort */}
            <div className="shrink-0 relative ml-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 rounded-full text-xs font-medium text-gray-300">
                <ArrowUpDown size={12} />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-gray-300"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium">No recipes found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onToggleStar={toggleStar}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
