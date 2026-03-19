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
      .select('day, slot, recipe:recipes!meal_plans_recipe_id_fkey(*), side:recipes!meal_plans_side_id_fkey(*)')
      .eq('week_start', weekStart)

    if (error) {
      setError(error.message)
    } else {
      const map = {}
      for (const row of data ?? []) {
        map[`${row.day}-${row.slot}`] = {
          main: row.recipe,
          side: row.side
        }
      }
      setPlan(map)
    }
    setLoading(false)
  }

  /** Assign a recipe to a day/slot as either 'main' or 'side'. */
  const setMeal = useCallback(async (day, slot, recipeId, type = 'main') => {
    const column = type === 'side' ? 'side_id' : 'recipe_id'
    
    const { error } = await supabase
      .from('meal_plans')
      .upsert(
        { week_start: weekStart, day, slot, [column]: recipeId },
        { onConflict: 'week_start,day,slot' }
      )
    if (!error) {
      const { data: recipe } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single()
      
      setPlan((prev) => {
        const current = prev[`${day}-${slot}`] ?? { main: null, side: null }
        return {
          ...prev,
          [`${day}-${slot}`]: {
            ...current,
            [type]: recipe
          }
        }
      })
    }
    return error
  }, [weekStart])

  /** Remove a recipe from a day/slot. */
  const clearMeal = useCallback(async (day, slot, type = 'main') => {
    const column = type === 'side' ? 'side_id' : 'recipe_id'
    
    // Check if the other part of the meal exists. If so, update with null. 
    // If neither exists after this, we could delete the row, but nulling the column is safer for RLS/Upsert patterns.
    const { error } = await supabase
      .from('meal_plans')
      .update({ [column]: null })
      .eq('week_start', weekStart)
      .eq('day', day)
      .eq('slot', slot)

    if (!error) {
      setPlan((prev) => {
        const current = prev[`${day}-${slot}`] ?? { main: null, side: null }
        const next = { ...prev, [`${day}-${slot}`]: { ...current, [type]: null } }
        
        // Optional: clean up empty rows
        if (!next[`${day}-${slot}`].main && !next[`${day}-${slot}`].side) {
          delete next[`${day}-${slot}`]
        }
        return next
      })
    }
    return error
  }, [weekStart])

  return { plan, loading, error, setMeal, clearMeal, refetch: fetchPlan }
}
