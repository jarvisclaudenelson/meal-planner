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
  { bg: 'bg-blue-900/30', border: 'border-blue-700', text: 'text-blue-300', dot: 'bg-blue-400', ring: 'ring-blue-700' },
  { bg: 'bg-amber-900/30', border: 'border-amber-700', text: 'text-amber-300', dot: 'bg-amber-400', ring: 'ring-amber-700' },
  { bg: 'bg-rose-900/30', border: 'border-rose-700', text: 'text-rose-300', dot: 'bg-rose-400', ring: 'ring-rose-700' },
  { bg: 'bg-emerald-900/30', border: 'border-emerald-700', text: 'text-emerald-300', dot: 'bg-emerald-400', ring: 'ring-emerald-700' },
  { bg: 'bg-purple-900/30', border: 'border-purple-700', text: 'text-purple-300', dot: 'bg-purple-400', ring: 'ring-purple-700' },
  { bg: 'bg-cyan-900/30', border: 'border-cyan-700', text: 'text-cyan-300', dot: 'bg-cyan-400', ring: 'ring-cyan-700' },
  { bg: 'bg-orange-900/30', border: 'border-orange-700', text: 'text-orange-300', dot: 'bg-orange-400', ring: 'ring-orange-700' },
  { bg: 'bg-pink-900/30', border: 'border-pink-700', text: 'text-pink-300', dot: 'bg-pink-400', ring: 'ring-pink-700' },
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
        .select('position, multiplier, recipe:recipes!meal_plans_recipe_id_fkey(*)')
        .eq('week_start', weekStart),
      supabase
        .from('meal_sides')
        .select('position, multiplier, recipe:recipes!meal_sides_recipe_id_fkey(*)')
        .eq('week_start', weekStart),
    ])

    if (mealsRes.error || sidesRes.error) {
      setError(mealsRes.error?.message || sidesRes.error?.message)
    } else {
      const map = {}
      for (const row of mealsRes.data ?? []) {
        map[row.position] = { recipe: row.recipe, multiplier: row.multiplier ?? 1, sides: [] }
      }
      for (const row of sidesRes.data ?? []) {
        if (!map[row.position]) map[row.position] = { recipe: null, multiplier: 1, sides: [] }
        map[row.position].sides.push({ ...row.recipe, multiplier: row.multiplier ?? 1 })
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

  const setMultiplier = useCallback(async (position, multiplier) => {
    const { error } = await supabase
      .from('meal_plans')
      .update({ multiplier })
      .eq('week_start', weekStart)
      .eq('position', position)
    if (!error) {
      setPlan((prev) => ({
        ...prev,
        [position]: { ...prev[position], multiplier }
      }))
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

  return { plan, loading, error, setMeal, clearMeal, setMultiplier, addSide, removeSide, refetch: fetchPlan }
}
