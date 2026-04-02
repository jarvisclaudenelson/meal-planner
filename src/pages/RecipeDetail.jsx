import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Clock, Users, ChevronLeft, ChevronRight, X, Lightbulb, Trash2 } from 'lucide-react'
import { useRecipe } from '../hooks/useRecipes'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

const PROTEIN_TIPS = [
  'Add a chicken breast (+50g protein)',
  'Swap regular cheese for cottage cheese (+12g protein)',
  'Add 2 eggs (+12g protein)',
  'Add Greek yogurt as a topping (+15g protein)',
  'Stir in a scoop of unflavored protein powder (+25g protein)',
]

const TABS = ['Ingredients', 'Steps', 'Nutrition']

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recipe, loading, error } = useRecipe(id)
  const [tab, setTab] = useState('Ingredients')
  const [starred, setStarred] = useState(false)
  const [cookingMode, setCookingMode] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const wakeLockRef = useRef(null)

  useEffect(() => {
    if (recipe) setStarred(recipe.starred)
  }, [recipe])

  // Wake Lock for cooking mode
  useEffect(() => {
    if (cookingMode && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((lock) => {
        wakeLockRef.current = lock
      }).catch(() => {})
    }
    return () => {
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [cookingMode])

  async function toggleStar() {
    const newVal = !starred
    setStarred(newVal)
    await supabase.from('recipes').update({ starred: newVal }).eq('id', id)
  }

  async function deleteRecipe() {
    setDeleting(true)
    // Delete related meal_plans and meal_sides first
    await supabase.from('meal_sides').delete().eq('recipe_id', id)
    await supabase.from('meal_plans').delete().eq('recipe_id', id)
    const { error: delError } = await supabase.from('recipes').delete().eq('id', id)
    if (delError) {
      setDeleting(false)
      setShowDeleteConfirm(false)
      return
    }
    navigate('/recipes', { replace: true })
  }

  if (loading) return <LoadingSpinner />
  if (error || !recipe) {
    return (
      <div className="p-6 text-center text-red-400">
        <p className="font-medium">Recipe not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-emerald-400">Go back</button>
      </div>
    )
  }

  const steps = recipe.steps ?? []
  const ingredients = recipe.ingredients ?? []
  const showProteinTips = (recipe.protein_ratio ?? 0) < 8

  // Find ingredients mentioned in a step
  function getIngredientsForStep(stepText) {
    if (!stepText || !ingredients.length) return []
    const stepLower = stepText.toLowerCase()
    return ingredients.filter((ing) => {
      if (!ing.item) return false
      // Match the ingredient name or key words from it
      const itemLower = ing.item.toLowerCase()
      const words = itemLower.split(/\s+/)
      // Check if any significant word (3+ chars) appears in the step
      return words.some((word) => word.length >= 3 && stepLower.includes(word))
    })
  }

  // ── Cooking Mode ──────────────────────────────────────────────
  if (cookingMode) {
    const step = steps[stepIndex]
    const stepIngredients = getIngredientsForStep(step)
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="font-semibold text-lg truncate flex-1 mr-4">{recipe.name}</h2>
          <button
            onClick={() => { setCookingMode(false); setStepIndex(0) }}
            className="p-2 rounded-lg hover:bg-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto">
          <p className="text-emerald-400 text-sm font-medium mb-4">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <p className="text-2xl font-medium leading-relaxed">{step}</p>

          {/* Ingredients used in this step */}
          {stepIngredients.length > 0 && (
            <div className="mt-6 w-full max-w-sm">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Ingredients for this step</p>
              <div className="flex flex-wrap justify-center gap-2">
                {stepIngredients.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/50 border border-emerald-700 rounded-full text-sm"
                  >
                    <span className="text-emerald-300 font-medium">
                      {ing.qty > 0 ? `${ing.qty} ${ing.unit}` : ing.unit}
                    </span>
                    <span className="text-gray-300">{ing.item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-700 font-medium disabled:opacity-40"
          >
            <ChevronLeft size={20} /> Prev
          </button>

          {/* Step dots */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStepIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === stepIndex ? 'bg-emerald-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
            disabled={stepIndex === steps.length - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 font-medium disabled:opacity-40"
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      </div>
    )
  }

  // ── Normal View ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-700"
          >
            <ArrowLeft size={20} className="text-gray-300" />
          </button>
          <h1 className="flex-1 font-bold text-gray-100 truncate">{recipe.name}</h1>
          <button onClick={toggleStar} className="p-2 rounded-xl hover:bg-gray-700">
            <Star
              size={22}
              className={starred ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}
            />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Description */}
        {recipe.description && (
          <p className="text-gray-300 leading-relaxed">{recipe.description}</p>
        )}

        {/* Quick stats */}
        <div className="flex flex-wrap gap-3 mt-4">
          {recipe.total_time_min != null && (
            <StatChip icon={<Clock size={14} />} label={`${recipe.total_time_min} min`} />
          )}
          {recipe.servings && (
            <StatChip icon={<Users size={14} />} label={`${recipe.servings} servings`} />
          )}
          {recipe.protein_g != null && (
            <StatChip
              label={`${Math.round(recipe.protein_g)}g protein / serving`}
              className="bg-emerald-900/50 text-emerald-300 border-emerald-700"
            />
          )}
        </div>

        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {recipe.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Protein tips */}
        {showProteinTips && (
          <div className="mt-4 bg-amber-900/30 border border-amber-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-amber-400" />
              <span className="font-semibold text-amber-300 text-sm">Boost the protein</span>
            </div>
            <ul className="space-y-1">
              {PROTEIN_TIPS.map((tip) => (
                <li key={tip} className="text-sm text-amber-200/80 flex items-start gap-2">
                  <span className="mt-0.5 text-amber-400">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cooking Mode button */}
        {steps.length > 0 && (
          <button
            onClick={() => { setCookingMode(true); setStepIndex(0) }}
            className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
          >
            Start Cooking Mode
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-3 w-full py-3 bg-gray-800 border border-red-800 text-red-400 font-medium rounded-xl hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          Delete Recipe
        </button>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">Delete recipe?</h3>
              <p className="text-sm text-gray-400 mt-2">
                This will permanently delete <strong>{recipe.name}</strong> and remove it from any meal plans.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-xl"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteRecipe}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-5 bg-gray-800 p-1 rounded-xl">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-gray-700 text-gray-100 shadow-sm' : 'text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-4">
          {tab === 'Ingredients' && (
            <div className="space-y-2">
              {ingredients.length === 0 && (
                <p className="text-gray-500 text-sm">No ingredients listed.</p>
              )}
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-100">{ing.item}</span>
                  <span className="text-gray-400 text-sm ml-4 shrink-0">
                    {ing.qty > 0 ? `${ing.qty} ` : ''}{ing.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === 'Steps' && (
            <ol className="space-y-4">
              {steps.length === 0 && (
                <p className="text-gray-500 text-sm">No steps listed.</p>
              )}
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-emerald-900/50 text-emerald-300 rounded-full text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-gray-200 leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          )}

          {tab === 'Nutrition' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Per serving</p>
              <NutritionRow label="Calories" value={recipe.calories} unit="kcal" />
              <NutritionRow label="Protein" value={recipe.protein_g} unit="g" accent />
              <NutritionRow label="Carbohydrates" value={recipe.carbs_g} unit="g" />
              <NutritionRow label="Fat" value={recipe.fat_g} unit="g" />
              {recipe.protein_ratio != null && (
                <NutritionRow
                  label="Protein density"
                  value={recipe.protein_ratio?.toFixed(1)}
                  unit="g / 100 cal"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatChip({ icon, label, className = 'bg-gray-700 text-gray-200 border-gray-600' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${className}`}>
      {icon}
      {label}
    </span>
  )
}

function NutritionRow({ label, value, unit, accent = false }) {
  if (value == null) return null
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-700">
      <span className={`text-sm ${accent ? 'font-semibold text-emerald-400' : 'text-gray-200'}`}>{label}</span>
      <span className={`text-sm ${accent ? 'font-semibold text-emerald-400' : 'text-gray-400'}`}>
        {value} {unit}
      </span>
    </div>
  )
}
