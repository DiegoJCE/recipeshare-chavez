import { expect, test } from 'vitest';
import { sampleRecipes } from './sampleRecipes.js';
import { validateRecipe } from './validate.js';

test('includes at least two recipes with different cuisines and categories', () => {
  expect(sampleRecipes.length).toBeGreaterThanOrEqual(2);
  expect(sampleRecipes.some((recipe) => sampleRecipes.some((other) => (
    recipe.cuisine !== other.cuisine && recipe.category !== other.category
  )))).toBe(true);
});

test.each(sampleRecipes)('$title passes recipe validation', (recipe) => {
  expect(validateRecipe(recipe)).toEqual({});
});
