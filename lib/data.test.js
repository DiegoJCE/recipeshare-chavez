import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRecipe, getRecipes, getRecipesByAuthor } from './data.js';
import { getDatabase } from './db.js';
import { sampleRecipes } from './sampleRecipes.js';

vi.mock('./db.js', () => ({ getDatabase: vi.fn() }));

const sql = vi.fn();

beforeEach(() => {
  sql.mockReset();
  vi.mocked(getDatabase).mockResolvedValue(sql);
});

describe('recipe reads', () => {
  it('returns all recipes when no id is requested', async () => {
    sql.mockResolvedValue(sampleRecipes);

    await expect(getRecipes()).resolves.toEqual(sampleRecipes);
    expect(sql).toHaveBeenCalledWith(expect.any(Array), null, null, null, null);
  });

  it('queries and returns the recipe matching the requested id', async () => {
    const recipe = sampleRecipes[1];
    sql.mockResolvedValue([recipe]);

    await expect(getRecipe(recipe.id)).resolves.toEqual(recipe);
    expect(sql).toHaveBeenCalledWith(expect.any(Array), recipe.id, recipe.id, null, null);
  });

  it('scopes profile recipes to the account email and skips queries without one', async () => {
    const email = 'cook@example.com';
    sql.mockResolvedValue([sampleRecipes[0]]);

    await expect(getRecipesByAuthor(null)).resolves.toEqual([]);
    expect(sql).not.toHaveBeenCalled();
    await expect(getRecipesByAuthor(email)).resolves.toEqual([sampleRecipes[0]]);
    expect(sql).toHaveBeenCalledWith(expect.any(Array), null, null, email, email);
    expect(sql.mock.calls[0][0].join('?')).toContain('r.author_email = ?');
  });

  it('returns null for an unknown id', async () => {
    sql.mockResolvedValue([]);

    await expect(getRecipe('unknown-recipe')).resolves.toBeNull();
  });
});
