import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const POSITIONS = [
  { key: 'big-cook-1', label: 'Big Cook', type: 'big-cook' },
  { key: 'big-cook-2', label: 'Big Cook', type: 'big-cook' },
  { key: 'slow-cooker', label: 'Slow Cooker', type: 'slow-cooker' },
  { key: 'no-cook', label: 'No Cook / Assemble', type: 'no-cook' },
]

// Color palette for meal-to-side matching
export const MEAL_COLORS = {
  'big-cook-1': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', ring: 'ring-blue-200', label: 'Blue' },
  'big-cook-2': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-200', label: 'Amber' },
  'slow-cooker': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', ring: 'ring-rose-200', label: 'Rose' },
  'no-cook': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200', label: 'Green' },
}

/**
 * Manages the weekly meal plan (4 positions) and their sides.
 * plan shape: { 'big-cook-1': { recipe, sides: [recipe, ...] }, ... }
 */
export function useMealPlan(weekStart) {
  const [plan, setPlan] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!weekStart) return
    fetchPlan()
  }, [weekStart])

  async function fetchPlan() {
    setLoading(true)
    setError(null)

    // Fetch meals and sides in parallel
    const [mealsRes, sidesRes] = await Promise.all([
      supabase
        .from('meal_plans')
        .select('position, recipe:recipes!meal_plans_recipe_id_fkey(*)')
        .eq('week_start', weekStart),
      supabase
        .from('meal_sides')
        .select('position, recipe:recipes!meal_sides_recipe_id_fkey(*)')
        .eq('week_start', weekStart),
    ])

    if (mealsRes.error || sidesRes.error) {
      setError(mealsRes.error?.message || sidesRes.error?.message)
    } else {
      const map = {}
      for (const row of mealsRes.data ?? []) {
        map[row.position] = { recipe: row.recipe, sides: [] }
      }
      for (const row of sidesRes.data ?? []) {
        if (!map[row.position]) map[row.position] = { recipe: null, sides: [] }
        map[row.position].sides.push(row.recipe)
      }
      setPlan(map)
    }
    setLoading(false)
  }

  /** Assign a recipe to a position. */
  const setMeal = useCallback(async (position, recipeId) => {
    const { error } = await supabase
      .from('meal_plans')
      .upsert(
        { week_start: weekStart, position, recipe_id: recipeId },
        { onConflict: 'week_start,position' }
      )
    if (!error) {
      const { data: recipe } = await supabase
        .from('recipes').select('*').eq('id', recipeId).single()
      setPlan((prev) => ({
        ...prev,
        [position]: { ...(prev[position] ?? { sides: [] }), recipe }
      }))
    }
    return error
  }, [weekStart])

  /** Remove the main recipe from a position. */
  const clearMeal = useCallback(async (position) => {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('week_start', weekStart)
      .eq('position', position)
    if (!error) {
      setPlan((prev) => ({
        ...prev,
        [position]: { ...(prev[position] ?? {}), recipe: null }
      }))
    }
    return error
  }, [weekStart])

  /** Add a side to a meal position. */
  const addSide = useCallback(async (position, recipeId) => {
    const { error } = await supabase
      .from('meal_sides')
      .upsert(
        { week_start: weekStart, position, recipe_id: recipeId },
        { onConflict: 'week_start,position,recipe_id' }
      )
    if (!error) {
      const { data: recipe } = await supabase
        .from('recipes').select('*').eq('id', recipeId).single()
      setPlan((prev) => {
        const current = prev[position] ?? { recipe: null, sides: [] }
        // Avoid duplicates
        if (current.sides.some(s => s.id === recipeId)) return prev
        return {
          ...prev,
          [position]: { ...current, sides: [...current.sides, recipe] }
        }
      })
    }
    return error
  }, [weekStart])

  /** Remove a side from a meal position. */
  const removeSide = useCallback(async (position, recipeId) => {
    const { error } = await supabase
      .from('meal_sides')
      .delete()
      .eq('week_start', weekStart)
      .eq('position', position)
      .eq('recipe_id', recipeId)
    if (!error) {
      setPlan((prev) => {
        const current = prev[position] ?? { recipe: null, sides: [] }
        return {
          ...prev,
          [position]: { ...current, sides: current.sides.filter(s => s.id !== recipeId) }
        }
      })
    }
    return error
  }, [weekStart])

  return { plan, loading, error, setMeal, clearMeal, addSide, removeSide, refetch: fetchPlan }
}
