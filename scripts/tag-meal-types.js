#!/usr/bin/env node
/**
 * Tag existing recipes with meal types: big-cook, slow-cooker, no-cook.
 *
 * Logic:
 * - If cook_time_min >= 240 (4+ hours) or name/tags contain "slow cooker" → slow-cooker
 * - If cook_time_min === 0 and prep_time_min <= 15 → no-cook
 * - Otherwise → big-cook (default main meal)
 * - Recipes already tagged with "side" are left alone
 *
 * Run: node scripts/tag-meal-types.js
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function main() {
  const { data: recipes, error } = await supabase.from('recipes').select('id, name, tags, prep_time_min, cook_time_min')
  if (error) { console.error(error); process.exit(1) }

  const mealTypes = ['big-cook', 'slow-cooker', 'no-cook']
  let updated = 0

  for (const r of recipes) {
    const tags = r.tags ?? []
    // Skip sides
    if (tags.includes('side')) continue
    // Skip if already tagged with a meal type
    if (mealTypes.some(t => tags.includes(t))) continue

    let type = 'big-cook'
    const nameLower = r.name.toLowerCase()

    if (r.cook_time_min >= 240 || nameLower.includes('slow cooker') || tags.includes('meal-prep')) {
      type = 'slow-cooker'
    } else if (r.cook_time_min === 0 && (r.prep_time_min ?? 0) <= 15) {
      type = 'no-cook'
    }

    const newTags = [...tags, type]
    const { error: updateErr } = await supabase
      .from('recipes')
      .update({ tags: newTags })
      .eq('id', r.id)

    if (updateErr) {
      console.error(`Failed to tag ${r.name}:`, updateErr.message)
    } else {
      console.log(`Tagged "${r.name}" → ${type}`)
      updated++
    }
  }

  console.log(`\nDone. Tagged ${updated} recipes.`)
}

main()
