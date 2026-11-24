import { neon } from '@neondatabase/serverless';
import { sampleRecipes } from './sampleRecipes.js';

let database;

export function getDatabase() {
  database ??= initializeDatabase().catch((error) => {
    database = undefined;
    throw error;
  });
  return database;
}

async function initializeDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required to access recipes.');

  const sql = neon(url);
  await sql.transaction([
    // Serialize setup across server instances so only one can seed an empty table.
    sql`SELECT pg_advisory_xact_lock(609230785)`,
    sql`
      CREATE TABLE IF NOT EXISTS recipes (
        id text PRIMARY KEY,
        "authorName" text NOT NULL,
        title text NOT NULL,
        cuisine text NOT NULL,
        category text NOT NULL,
        ingredients jsonb NOT NULL,
        steps jsonb NOT NULL,
        "prepTimeMinutes" bigint NOT NULL CHECK ("prepTimeMinutes" > 0),
        "imageUrl" text NOT NULL,
        position bigint GENERATED ALWAYS AS IDENTITY
      )
    `,
    sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS dietary_tags text[] NOT NULL DEFAULT '{}'`,
    sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS author_email text`,
    sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS video_url text`,
    sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS author_google_subject text`,
    sql`
      CREATE TABLE IF NOT EXISTS ratings (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        recipe_id text NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
        value smallint NOT NULL CHECK (value BETWEEN 1 AND 5)
      )
    `,
    sql`CREATE INDEX IF NOT EXISTS ratings_recipe_id_idx ON ratings (recipe_id, id)`,
    sql`ALTER TABLE ratings ADD COLUMN IF NOT EXISTS rater_email text`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS ratings_recipe_rater_idx ON ratings (recipe_id, rater_email)`,
    sql`ALTER TABLE ratings ADD COLUMN IF NOT EXISTS rater_google_subject text`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS ratings_recipe_google_rater_idx ON ratings (recipe_id, rater_google_subject)`,
    sql`
      CREATE TABLE IF NOT EXISTS comments (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        recipe_id text NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
        author_name text NOT NULL,
        body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500)
      )
    `,
    sql`CREATE INDEX IF NOT EXISTS comments_recipe_id_idx ON comments (recipe_id, id)`,
    sql`
      CREATE TABLE IF NOT EXISTS favorites (
        user_google_subject text NOT NULL,
        recipe_id text NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
        PRIMARY KEY (user_google_subject, recipe_id)
      )
    `,
    sql`
      INSERT INTO recipes (
        id, "authorName", title, cuisine, category, ingredients, steps, "prepTimeMinutes", "imageUrl"
      )
      SELECT id, "authorName", title, cuisine, category, ingredients, steps, "prepTimeMinutes", "imageUrl"
      FROM jsonb_to_recordset(${JSON.stringify(sampleRecipes)}::jsonb) AS sample (
        id text, "authorName" text, title text, cuisine text, category text,
        ingredients jsonb, steps jsonb, "prepTimeMinutes" bigint, "imageUrl" text
      )
      WHERE NOT EXISTS (SELECT 1 FROM recipes)
    `,
  ]);
  return sql;
}
