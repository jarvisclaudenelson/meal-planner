import { Plus, X, Clock } from 'lucide-react'

/**
 * A single meal slot (dinner or lunch) in the weekly plan.
 * - `primary`: larger dinner slot vs. smaller lunch slot
 * - Tap → opens picker; clear button → removes meal
 */
export default function MealSlot({ recipe, onTap, onClear, primary = true, label }) {
  return (
    <div className={`relative ${primary ? '' : 'opacity-90'}`}>
      {recipe ? (
        <div
          onClick={onTap}
          className={`flex items-center justify-between gap-2 rounded-lg cursor-pointer transition-colors ${
            primary
              ? 'bg-emerald-50 border border-emerald-200 p-3 hover:bg-emerald-100'
              : 'bg-gray-50 border border-gray-200 p-2 hover:bg-gray-100'
          }`}
        >
          <div className="flex-1 min-w-0">
            {label && (
              <p className="text-xs font-medium text-gray-400 mb-0.5 uppercase tracking-wide">{label}</p>
            )}
            <p className={`font-medium text-gray-800 truncate ${primary ? 'text-sm' : 'text-xs'}`}>
              {recipe.name}
            </p>
            {primary && recipe.total_time_min != null && (
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Clock size={10} />
                {recipe.total_time_min} min
              </p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear?.() }}
            className="shrink-0 p-1 rounded-md hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Remove meal"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={onTap}
          className={`w-full flex items-center gap-2 rounded-lg border-dashed border-2 transition-colors ${
            primary
              ? 'border-emerald-200 text-emerald-500 p-3 hover:border-emerald-400 hover:bg-emerald-50'
              : 'border-gray-200 text-gray-400 p-2 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Plus size={primary ? 16 : 13} />
          <span className={`font-medium ${primary ? 'text-sm' : 'text-xs'}`}>
            {label ? `Add ${label}` : 'Add meal'}
          </span>
        </button>
      )}
    </div>
  )
}
