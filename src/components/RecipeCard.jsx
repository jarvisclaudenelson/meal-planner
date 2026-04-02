import { Star, Clock, Users, UtensilsCrossed, Salad } from 'lucide-react'
import ProteinBadge from './ProteinBadge'

export default function RecipeCard({ recipe, onToggleStar, onClick, compact = false }) {
  const tags = recipe.tags ?? []
  const isSide = tags.includes('side')

  function handleStarClick(e) {
    e.stopPropagation()
    onToggleStar?.(recipe.id, recipe.starred)
  }

  return (
    <div
      onClick={() => onClick?.(recipe)}
      className={`bg-gray-800 rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] transition-transform ${
        isSide ? 'border-teal-700' : 'border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Meal/Side type badge */}
            {isSide ? (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-teal-900/50 text-teal-300 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                <Salad size={10} />
                Side
              </span>
            ) : (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-900/50 text-indigo-300 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                <UtensilsCrossed size={10} />
                Meal
              </span>
            )}
            <h3 className="font-semibold text-gray-100 leading-tight truncate">{recipe.name}</h3>
          </div>
          {!compact && recipe.description && (
            <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{recipe.description}</p>
          )}
        </div>
        {onToggleStar && (
          <button
            onClick={handleStarClick}
            className="shrink-0 p-1 -mr-1 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label={recipe.starred ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              size={18}
              className={recipe.starred ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}
            />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {recipe.total_time_min != null && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} />
            {recipe.total_time_min} min
          </span>
        )}
        {recipe.servings && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Users size={12} />
            {recipe.servings} srv
          </span>
        )}
        <ProteinBadge proteinG={recipe.protein_g} proteinRatio={recipe.protein_ratio} />
        {tags.filter(t => !['side', 'big-cook', 'slow-cooker', 'no-cook'].includes(t)).slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
