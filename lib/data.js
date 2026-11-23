import { randomUUID } from 'node:crypto';
import { getDatabase } from './db.js';

function selectRecipes(sql, id = null) {
  return sql`
    SELECT r.id, r."authorName", r.title, r.cuisine, r.category, r.ingredients,
      r.steps, r."prepTimeMinutes"::double precision AS "prepTimeMinutes", r."imageUrl",
      ARRAY(SELECT value FROM ratings WHERE recipe_id = r.id ORDER BY id) AS ratings
    FROM recipes AS r
    WHERE (${id}::text IS NULL OR r.id = ${id})
    ORDER BY r.position
  `;
}

export async function getRecipes() {
  const sql = await getDatabase();
  return selectRecipes(sql);
}

export async function getRecipe(id) {
  if (typeof id !== 'string') return null;

  const sql = await getDatabase();
  const [recipe] = await selectRecipes(sql, id);
  return recipe ?? null;
}

export async function addRecipe(fields) {
  const sql = await getDatabase();
  const { authorName, title, cuisine, category, ingredients, steps, prepTimeMinutes, imageUrl } = fields;
  const id = randomUUID();
  await sql`
    INSERT INTO recipes (
      id, "authorName", title, cuisine, category, ingredients, steps, "prepTimeMinutes", "imageUrl"
    )
    VALUES (
      ${id}, ${authorName}, ${title}, ${cuisine}, ${category},
      ${JSON.stringify(ingredients)}::jsonb, ${JSON.stringify(steps)}::jsonb,
      ${prepTimeMinutes}, ${imageUrl}
    )
  `;
  return { id, authorName, title, cuisine, category, ingredients, steps, prepTimeMinutes, imageUrl, ratings: [] };
}

export async function addRating(id, rating) {
  if (typeof id !== 'string') return null;

  const sql = await getDatabase();
  const [, [recipe]] = await sql.transaction([
    sql`
      INSERT INTO ratings (recipe_id, value)
      SELECT id, ${rating} FROM recipes WHERE id = ${id}
    `,
    selectRecipes(sql, id),
  ]);
  return recipe ?? null;
}
