import test from 'node:test'
import assert from 'node:assert/strict'

import { GRIDDLE_RECIPES } from '../scripts/griddle-recipes.js'

test('ships a useful starter collection for the griddle category', () => {
  assert.ok(GRIDDLE_RECIPES.length >= 5)

  for (const recipe of GRIDDLE_RECIPES) {
    assert.ok(recipe.tags.includes('griddle'), `${recipe.name} needs the griddle tag`)
    assert.ok(recipe.servings >= 5, `${recipe.name} should feed the family`)
    assert.ok(recipe.ingredients.length > 0, `${recipe.name} needs ingredients`)
    assert.ok(recipe.steps.length > 0, `${recipe.name} needs steps`)
  }
})

test('includes kid-friendly griddle options', () => {
  const kidFriendly = GRIDDLE_RECIPES.filter((recipe) => recipe.tags.includes('kid-friendly'))
  assert.ok(kidFriendly.length >= 3)
})
