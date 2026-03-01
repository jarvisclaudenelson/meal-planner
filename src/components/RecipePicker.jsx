import { useState, useEffect, useRef } from 'react'
import { Search, X, Star, Clock } from 'lucide-react'

/**
 * Slide-up bottom sheet for selecting a recipe.
 * Props:
 *   open       — boolean
 *   onClose    — () => void
 *   onSelect   — (recipe) => void
 *   recipes    — array of recipe objects
 */
export default function RecipePicker({ open, onClose, onSelect, recipes = [] }) {
  const [search, setSearch] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      // Small delay to let animation start before focusing
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const filtered = recipes.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.tags?.some((t) => t.toLowerCase().includes(q))
  })

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[85vh]">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Pick a Recipe</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search recipes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Recipe list */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-2">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No recipes found</p>
          )}
          {filtered.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => { onSelect(recipe); onClose() }}
              className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-900 text-sm truncate">{recipe.name}</span>
                    {recipe.starred && <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {recipe.total_time_min != null && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                        <Clock size={10} />
                        {recipe.total_time_min} min
                      </span>
                    )}
                    {recipe.protein_g != null && (
                      <span className="text-xs text-emerald-600">{Math.round(recipe.protein_g)}g protein</span>
                    )}
                    {recipe.tags?.slice(0, 2).map((t) => (
                      <span key={t} className="text-xs text-gray-400">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
