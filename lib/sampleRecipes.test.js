import { expect, test } from 'vitest';
import { CATEGORIES, CUISINES } from './constants.js';
import { sampleRecipes } from './sampleRecipes.js';
import { validateRecipe } from './validate.js';

test('includes at least two recipes with different cuisines and categories', () => {
  expect(sampleRecipes.length).toBeGreaterThanOrEqual(2);
  expect(new Set(sampleRecipes.map(({ cuisine }) => cuisine)).size).toBe(sampleRecipes.length);
  expect(new Set(sampleRecipes.map(({ category }) => category)).size).toBe(sampleRecipes.length);
});

test.each(sampleRecipes)('$title uses the fixed lists and passes validation', (recipe) => {
  expect(CUISINES).toContain(recipe.cuisine);
  expect(CATEGORIES).toContain(recipe.category);
  expect(validateRecipe(recipe)).toEqual({});
});
