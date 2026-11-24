import { randomUUID } from 'node:crypto';
import { getDatabase } from './db.js';

function selectRecipes(sql, { id = null, user = null, favoriteSubject = null } = {}) {
  const { googleSubject = null, email = null } = user ?? {};
  return sql`
    SELECT r.id, r."authorName", r.title, r.cuisine, r.category, r.ingredients,
      r.steps, r."prepTimeMinutes"::double precision AS "prepTimeMinutes", r."imageUrl",
      r.dietary_tags AS "dietaryTags", r.position,
      ARRAY(SELECT value FROM ratings WHERE recipe_id = r.id ORDER BY id) AS ratings
    FROM recipes AS r
    WHERE (${id}::text IS NULL OR r.id = ${id})
      AND (${googleSubject}::text IS NULL OR r.author_google_subject = ${googleSubject}
        OR (r.author_google_subject IS NULL AND r.author_email = ${email}))
      AND (${favoriteSubject}::text IS NULL OR EXISTS (
        SELECT 1 FROM favorites WHERE recipe_id = r.id AND user_google_subject = ${favoriteSubject}
      ))
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
  const [recipe] = await selectRecipes(sql, { id });
  return recipe ?? null;
}

export async function getComments(recipeId) {
  const sql = await getDatabase();
  return sql`
    SELECT id, author_name AS "authorName", body
    FROM comments
    WHERE recipe_id = ${recipeId}
    ORDER BY id
  `;
}

export async function getFavoriteRecipes(user) {
  const sql = await getDatabase();
  return selectRecipes(sql, { favoriteSubject: user.googleSubject });
}

export async function isRecipeFavorite(id, user) {
  const sql = await getDatabase();
  const [favorite] = await sql`
    SELECT 1 FROM favorites WHERE user_google_subject = ${user.googleSubject} AND recipe_id = ${id}
  `;
  return Boolean(favorite);
}

export async function setRecipeFavorite(id, user, favorite) {
  const sql = await getDatabase();
  if (favorite) {
    await sql`
      INSERT INTO favorites (user_google_subject, recipe_id)
      SELECT ${user.googleSubject}, id FROM recipes WHERE id = ${id}
      FOR KEY SHARE
      ON CONFLICT (user_google_subject, recipe_id) DO NOTHING
    `;
  } else {
    await sql`
      DELETE FROM favorites WHERE user_google_subject = ${user.googleSubject} AND recipe_id = ${id}
    `;
  }
}

export async function addComment(recipeId, authorName, body) {
  const sql = await getDatabase();
  const rows = await sql`
    INSERT INTO comments (recipe_id, author_name, body)
    SELECT id, ${authorName}, ${body} FROM recipes WHERE id = ${recipeId}
    FOR KEY SHARE
    RETURNING id
  `;
  return rows.length > 0;
}

export async function getRecipesByAuthor(user) {
  if (!user?.googleSubject || !user.email) return [];

  const sql = await getDatabase();
  return selectRecipes(sql, { user });
}

export async function getOwnedRecipe(id, user) {
  if (typeof id !== 'string' || !user?.googleSubject || !user.email) return null;

  const sql = await getDatabase();
  const [recipe] = await selectRecipes(sql, { id, user });
  return recipe ?? null;
}

export async function updateOwnedRecipe(id, user, fields) {
  if (typeof id !== 'string' || !user?.googleSubject || !user.email) return false;

  const sql = await getDatabase();
  const { title, cuisine, category, ingredients, steps, prepTimeMinutes, imageUrl, dietaryTags } = fields;
  const rows = await sql`
    UPDATE recipes
    SET author_google_subject = ${user.googleSubject}, title = ${title}, cuisine = ${cuisine}, category = ${category},
      ingredients = ${JSON.stringify(ingredients)}::jsonb, steps = ${JSON.stringify(steps)}::jsonb,
      "prepTimeMinutes" = ${prepTimeMinutes}, "imageUrl" = ${imageUrl},
      dietary_tags = ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(dietaryTags)}::jsonb))
    WHERE id = ${id} AND (
      author_google_subject = ${user.googleSubject}
      OR (author_google_subject IS NULL AND author_email = ${user.email})
    )
    RETURNING id
  `;
  return rows.length > 0;
}

export async function deleteOwnedRecipe(id, user) {
  if (typeof id !== 'string' || !user?.googleSubject || !user.email) return false;

  const sql = await getDatabase();
  const rows = await sql`
    DELETE FROM recipes WHERE id = ${id} AND (
      author_google_subject = ${user.googleSubject}
      OR (author_google_subject IS NULL AND author_email = ${user.email})
    )
    RETURNING id
  `;
  return rows.length > 0;
}

export async function addRecipe(fields) {
  const sql = await getDatabase();
  const { authorName, title, cuisine, category, ingredients, steps, prepTimeMinutes, imageUrl, dietaryTags = [], authorEmail = null, authorSubject = null } = fields;
  const id = randomUUID();
  await sql`
    INSERT INTO recipes (
      id, "authorName", title, cuisine, category, ingredients, steps, "prepTimeMinutes", "imageUrl", dietary_tags, author_email, author_google_subject
    )
    VALUES (
      ${id}, ${authorName}, ${title}, ${cuisine}, ${category},
      ${JSON.stringify(ingredients)}::jsonb, ${JSON.stringify(steps)}::jsonb,
      ${prepTimeMinutes}, ${imageUrl}, ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(dietaryTags)}::jsonb)),
      ${authorEmail}, ${authorSubject}
    )
  `;
  return { id, authorName, title, cuisine, category, ingredients, steps, prepTimeMinutes, imageUrl, dietaryTags, ratings: [] };
}

export async function addRating(id, rating, user) {
  if (typeof id !== 'string' || !user?.googleSubject || !user.email) return false;

  const sql = await getDatabase();
  const rows = await sql`
    WITH eligible_recipe AS (
      SELECT id FROM recipes
      WHERE id = ${id} AND author_google_subject IS DISTINCT FROM ${user.googleSubject}
        AND (author_google_subject IS NOT NULL OR author_email IS DISTINCT FROM ${user.email})
      FOR NO KEY UPDATE
    ), removed_legacy_rating AS (
      DELETE FROM ratings
      USING eligible_recipe
      WHERE ratings.recipe_id = eligible_recipe.id
        AND rater_google_subject IS NULL AND rater_email = ${user.email}
    )
    INSERT INTO ratings (recipe_id, value, rater_google_subject)
    SELECT id, ${rating}, ${user.googleSubject} FROM eligible_recipe
    ON CONFLICT (recipe_id, rater_google_subject) DO UPDATE SET value = EXCLUDED.value
    RETURNING id
  `;
  return rows.length > 0;
}
