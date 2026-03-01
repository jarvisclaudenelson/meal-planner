import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Manages the meal plan for a given ISO week start date (YYYY-MM-DD).
 * plan shape: { 'monday-dinner': recipeObject | null, ... }
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
    const { data, error } = await supabase
      .from('meal_plans')
      .select('day, slot, recipe:recipes(*)')
      .eq('week_start', weekStart)

    if (error) {
      setError(error.message)
    } else {
      const map = {}
      for (const row of data ?? []) {
        map[`${row.day}-${row.slot}`] = row.recipe
      }
      setPlan(map)
    }
    setLoading(false)
  }

  /** Assign a recipe to a day/slot. */
  const setMeal = useCallback(async (day, slot, recipeId) => {
    const { error } = await supabase
      .from('meal_plans')
      .upsert(
        { week_start: weekStart, day, slot, recipe_id: recipeId },
        { onConflict: 'week_start,day,slot' }
      )
    if (!error) {
      const { data: recipe } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single()
      setPlan((prev) => ({ ...prev, [`${day}-${slot}`]: recipe }))
    }
    return error
  }, [weekStart])

  /** Remove a recipe from a day/slot. */
  const clearMeal = useCallback(async (day, slot) => {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('week_start', weekStart)
      .eq('day', day)
      .eq('slot', slot)
    if (!error) {
      setPlan((prev) => {
        const next = { ...prev }
        delete next[`${day}-${slot}`]
        return next
      })
    }
    return error
  }, [weekStart])

  return { plan, loading, error, setMeal, clearMeal, refetch: fetchPlan }
}
