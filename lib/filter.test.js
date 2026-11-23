import { describe, expect, it } from 'vitest';
import { filterRecipes } from './filter';

const iranianMainDish = { cuisine: 'Iranian', category: 'Main Dish' };
const iranianDessert = { cuisine: 'Iranian', category: 'Dessert' };
const mexicanMainDish = { cuisine: 'Mexican', category: 'Main Dish' };
const recipes = [iranianMainDish, iranianDessert, mexicanMainDish];

describe('filterRecipes', () => {
  it('returns only recipes matching both cuisine and category', () => {
    expect(filterRecipes(recipes, { cuisine: 'Iranian', category: 'Main Dish' })).toEqual([
      iranianMainDish,
    ]);
  });

  it('applies each filter independently', () => {
    expect(filterRecipes(recipes, { cuisine: 'Iranian', category: '' })).toEqual([
      iranianMainDish,
      iranianDessert,
    ]);
    expect(filterRecipes(recipes, { cuisine: '', category: 'Main Dish' })).toEqual([
      iranianMainDish,
      mexicanMainDish,
    ]);
  });

  it('returns all recipes when both filters are empty', () => {
    expect(filterRecipes(recipes, { cuisine: '', category: '' })).toEqual(recipes);
  });

  it('returns an empty list when no recipe matches', () => {
    expect(filterRecipes(recipes, { cuisine: 'Mexican', category: 'Dessert' })).toEqual([]);
  });
});
