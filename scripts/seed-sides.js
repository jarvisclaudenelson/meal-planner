import { createClient } from '@supabase/supabase-js'

const url = 'https://hbykpslxdsojowellrim.supabase.co'
const key = 'sb_publishable_bGdHuFblvAy4PIaPRXVvzA_uPXWrhwN'
const supabase = createClient(url, key)

const sides = [
  {
    name: 'Roasted Broccoli with Lemon & Garlic',
    description: 'Simple, crispy roasted broccoli with a pop of citrus. High fiber and pairs with everything.',
    servings: 4,
    prep_time_min: 5,
    cook_time_min: 20,
    calories: 120,
    protein_g: 4,
    carbs_g: 8,
    fat_g: 9,
    ingredients: [
      { item: 'Broccoli florets', qty: 1, unit: 'lb', section: 'Produce' },
      { item: 'Olive oil', qty: 2, unit: 'tbsp', section: 'Pantry' },
      { item: 'Garlic powder', qty: 1, unit: 'tsp', section: 'Pantry' },
      { item: 'Lemon juice', qty: 1, unit: 'tbsp', section: 'Produce' },
      { item: 'Salt & pepper', qty: 0, unit: 'to taste', section: 'Pantry' }
    ],
    steps: [
      'Preheat oven to 400°F (200°C).',
      'Toss broccoli with olive oil, garlic powder, salt, and pepper on a sheet pan.',
      'Roast for 15-20 minutes until edges are crispy.',
      'Drizzle with fresh lemon juice before serving.'
    ],
    tags: ['side', 'veggie', 'quick'],
    starred: false
  },
  {
    name: 'Sautéed Garlic Green Beans',
    description: 'Crisp-tender green beans sautéed with plenty of garlic.',
    servings: 4,
    prep_time_min: 5,
    cook_time_min: 10,
    calories: 85,
    protein_g: 2,
    carbs_g: 7,
    fat_g: 6,
    ingredients: [
      { item: 'Fresh green beans', qty: 1, unit: 'lb', section: 'Produce' },
      { item: 'Garlic cloves, minced', qty: 3, unit: '', section: 'Produce' },
      { item: 'Olive oil', qty: 1, unit: 'tbsp', section: 'Pantry' },
      { item: 'Butter', qty: 1, unit: 'tsp', section: 'Dairy' }
    ],
    steps: [
      'Blanch green beans in boiling water for 3 minutes; drain and shock in ice water.',
      'Heat oil and butter in a large skillet over medium-high heat.',
      'Add beans and sauté for 2-3 minutes.',
      'Add garlic and cook until fragrant (1 minute). Season and serve.'
    ],
    tags: ['side', 'veggie', 'quick'],
    starred: false
  },
  {
    name: 'Honey Glazed Carrots',
    description: 'Sweet and savory carrots that kids actually enjoy.',
    servings: 4,
    prep_time_min: 5,
    cook_time_min: 15,
    calories: 110,
    protein_g: 1,
    carbs_g: 18,
    fat_g: 4,
    ingredients: [
      { item: 'Carrots, sliced', qty: 1, unit: 'lb', section: 'Produce' },
      { item: 'Honey', qty: 2, unit: 'tbsp', section: 'Pantry' },
      { item: 'Butter', qty: 1, unit: 'tbsp', section: 'Dairy' },
      { item: 'Fresh parsley', qty: 1, unit: 'tbsp', section: 'Produce' }
    ],
    steps: [
      'Steam or boil carrots until tender (8-10 minutes). Drain.',
      'In the same pan, melt butter and whisk in honey.',
      'Add carrots back and toss over medium heat for 2-3 minutes until glazed.',
      'Garnish with parsley.'
    ],
    tags: ['side', 'veggie', 'kid-friendly'],
    starred: false
  }
]

async function seed() {
  console.log('Seeding veggie side dishes...')
  const { data, error } = await supabase.from('recipes').insert(sides).select('id, name')
  if (error) {
    console.error('Error:', error.message)
  } else {
    for (const r of data) console.log(`  ✓ ${r.name}`)
    console.log(`\nDone — ${data.length} sides added.`)
  }
}

seed()
