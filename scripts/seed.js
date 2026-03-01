#!/usr/bin/env node
// Seed 5 starter recipes into Supabase.
// Usage: npm run seed  (requires .env with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)

import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  console.error('Create a .env file from .env.example and fill in your credentials.')
  process.exit(1)
}

const supabase = createClient(url, key)

const recipes = [
  {
    name: 'Classic Beef Burgers',
    description: 'Juicy homemade burgers the whole family will love. Easy to customize with your favorite toppings.',
    servings: 4,
    prep_time_min: 10,
    cook_time_min: 15,
    calories: 520,
    protein_g: 38,
    carbs_g: 32,
    fat_g: 24,
    ingredients: [
      { item: 'Ground beef (80/20)', qty: 1.5, unit: 'lb', section: 'Meat & Seafood' },
      { item: 'Burger buns', qty: 4, unit: '', section: 'Bread' },
      { item: 'Cheddar cheese slices', qty: 4, unit: '', section: 'Dairy & Eggs' },
      { item: 'Lettuce', qty: 1, unit: 'head', section: 'Produce' },
      { item: 'Tomatoes', qty: 2, unit: '', section: 'Produce' },
      { item: 'Red onion', qty: 1, unit: '', section: 'Produce' },
      { item: 'Ketchup', qty: 1, unit: 'bottle', section: 'Pantry' },
      { item: 'Mustard', qty: 1, unit: 'bottle', section: 'Pantry' },
      { item: 'Garlic powder', qty: 1, unit: 'tsp', section: 'Pantry' },
      { item: 'Salt', qty: 1, unit: 'tsp', section: 'Pantry' },
      { item: 'Black pepper', qty: 0.5, unit: 'tsp', section: 'Pantry' },
    ],
    steps: [
      'Mix ground beef with garlic powder, salt, and pepper.',
      'Form into 4 equal patties, about ¾ inch thick.',
      'Heat grill or pan to medium-high heat.',
      'Cook patties 4–5 minutes per side for medium doneness.',
      'Add cheese in the last minute of cooking.',
      'Toast buns lightly. Assemble with desired toppings.',
    ],
    tags: ['kid-friendly', 'high-protein', 'quick'],
    starred: false,
  },
  {
    name: 'Sheet Pan Chicken Thighs',
    description: 'Crispy, flavorful chicken thighs roasted with seasonal vegetables. Perfect for meal prep — great leftovers.',
    servings: 6,
    prep_time_min: 10,
    cook_time_min: 35,
    calories: 420,
    protein_g: 42,
    carbs_g: 18,
    fat_g: 20,
    ingredients: [
      { item: 'Bone-in chicken thighs', qty: 6, unit: '', section: 'Meat & Seafood' },
      { item: 'Broccoli', qty: 2, unit: 'heads', section: 'Produce' },
      { item: 'Bell peppers', qty: 3, unit: '', section: 'Produce' },
      { item: 'Red onion', qty: 1, unit: '', section: 'Produce' },
      { item: 'Olive oil', qty: 3, unit: 'tbsp', section: 'Pantry' },
      { item: 'Garlic powder', qty: 2, unit: 'tsp', section: 'Pantry' },
      { item: 'Paprika', qty: 1, unit: 'tsp', section: 'Pantry' },
      { item: 'Italian seasoning', qty: 1, unit: 'tsp', section: 'Pantry' },
      { item: 'Salt & pepper', qty: 0, unit: 'to taste', section: 'Pantry' },
    ],
    steps: [
      'Preheat oven to 425°F (220°C).',
      'Pat chicken thighs dry and coat with olive oil and all seasonings.',
      'Cut vegetables into similar-sized pieces and toss with olive oil, salt, and pepper.',
      'Arrange chicken skin-side up on a sheet pan with vegetables around it.',
      'Roast 35–40 minutes until chicken reaches 165°F internal temperature.',
      'Let rest 5 minutes before serving.',
    ],
    tags: ['high-protein', 'meal-prep', 'adult'],
    starred: false,
  },
  {
    name: 'Ground Turkey Taco Bowls',
    description: 'Fast, healthy taco bowls the whole family can customize. Ready in under 25 minutes.',
    servings: 4,
    prep_time_min: 10,
    cook_time_min: 15,
    calories: 480,
    protein_g: 36,
    carbs_g: 45,
    fat_g: 14,
    ingredients: [
      { item: 'Ground turkey', qty: 1.25, unit: 'lb', section: 'Meat & Seafood' },
      { item: 'Brown rice', qty: 2, unit: 'cups', section: 'Pantry' },
      { item: 'Black beans', qty: 1, unit: 'can', section: 'Pantry' },
      { item: 'Corn', qty: 1, unit: 'can', section: 'Pantry' },
      { item: 'Taco seasoning', qty: 1, unit: 'packet', section: 'Pantry' },
      { item: 'Salsa', qty: 1, unit: 'jar', section: 'Pantry' },
      { item: 'Shredded cheddar', qty: 1, unit: 'cup', section: 'Dairy & Eggs' },
      { item: 'Sour cream', qty: 0.5, unit: 'cup', section: 'Dairy & Eggs' },
      { item: 'Avocados', qty: 2, unit: '', section: 'Produce' },
      { item: 'Limes', qty: 2, unit: '', section: 'Produce' },
      { item: 'Romaine lettuce', qty: 1, unit: 'head', section: 'Produce' },
    ],
    steps: [
      'Cook brown rice according to package instructions.',
      'Brown ground turkey in a skillet over medium-high heat; break up as it cooks.',
      'Add taco seasoning and ¼ cup water; simmer 3–4 minutes.',
      'Warm black beans and corn in a small saucepan.',
      'Dice avocado and squeeze lime juice over it to prevent browning.',
      'Assemble bowls: rice, turkey, beans, corn, lettuce, avocado, salsa, cheese, and sour cream.',
    ],
    tags: ['kid-friendly', 'high-protein', 'quick'],
    starred: false,
  },
  {
    name: 'Slow Cooker Beef Chili',
    description: 'Rich, hearty chili that gets better the next day. Makes a big batch — perfect for feeding a crowd or prepping lunches all week.',
    servings: 8,
    prep_time_min: 20,
    cook_time_min: 480,
    calories: 390,
    protein_g: 32,
    carbs_g: 35,
    fat_g: 12,
    ingredients: [
      { item: 'Ground beef', qty: 2, unit: 'lb', section: 'Meat & Seafood' },
      { item: 'Kidney beans', qty: 2, unit: 'cans', section: 'Pantry' },
      { item: 'Diced tomatoes', qty: 2, unit: 'cans', section: 'Pantry' },
      { item: 'Tomato sauce', qty: 1, unit: 'can', section: 'Pantry' },
      { item: 'Beef broth', qty: 1, unit: 'cup', section: 'Pantry' },
      { item: 'Onions', qty: 2, unit: '', section: 'Produce' },
      { item: 'Bell peppers', qty: 2, unit: '', section: 'Produce' },
      { item: 'Garlic cloves', qty: 4, unit: '', section: 'Produce' },
      { item: 'Chili powder', qty: 3, unit: 'tbsp', section: 'Pantry' },
      { item: 'Cumin', qty: 2, unit: 'tsp', section: 'Pantry' },
      { item: 'Smoked paprika', qty: 1, unit: 'tsp', section: 'Pantry' },
      { item: 'Shredded cheddar', qty: 1, unit: 'cup', section: 'Dairy & Eggs' },
      { item: 'Sour cream', qty: 0.5, unit: 'cup', section: 'Dairy & Eggs' },
    ],
    steps: [
      'Brown ground beef in a skillet over medium-high heat; drain excess fat.',
      'Dice onion, bell pepper, and mince garlic. Sauté 3–4 minutes.',
      'Add beef, vegetables, beans, tomatoes, sauce, broth, and all spices to slow cooker.',
      'Stir to combine. Cook on LOW 8 hours or HIGH 4 hours.',
      'Taste and adjust seasoning. Serve topped with cheddar and sour cream.',
      'Leftovers keep in the fridge for up to 5 days.',
    ],
    tags: ['leftovers', 'meal-prep', 'kid-friendly'],
    starred: false,
  },
  {
    name: 'Herb-Crusted Salmon',
    description: 'Elegant pan-to-oven salmon with a herbed panko crust. Restaurant quality in 30 minutes.',
    servings: 4,
    prep_time_min: 10,
    cook_time_min: 20,
    calories: 460,
    protein_g: 44,
    carbs_g: 12,
    fat_g: 24,
    ingredients: [
      { item: 'Salmon fillets (6 oz each)', qty: 4, unit: '', section: 'Meat & Seafood' },
      { item: 'Panko breadcrumbs', qty: 0.5, unit: 'cup', section: 'Pantry' },
      { item: 'Fresh parsley', qty: 0.25, unit: 'cup', section: 'Produce' },
      { item: 'Fresh dill', qty: 2, unit: 'tbsp', section: 'Produce' },
      { item: 'Lemons', qty: 2, unit: '', section: 'Produce' },
      { item: 'Garlic cloves', qty: 3, unit: '', section: 'Produce' },
      { item: 'Asparagus', qty: 1, unit: 'bunch', section: 'Produce' },
      { item: 'Dijon mustard', qty: 2, unit: 'tbsp', section: 'Pantry' },
      { item: 'Olive oil', qty: 2, unit: 'tbsp', section: 'Pantry' },
      { item: 'Butter', qty: 2, unit: 'tbsp', section: 'Dairy & Eggs' },
      { item: 'Salt & pepper', qty: 0, unit: 'to taste', section: 'Pantry' },
    ],
    steps: [
      'Preheat oven to 400°F (200°C).',
      'Combine panko, chopped parsley, dill, minced garlic, lemon zest, olive oil, salt, and pepper.',
      'Pat salmon dry. Brush tops generously with Dijon mustard.',
      'Press the herb-panko mixture firmly onto the mustard-coated tops.',
      'Sear salmon crust-side up in an oven-safe skillet over medium-high heat for 3 minutes.',
      'Transfer to oven and bake 12–15 minutes until crust is golden and fish flakes easily.',
      'Meanwhile, sauté asparagus in butter 4–5 minutes. Serve salmon with lemon wedges.',
    ],
    tags: ['high-protein', 'fancy', 'weekend', 'adult'],
    starred: true,
  },
]

async function seed() {
  console.log('Seeding 5 starter recipes…')
  const { data, error } = await supabase.from('recipes').insert(recipes).select('id, name')
  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
  for (const r of data) console.log(`  ✓ ${r.name}`)
  console.log(`\nDone — ${data.length} recipes added.`)
}

seed()
