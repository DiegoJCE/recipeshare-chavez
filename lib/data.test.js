import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { sampleRecipes } from './sampleRecipes.js';

const { neon } = vi.hoisted(() => ({ neon: vi.fn() }));
vi.mock('@neondatabase/serverless', () => ({ neon }));

const database = new PGlite();
const owner = { email: 'owner@example.com', googleSubject: 'google-owner' };
const reader = { email: 'reader@example.com', googleSubject: 'google-reader' };
const other = { email: owner.email, googleSubject: 'google-other' };
const [firstRecipe, secondRecipe] = sampleRecipes;
let data;

beforeAll(async () => {
  const sql = (parts, ...params) => ({
    query: parts.reduce((query, part, index) => index ? query + '$' + index + part : part, ''),
    params,
  });
  const execute = async (connection, { query, params }) => (await connection.query(query, params)).rows;
  const client = (...args) => {
    const statement = sql(...args);
    return { ...statement, then: (resolve, reject) => execute(database, statement).then(resolve, reject) };
  };
  client.transaction = (queries) => database.transaction(async (transaction) => {
    for (const statement of queries) await execute(transaction, statement);
  });
  neon.mockReturnValue(client);
  vi.stubEnv('DATABASE_URL', 'postgres://local-test');
  await (await import('./db.js')).getDatabase();

  // Reconstruct the schema before Google account IDs were added and save legacy rows.
  await database.exec(`
    ALTER TABLE recipes DROP COLUMN author_google_subject;
    ALTER TABLE ratings DROP COLUMN rater_google_subject;
  `);
  await database.query('UPDATE recipes SET author_email = $1 WHERE id = ANY($2)', [
    owner.email, [firstRecipe.id, secondRecipe.id],
  ]);
  await database.query('INSERT INTO ratings (recipe_id, value, rater_email) VALUES ($1, 2, $2)', [
    firstRecipe.id, reader.email,
  ]);

  vi.resetModules();
  data = await import('./data.js');
  await data.getRecipes();
}, 20000);

afterAll(async () => {
  vi.unstubAllEnvs();
  await database.close();
});

it('stores plain comment text and lists it only for the associated recipe', async () => {
  const body = '<b>Delicious!</b>\nI would make it again.';
  expect(await data.getComments(firstRecipe.id)).toEqual([]);
  expect(await data.addComment(firstRecipe.id, 'Google Name', body)).toBe(true);
  expect(await data.addComment('missing', 'Google Name', body)).toBe(false);
  expect(await data.getComments(firstRecipe.id)).toEqual([
    expect.objectContaining({ authorName: 'Google Name', body }),
  ]);
  expect(await data.getComments(secondRecipe.id)).toEqual([]);
});

it('saves one favorite per Google account, isolates removals, and cleans up deleted recipes', async () => {
  const { id } = await data.addRecipe({ ...firstRecipe, authorSubject: owner.googleSubject });
  expect(await data.isRecipeFavorite(id, owner)).toBe(false);
  await data.setRecipeFavorite(id, owner, true);
  await data.setRecipeFavorite(id, owner, true);
  expect(await data.isRecipeFavorite(id, owner)).toBe(true);
  expect(await data.getFavoriteRecipes(other)).toEqual([]);
  expect(await data.getFavoriteRecipes({ ...owner, email: reader.email }))
    .toMatchObject([{ id }]);
  expect((await database.query('SELECT recipe_id FROM favorites WHERE recipe_id = $1', [id])).rows)
    .toEqual([{ recipe_id: id }]);

  await data.setRecipeFavorite(id, other, true);
  await data.setRecipeFavorite(id, owner, false);
  expect(await data.getFavoriteRecipes(owner)).toEqual([]);
  expect(await data.getFavoriteRecipes(other)).toMatchObject([{ id }]);
  await data.deleteOwnedRecipe(id, owner);
  await data.setRecipeFavorite(id, other, true);
  expect(await data.isRecipeFavorite(id, other)).toBe(false);
});

it('lists legacy recipes on the owner profile and restricts direct edits and deletes', async () => {
  expect((await data.getRecipesByAuthor(owner)).map(({ id }) => id))
    .toEqual([firstRecipe.id, secondRecipe.id]);
  expect(await data.getRecipesByAuthor(reader)).toEqual([]);
  expect((await data.getRecipe(firstRecipe.id)).ratings).toEqual([2]);
  expect(await data.getRecipe('missing')).toBeNull();
  expect(await data.getOwnedRecipe(firstRecipe.id, reader)).toBeNull();
  expect(await data.updateOwnedRecipe(firstRecipe.id, reader, firstRecipe)).toBe(false);
  expect(await data.deleteOwnedRecipe(secondRecipe.id, reader)).toBe(false);
  expect(await data.deleteOwnedRecipe(secondRecipe.id, owner)).toBe(true);
});

async function addLegacyRating(recipeId, rating) {
  await database.query('INSERT INTO ratings (recipe_id, value, rater_email) VALUES ($1, $2, $3)', [
    recipeId, rating, reader.email,
  ]);
}

it('blocks legacy authors from rating their own recipes and replaces a prior email rating', async () => {
  const { id } = await data.addRecipe({ ...firstRecipe, authorEmail: owner.email });
  await addLegacyRating(id, 2);
  expect(await data.addRating(id, 5, owner)).toBe(false);
  expect((await data.getRecipe(id)).ratings).toEqual([2]);
  expect(await data.addRating(id, 4, reader)).toBe(true);
  expect((await data.getRecipe(id)).ratings).toEqual([4]);
  expect(await data.addRating(id, 5, { ...reader, email: 'new@example.com' })).toBe(true);
  expect((await data.getRecipe(id)).ratings).toEqual([5]);
});

it('collapses a legacy rating and an existing subject rating on the next submission', async () => {
  const { id } = await data.addRecipe(firstRecipe);
  await data.addRating(id, 4, reader);
  await addLegacyRating(id, 1);
  expect(await data.addRating(id, 3, reader)).toBe(true);
  expect((await data.getRecipe(id)).ratings).toEqual([3]);
});

it('binds a legacy recipe on edit and uses the subject for subsequent access', async () => {
  const { id } = await data.addRecipe({ ...firstRecipe, authorEmail: owner.email });
  const recipe = await data.getOwnedRecipe(id, owner);
  expect(await data.updateOwnedRecipe(recipe.id, owner, { ...recipe, title: 'Updated recipe' })).toBe(true);
  expect(await data.getOwnedRecipe(recipe.id, other)).toBeNull();
  expect(await data.deleteOwnedRecipe(recipe.id, other)).toBe(false);
  const ownerWithNewEmail = { ...owner, email: 'changed@example.com' };
  expect((await data.getOwnedRecipe(recipe.id, ownerWithNewEmail)).title).toBe('Updated recipe');
  expect(await data.addRating(recipe.id, 1, ownerWithNewEmail)).toBe(false);
  expect(await data.addRating(recipe.id, 1, other)).toBe(true);
});
