import { useState, useEffect } from 'react'
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
 * plan shape: { 'big-cook-1': { recipe, sides: [...] }, ... }
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
  async function generateList() {
    const recipes = []

    for (const slot of Object.values(plan ?? {})) {
      if (slot?.recipe) recipes.push(slot.recipe)
      if (slot?.sides) {
        for (const side of slot.sides) {
          if (side) recipes.push(side)
        }
      }
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
  }

  async function toggleItem(id) {
    await persist(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
  }

  async function addCustomItem(name) {
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
  }

  async function removeItem(id) {
    await persist(items.filter((i) => i.id !== id))
  }

  async function resetList() {
    await persist([])
  }

  function exportList() {
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
  }

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
