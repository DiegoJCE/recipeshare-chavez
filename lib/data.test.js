import { describe, expect, it } from 'vitest';
import { getRecipe, getRecipes } from './data';

describe('getRecipe', () => {
  it('returns the recipe matching the requested id', async () => {
    const recipes = await getRecipes();
    const recipe = recipes.find(({ id }) => id === 'vanilla-berry-pancakes');

    expect(recipe).toBeDefined();
    await expect(getRecipe('vanilla-berry-pancakes')).resolves.toEqual(recipe);
  });

  it('returns null for an unknown id', async () => {
    await expect(getRecipe('unknown-recipe')).resolves.toBeNull();
  });
});
