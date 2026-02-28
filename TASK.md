# Meal Planner Agent — Task

## Run Instructions
Each run (Wednesday): generate next week's meal plan and grocery list.

## Steps
1. Read `projects/meal-planner/STATE.md` for recent meals (avoid repetition)
2. Plan 3-4 dinners for the week (Saturday/Sunday cook days)
   - 2+ kid-friendly (burgers, nuggets, pasta, pizza)
   - All hitting protein targets
   - Include estimated protein per meal
3. Add lunch/snack options to hit 200g protein total for Erik
4. Generate grocery list sorted by section (Produce, Meat, Dairy, Pantry, Frozen)
5. Update Google Sheet `1WXqp-H-wefbt895eGc8e7S57nTw_BGWlgppBTv3-1XU`
6. Save meal plan to `meal-planner/plans/YYYY-MM-DD.md`
7. Save grocery list to `meal-planner/grocery/YYYY-MM-DD.md`
8. Commit and push:
   ```bash
   cd /home/node/.openclaw/workspace/meal-planner
   git add -A
   git commit -m "Meal plan week of YYYY-MM-DD"
   git push
   ```
9. Update `projects/meal-planner/STATE.md`
10. Send grocery list to Erik via Discord DM on Wednesday evening

## Trigger
- Wednesday cron (evening, ~6pm CT)
- Or on-demand when Erik asks
