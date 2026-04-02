-- Family Meal Planner — Supabase Schema
-- Run this in the Supabase SQL editor before using the app.

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  servings integer NOT NULL DEFAULT 4,
  prep_time_min integer NOT NULL DEFAULT 0,
  cook_time_min integer NOT NULL DEFAULT 0,
  -- Generated: total cook time for "quick" filter
  total_time_min integer GENERATED ALWAYS AS (prep_time_min + cook_time_min) STORED,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  -- Generated: grams of protein per 100 calories (threshold 8 = moderately high protein)
  protein_ratio numeric GENERATED ALWAYS AS (
    CASE WHEN calories > 0 THEN protein_g * 100.0 / calories ELSE 0 END
  ) STORED,
  -- ingredients: [{item, qty, unit, section}]
  ingredients jsonb NOT NULL DEFAULT '[]',
  -- steps: ordered array of instruction strings
  steps text[] NOT NULL DEFAULT '{}',
  -- tags: e.g. ["kid-friendly","high-protein","big-cook","slow-cooker","no-cook","side"]
  tags text[] NOT NULL DEFAULT '{}',
  image_url text,
  starred boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Meal plans table — one row per position per week
-- Positions: big-cook-1, big-cook-2, slow-cooker, no-cook
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  position text NOT NULL CHECK (position IN ('big-cook-1','big-cook-2','slow-cooker','no-cook')),
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(week_start, position)
);

-- Meal sides table — sides linked to a meal position for a week
CREATE TABLE IF NOT EXISTS meal_sides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  position text NOT NULL CHECK (position IN ('big-cook-1','big-cook-2','slow-cooker','no-cook')),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(week_start, position, recipe_id)
);

-- Shopping lists table — one row per week, items stored as JSON
CREATE TABLE IF NOT EXISTS shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  -- items: [{id, name, qty, unit, section, checked, custom}]
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS (Row Level Security) — open policies for now, tighten for multi-user
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_sides ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on recipes" ON recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on meal_plans" ON meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on meal_sides" ON meal_sides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on shopping_lists" ON shopping_lists FOR ALL USING (true) WITH CHECK (true);
