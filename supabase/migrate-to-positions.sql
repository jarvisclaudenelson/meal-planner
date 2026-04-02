-- Migration: Convert from day/slot meal plans to position-based meal plans
-- Run this ONCE against your live Supabase DB.

-- 1. Drop old meal_plans table (data will be lost — this is intentional per redesign)
DROP TABLE IF EXISTS meal_plans CASCADE;

-- 2. Create new meal_plans with position-based structure
CREATE TABLE meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  position text NOT NULL CHECK (position IN ('big-cook-1','big-cook-2','slow-cooker','no-cook')),
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(week_start, position)
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on meal_plans" ON meal_plans FOR ALL USING (true) WITH CHECK (true);

-- 3. Create meal_sides table
CREATE TABLE IF NOT EXISTS meal_sides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  position text NOT NULL CHECK (position IN ('big-cook-1','big-cook-2','slow-cooker','no-cook')),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(week_start, position, recipe_id)
);

ALTER TABLE meal_sides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on meal_sides" ON meal_sides FOR ALL USING (true) WITH CHECK (true);
