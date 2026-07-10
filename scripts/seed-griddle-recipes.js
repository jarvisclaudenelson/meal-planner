#!/usr/bin/env node
// Idempotently add or refresh Plaited's starter griddle recipes.
// Usage: npm run seed:griddle

import { createClient } from '@supabase/supabase-js'
import { GRIDDLE_RECIPES } from './griddle-recipes.js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  let inserted = 0
  let updated = 0

  for (const recipe of GRIDDLE_RECIPES) {
    const { data: existing, error: findError } = await supabase
      .from('recipes')
      .select('id, starred')
      .eq('name', recipe.name)
      .limit(1)

    if (findError) {
      console.error(`Failed to look up ${recipe.name}: ${findError.message}`)
      process.exit(1)
    }

    if (existing?.length) {
      const { starred: _defaultStarred, ...fields } = recipe
      const { error } = await supabase.from('recipes').update(fields).eq('id', existing[0].id)
      if (error) {
        console.error(`Failed to update ${recipe.name}: ${error.message}`)
        process.exit(1)
      }
      updated += 1
      console.log(`Updated: ${recipe.name}`)
    } else {
      const { error } = await supabase.from('recipes').insert(recipe)
      if (error) {
        console.error(`Failed to insert ${recipe.name}: ${error.message}`)
        process.exit(1)
      }
      inserted += 1
      console.log(`Inserted: ${recipe.name}`)
    }
  }

  console.log(`Done. ${inserted} inserted, ${updated} updated.`)
}

main()
