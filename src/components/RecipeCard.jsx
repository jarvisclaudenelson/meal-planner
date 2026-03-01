import { Star, Clock, Users } from 'lucide-react'
import ProteinBadge from './ProteinBadge'

export default function RecipeCard({ recipe, onToggleStar, onClick, compact = false }) {
  const tags = recipe.tags ?? []

  function handleStarClick(e) {
    e.stopPropagation()
    onToggleStar?.(recipe.id, recipe.starred)
  }

  return (
    <div
      onClick={() => onClick?.(recipe)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 leading-tight truncate">{recipe.name}</h3>
          {!compact && recipe.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{recipe.description}</p>
          )}
        </div>
        {onToggleStar && (
          <button
            onClick={handleStarClick}
            className="shrink-0 p-1 -mr-1 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label={recipe.starred ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              size={18}
              className={recipe.starred ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
            />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {recipe.total_time_min != null && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            {recipe.total_time_min} min
          </span>
        )}
        {recipe.servings && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} />
            {recipe.servings} srv
          </span>
        )}
        <ProteinBadge proteinG={recipe.protein_g} proteinRatio={recipe.protein_ratio} />
        {tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
