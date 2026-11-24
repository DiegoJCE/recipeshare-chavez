import { describe, expect, it } from 'vitest';
import { filterRecipes } from './filter';

const iranianMainDish = { cuisine: 'Iranian', category: 'Main Dish' };
const iranianDessert = { cuisine: 'Iranian', category: 'Dessert' };
const mexicanMainDish = { cuisine: 'Mexican', category: 'Main Dish' };
const recipes = [iranianMainDish, iranianDessert, mexicanMainDish];

describe('filterRecipes', () => {
  it('combines a dietary tag with other filters and handles older recipes without tags', () => {
    const spicy = { ...iranianMainDish, dietaryTags: ['vegetarian', 'spicy'] };
    const otherCuisine = { ...mexicanMainDish, dietaryTags: ['spicy'] };
    const tagged = [spicy, otherCuisine, iranianMainDish];
    expect(filterRecipes(tagged, { cuisine: 'Iranian', dietaryTag: 'spicy' })).toEqual([spicy]);
    expect(filterRecipes(tagged, { dietaryTag: '' })).toEqual(tagged);
  });
  it('matches titles and ingredients case-insensitively and combines search with both filters', () => {
    const titleMatch = { ...iranianMainDish, title: 'Rice pilaf', ingredients: ['Butter'] };
    const ingredientMatch = { ...iranianMainDish, title: 'Tahdig', ingredients: ['Basmati rice'] };
    const wrongCategory = { ...titleMatch, category: 'Dessert' };
    const wrongCuisine = { ...ingredientMatch, cuisine: 'Mexican' };
    const noKeyword = { ...titleMatch, title: 'Kebab' };
    expect(filterRecipes([titleMatch, ingredientMatch, wrongCategory, wrongCuisine, noKeyword], {
      cuisine: 'Iranian', category: 'Main Dish', q: ' RICE ',
    })).toEqual([titleMatch, ingredientMatch]);
  });
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
