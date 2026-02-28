# Claude Code Prompt — Family Meal Planner App

Build a full-stack PWA (Progressive Web App) family meal planner. Here is the complete spec.

---

## Stack
- **Frontend:** React + Vite + Tailwind CSS (PWA, installable on iOS and Android)
- **Backend/DB:** Supabase (Postgres + REST API + Auth)
- **Deploy:** Vercel
- **Package manager:** npm

---

## Core Features

### 1. Recipe Database
- Store recipes with:
  - Name, description, image URL
  - Ingredients (list with quantities)
  - Instructions (step-by-step, clean — no ads, no fluff)
  - Prep time, cook time, total time
  - Servings
  - Protein per serving (grams)
  - Calories per serving
  - Protein ratio (calculated: grams protein / calories * 100 — target is 10g per 100 cal)
  - Tags: `kid-friendly`, `high-protein`, `quick`, `weekend`, `leftovers-well`, etc.
  - Source URL (optional)
  - Starred/favorited (boolean, per family — shared across all users)
  - Created at, last used date

### 2. Meal Planning
- Weekly view (Mon–Sun)
- Assign recipes to dinner slots (primary use case)
- Optional: lunch slots for Erik
- Each slot shows: recipe name, protein per serving, prep+cook time
- "Plan this week" workflow — see recipe suggestions, drag or tap to assign
- Mark meals as cooked (tracks last used date on recipe)

### 3. Recipe Detail View
- Clean, mobile-optimized recipe display
- Large ingredient list with checkbox per item (check off as you cook)
- Step-by-step instructions, one step at a time view option
- Protein ratio badge (green if ≥8g/100cal, yellow if 5-8, red if <5)
- "Add protein" suggestions if ratio is low (e.g., "Add a chicken breast: +50g protein")
- Kid-friendly badge if tagged
- Star/favorite button

### 4. Shopping List
- Auto-generated from the week's meal plan
- Consolidated ingredients (combine duplicates, sum quantities)
- Organized by store section:
  1. Produce
  2. Meat & Seafood
  3. Dairy & Eggs
  4. Pantry & Dry Goods
  5. Frozen
  6. Bread & Bakery
  7. Other
- Tap to check off items as you shop
- Ability to add custom items
- "Reset" button to uncheck all (for next shopping trip)
- Export/share as plain text

### 5. Cook Timing
- Each recipe has prep time + cook time
- On the meal plan view, show "Start by [time]" based on a target dinner time (default 6:30pm, configurable)
- Daily brief integration: expose a simple JSON endpoint or flat file with today's planned meal + start time

### 6. Favorites / Recipe Library
- Starred recipes show at top of recipe list
- Filter by: starred, kid-friendly, high-protein, quick (<30 min)
- Search by name or ingredient
- Sort by: protein ratio, last used, name

---

## Supabase Schema

### `recipes` table
```sql
id uuid primary key default gen_random_uuid()
name text not null
description text
image_url text
source_url text
prep_time_min integer
cook_time_min integer
servings integer
calories_per_serving integer
protein_per_serving_g integer
protein_ratio numeric generated always as (
  case when calories_per_serving > 0
  then (protein_per_serving_g::numeric / calories_per_serving) * 100
  else 0 end
) stored
ingredients jsonb  -- array of {item, quantity, unit, section}
instructions jsonb -- array of {step, text}
tags text[]
starred boolean default false
last_used_at timestamptz
created_at timestamptz default now()
```

### `meal_plans` table
```sql
id uuid primary key default gen_random_uuid()
week_start date not null  -- Monday of the week
day text not null          -- 'monday' through 'sunday'
meal_type text not null    -- 'dinner' or 'lunch'
recipe_id uuid references recipes(id)
servings integer default 4
notes text
created_at timestamptz default now()
```

### `shopping_lists` table
```sql
id uuid primary key default gen_random_uuid()
week_start date not null
items jsonb  -- array of {ingredient, quantity, unit, section, checked}
custom_items jsonb default '[]'
created_at timestamptz default now()
updated_at timestamptz default now()
```

---

## API / Data Access
- Use Supabase JS client (`@supabase/supabase-js`)
- No user auth required (family app, single shared account — use Supabase anon key with RLS disabled for now)
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## PWA Requirements
- `manifest.json` with app name "Meal Planner", icons for iOS and Android
- Service worker for offline support (at minimum: cache recipe detail pages and current shopping list)
- "Add to Home Screen" prompt on first visit
- Mobile-first layout, large touch targets, works well in Safari and Chrome

---

## UI / UX Notes
- Bottom tab navigation: **Plan** | **Recipes** | **Shopping** | **Today**
- **Today** tab: shows today's planned meal, start time, and a quick link to the recipe
- Clean, minimal design — this is used in the kitchen, it needs to be readable at a glance
- Dark mode support preferred
- No unnecessary animations — fast and functional

---

## Seed Data
Include 5 starter recipes in a seed script (`scripts/seed.js`) that match these criteria:
1. High protein, kid-friendly (e.g., homemade burgers, chicken tacos)
2. High protein, adult-focused (e.g., ground beef stir fry, sheet pan chicken thighs)
3. Quick weeknight option (<30 min total)
4. Good for leftovers (makes 6+ servings)
5. One "fancy weekend" option

Each recipe should have realistic protein/calorie numbers, full ingredients, and clean instructions.

---

## Project Structure
```
meal-planner-app/
  src/
    components/
    pages/
      Plan.jsx
      Recipes.jsx
      RecipeDetail.jsx
      Shopping.jsx
      Today.jsx
    lib/
      supabase.js
    hooks/
  public/
    manifest.json
    icons/
  scripts/
    seed.js
  supabase/
    schema.sql
  .env.example
  README.md
```

---

## README Requirements
Include in README.md:
1. Setup instructions (clone, npm install, create Supabase project, add env vars, run seed)
2. How to deploy to Vercel
3. How to add recipes (manual + via Jarvis on Discord)
4. Schema overview

---

## Out of Scope (for now)
- Multi-user auth / separate profiles
- Nutrition tracking beyond protein ratio
- Grocery delivery integration
- iOS/Android native app

---

## Notes
- This app is used by Erik (Android) and his wife (iPhone) — test that PWA install works on both
- The shopping list needs to survive a page refresh (persisted in Supabase, not just local state)
- Recipe intake from external sources (Instagram, websites) will be handled externally by an AI agent — the app just needs a clean Supabase insert path
