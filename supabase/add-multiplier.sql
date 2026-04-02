-- Add multiplier column to meal_plans and meal_sides
-- Default 1 = normal serving, 2 = doubled, etc.
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS multiplier integer NOT NULL DEFAULT 1;
ALTER TABLE meal_sides ADD COLUMN IF NOT EXISTS multiplier integer NOT NULL DEFAULT 1;
