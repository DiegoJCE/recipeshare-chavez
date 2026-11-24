import { expect, it } from 'vitest';
import { scaleIngredient } from './servings.js';

it('scales leading amounts, including fractions and ranges', () => {
  expect(scaleIngredient('2 cups rice', 2, 4)).toBe('4 cups rice');
  expect(scaleIngredient('1½ cups milk', 2, 4)).toBe('3 cups milk');
  expect(scaleIngredient('1 1/4 cups water', 2, 4)).toBe('2.5 cups water');
  expect(scaleIngredient('2–4 cloves garlic', 2, 1)).toBe('1–2 cloves garlic');
  expect(scaleIngredient('0.5 tsp salt', 2, 1)).toBe('0.25 tsp salt');
});

it('keeps unquantified ingredients and invalid or unchanged yields intact', () => {
  expect(scaleIngredient('Salt to taste', 2, 4)).toBe('Salt to taste');
  expect(scaleIngredient('½ cup milk', 2, 2)).toBe('½ cup milk');
  expect(scaleIngredient('2 cups rice', 0, 4)).toBe('2 cups rice');
});
