import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const SECTION_ORDER = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Pantry',
  'Frozen',
  'Bread',
  'Other',
]

function sectionIndex(section) {
  const i = SECTION_ORDER.indexOf(section)
  return i === -1 ? SECTION_ORDER.length : i
}

/**
 * Shopping list for a given week.
 * items shape: [{ id, name, qty, unit, section, checked, custom }]
 */
export function useShoppingList(weekStart, plan) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!weekStart) return
    loadList()
  }, [weekStart])

  async function loadList() {
    setLoading(true)
    const { data } = await supabase
      .from('shopping_lists')
      .select('items')
      .eq('week_start', weekStart)
      .maybeSingle()
    if (data?.items) setItems(data.items)
    else setItems([])
    setLoading(false)
  }

  async function persist(newItems) {
    setItems(newItems)
    await supabase.from('shopping_lists').upsert(
      { week_start: weekStart, items: newItems, updated_at: new Date().toISOString() },
      { onConflict: 'week_start' }
    )
  }

  /** Generate list from current week's meal plan. Merges ingredients by item+unit key. */
  const generateList = useCallback(async () => {
    // Plan values are now { main: recipeObj, side: recipeObj }
    const planItems = Object.values(plan ?? {}).filter(Boolean)
    const recipes = []
    
    for (const item of planItems) {
      if (item.main) recipes.push(item.main)
      if (item.side) recipes.push(item.side)
    }

    const consolidated = {}

    for (const recipe of recipes) {
      if (!Array.isArray(recipe.ingredients)) continue
      for (const ing of recipe.ingredients) {
        const key = `${ing.item?.toLowerCase().trim()}||${(ing.unit ?? '').toLowerCase().trim()}`
        if (consolidated[key]) {
          consolidated[key].qty = (consolidated[key].qty ?? 0) + (parseFloat(ing.qty) || 0)
        } else {
          consolidated[key] = {
            id: `gen-${key}-${Math.random().toString(36).slice(2)}`,
            name: ing.item,
            qty: parseFloat(ing.qty) || 0,
            unit: ing.unit ?? '',
            section: ing.section ?? 'Other',
            checked: false,
            custom: false,
          }
        }
      }
    }

    // Preserve any existing custom items
    const custom = items.filter((i) => i.custom)

    const generated = Object.values(consolidated).sort(
      (a, b) => sectionIndex(a.section) - sectionIndex(b.section) || a.name.localeCompare(b.name)
    )

    await persist([...generated, ...custom])
  }, [plan, items, weekStart])

  const toggleItem = useCallback(async (id) => {
    await persist(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
  }, [items])

  const addCustomItem = useCallback(async (name) => {
    if (!name.trim()) return
    const newItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      qty: 0,
      unit: '',
      section: 'Other',
      checked: false,
      custom: true,
    }
    await persist([...items, newItem])
  }, [items])

  const removeItem = useCallback(async (id) => {
    await persist(items.filter((i) => i.id !== id))
  }, [items])

  const resetList = useCallback(async () => {
    await persist([])
  }, [])

  const exportList = useCallback(() => {
    const sections = {}
    for (const item of items) {
      const s = item.section || 'Other'
      if (!sections[s]) sections[s] = []
      sections[s].push(item)
    }
    const lines = ['Shopping List', '']
    for (const section of SECTION_ORDER) {
      if (!sections[section]?.length) continue
      lines.push(`── ${section} ──`)
      for (const item of sections[section]) {
        const qty = item.qty ? `${item.qty}${item.unit ? ' ' + item.unit : ''}` : ''
        lines.push(`${item.checked ? '✓ ' : '☐ '}${item.name}${qty ? '  (' + qty + ')' : ''}`)
      }
      lines.push('')
    }
    navigator.clipboard
      .writeText(lines.join('\n').trimEnd())
      .catch(() => alert('Could not copy — try again or manually select the text.'))
  }, [items])

  return {
    items,
    loading,
    generateList,
    toggleItem,
    addCustomItem,
    removeItem,
    resetList,
    exportList,
    refetch: loadList,
  }
}
