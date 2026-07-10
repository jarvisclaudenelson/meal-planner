-- Keep Griddle and Slow Cooker as distinct year-round meal-plan positions.

ALTER TABLE public.meal_plans
  DROP CONSTRAINT IF EXISTS meal_plans_position_check;

ALTER TABLE public.meal_plans
  ADD CONSTRAINT meal_plans_position_check
  CHECK (position ~ '^(big-cook|slow-cooker|griddle|no-cook)-\d+$');

ALTER TABLE public.meal_sides
  DROP CONSTRAINT IF EXISTS meal_sides_position_check;

ALTER TABLE public.meal_sides
  ADD CONSTRAINT meal_sides_position_check
  CHECK (position ~ '^(big-cook|slow-cooker|griddle|no-cook)-\d+$');

-- Griddle meals created before this migration reused slow-cooker-N positions.
UPDATE public.meal_plans AS meal_plan
SET position = regexp_replace(meal_plan.position, '^slow-cooker-', 'griddle-')
FROM public.recipes AS recipe
WHERE meal_plan.recipe_id = recipe.id
  AND 'griddle' = ANY(recipe.tags)
  AND meal_plan.position ~ '^slow-cooker-\d+$';

-- Move the corresponding sides to the newly distinct griddle positions.
UPDATE public.meal_sides AS side
SET position = regexp_replace(side.position, '^slow-cooker-', 'griddle-')
WHERE side.position ~ '^slow-cooker-\d+$'
  AND EXISTS (
    SELECT 1
    FROM public.meal_plans AS meal_plan
    WHERE meal_plan.week_start = side.week_start
      AND meal_plan.position = regexp_replace(side.position, '^slow-cooker-', 'griddle-')
  );
