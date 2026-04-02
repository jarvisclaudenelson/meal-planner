import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const MEAL_TYPES = [
  { type: 'big-cook', label: 'Big Cook' },
  { type: 'slow-cooker', label: 'Slow Cooker' },
  { type: 'no-cook', label: 'No Cook / Assemble' },
]

/** Build positions array from config like { 'big-cook': 2, 'slow-cooker': 1, 'no-cook': 1 } */
export function buildPositions(config) {
  const positions = []
  for (const { type, label } of MEAL_TYPES) {
    const count = config[type] ?? 0
    for (let i = 1; i <= count; i++) {
      positions.push({ key: `${type}-${i}`, label, type })
    }
  }
  return positions
}

// Color palette — assigned per position index, stable within a config
const COLOR_PALETTE = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', ring: 'ring-blue-200' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-200' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', ring: 'ring-rose-200' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500', ring: 'ring-purple-200' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-500', ring: 'ring-cyan-200' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500', ring: 'ring-orange-200' },
  { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', dot: 'bg-pink-500', ring: 'ring-pink-200' },
]

export function getColorForPosition(positions, key) {
  const index = positions.findIndex(p => p.key === key)
  return COLOR_PALETTE[Math.max(0, index) % COLOR_PALETTE.length]
}

/**
 * Manages the weekly meal plan (dynamic positions) and their sides.
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
        if (current.sides.some(s => s.id === recipeId)) return prev
        return {
          ...prev,
          [position]: { ...current, sides: [...current.sides, recipe] }
        }
      })
    }
    return error
  }, [weekStart])

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
