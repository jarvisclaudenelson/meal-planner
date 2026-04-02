import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useRecipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    starred: false,
    quickOnly: false,    // total_time_min <= 30
    highProtein: false,  // protein_ratio >= 8 g/100cal
    kidFriendly: false,  // has 'kid-friendly' tag
    mealsOnly: false,    // exclude sides
    sidesOnly: false,    // only sides
    bigCook: false,      // has 'big-cook' tag
    slowCooker: false,   // has 'slow-cooker' tag
    noCook: false,       // has 'no-cook' tag
  })
  const [sort, setSort] = useState('name') // 'name' | 'protein' | 'time'

  useEffect(() => {
    fetchRecipes()
  }, [])

  async function fetchRecipes() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from('recipes').select('*').order('name')
    if (error) setError(error.message)
    else setRecipes(data ?? [])
    setLoading(false)
  }

  const filtered = recipes
    .filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match = r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
        if (!match) return false
      }
      if (filters.starred && !r.starred) return false
      if (filters.quickOnly && (r.total_time_min ?? 999) > 30) return false
      if (filters.highProtein && (r.protein_ratio ?? 0) < 8) return false
      if (filters.kidFriendly && !r.tags?.includes('kid-friendly')) return false
      if (filters.mealsOnly && r.tags?.includes('side')) return false
      if (filters.sidesOnly && !r.tags?.includes('side')) return false
      if (filters.bigCook && !r.tags?.includes('big-cook')) return false
      if (filters.slowCooker && !r.tags?.includes('slow-cooker')) return false
      if (filters.noCook && !r.tags?.includes('no-cook')) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'protein') return (b.protein_ratio ?? 0) - (a.protein_ratio ?? 0)
      if (sort === 'time') return (a.total_time_min ?? 0) - (b.total_time_min ?? 0)
      return a.name.localeCompare(b.name)
    })

  const toggleStar = useCallback(async (id, currentStarred) => {
    const newVal = !currentStarred
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, starred: newVal } : r)))
    const { error } = await supabase.from('recipes').update({ starred: newVal }).eq('id', id)
    if (error) {
      // Roll back optimistic update
      setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, starred: currentStarred } : r)))
    }
  }, [])

  return {
    recipes: filtered,
    allRecipes: recipes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sort,
    setSort,
    toggleStar,
    refetch: fetchRecipes,
  }
}

export function useRecipe(id) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function fetch() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single()
      if (!cancelled) {
        if (error) setError(error.message)
        else setRecipe(data)
        setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [id])

  return { recipe, loading, error }
}
