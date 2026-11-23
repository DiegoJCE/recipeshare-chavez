import { beforeEach, describe, expect, it, vi } from 'vitest';
import { averageRating } from './ratings.js';
import { sampleRecipes } from './sampleRecipes.js';

vi.doMock('./db.js', () => ({ getDatabase: vi.fn() }));

const { addRating, getRecipe, getRecipes } = await import('./data.js');
const { getDatabase } = await import('./db.js');

const sql = vi.fn();

beforeEach(() => {
  sql.mockReset();
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
  const transaction = vi.fn().mockResolvedValue([[], [recipe]]);
  vi.mocked(getDatabase).mockResolvedValue(Object.assign(sql, { transaction }));

  const updated = await addRating(recipe.id, 4);

  expect(sql).toHaveBeenNthCalledWith(1, expect.any(Array), 4, recipe.id);
  expect(transaction).toHaveBeenCalledWith([write, read]);
  expect(averageRating(updated.ratings)).toBe(3.5);
  expect(updated.ratings).toHaveLength(2);
});
