import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addRating, getRecipe, getRecipes } from './data.js';
import { getDatabase } from './db.js';
import { sampleRecipes } from './sampleRecipes.js';

vi.mock('./db.js', () => ({ getDatabase: vi.fn() }));

const sql = vi.fn();
sql.transaction = vi.fn();

beforeEach(() => {
  sql.mockReset();
  sql.transaction.mockReset();
  vi.mocked(getDatabase).mockResolvedValue(sql);
});

describe('recipe reads', () => {
  it('returns all recipes when no id is requested', async () => {
    sql.mockResolvedValue(sampleRecipes);

    await expect(getRecipes()).resolves.toEqual(sampleRecipes);
    expect(sql).toHaveBeenCalledWith(expect.any(Array), null, null);
  });

  it('queries and returns the recipe matching the requested id', async () => {
    const recipe = sampleRecipes[1];
    sql.mockResolvedValue([recipe]);

    await expect(getRecipe(recipe.id)).resolves.toEqual(recipe);
    expect(sql).toHaveBeenCalledWith(expect.any(Array), recipe.id, recipe.id);
  });

  it('returns null for an unknown id', async () => {
    sql.mockResolvedValue([]);

    await expect(getRecipe('unknown-recipe')).resolves.toBeNull();
  });
});

it('returns the updated recipe and ratings from the write transaction', async () => {
  const recipe = { ...sampleRecipes[0], ratings: [3, 4] };
  const write = {};
  const read = {};
  sql.mockReturnValueOnce(write).mockReturnValueOnce(read);
  sql.transaction.mockResolvedValue([[], [recipe]]);

  const updated = await addRating(recipe.id, 4);

  expect(sql).toHaveBeenNthCalledWith(1, expect.any(Array), 4, recipe.id);
  expect(sql.transaction).toHaveBeenCalledWith([write, read]);
  expect(updated).toEqual(recipe);
});

it('returns null when rating an unknown recipe', async () => {
  sql.transaction.mockResolvedValue([[], []]);

  await expect(addRating('unknown-recipe', 4)).resolves.toBeNull();
});
