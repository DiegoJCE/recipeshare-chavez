import { randomUUID } from 'node:crypto';

const recipes = [
  {
    id: 'black-bean-tacos',
    authorName: 'RecipeShare',
    title: 'Black Bean Tacos',
    cuisine: 'Mexican',
    category: 'Main Dish',
    ingredients: ['Black beans', 'Corn tortillas', 'Red onion', 'Lime'],
    steps: [
      'Warm the beans and tortillas.',
      'Fill the tortillas with beans and top with diced onion and lime juice.',
    ],
    prepTimeMinutes: 15,
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b',
    ratings: [],
  },
  {
    id: 'vanilla-berry-pancakes',
    authorName: 'RecipeShare',
    title: 'Vanilla Berry Pancakes',
    cuisine: 'American',
    category: 'Breakfast',
    ingredients: ['Pancake mix', 'Milk', 'Vanilla extract', 'Mixed berries'],
    steps: [
      'Prepare the pancake batter according to the mix directions and stir in vanilla.',
      'Cook on a hot griddle until golden on both sides and top with berries.',
    ],
    prepTimeMinutes: 20,
    imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93',
    ratings: [],
  },
];

export async function getRecipes() {
  return structuredClone(recipes);
}

export async function getRecipe(id) {
  const recipe = recipes.find((entry) => entry.id === id);
  return recipe ? structuredClone(recipe) : null;
}

export async function addRecipe(fields) {
  const recipe = { ...structuredClone(fields), id: randomUUID(), ratings: [] };
  recipes.push(recipe);
  return structuredClone(recipe);
}

export async function addRating(id, rating) {
  const recipe = recipes.find((entry) => entry.id === id);
  if (!recipe) return null;

  recipe.ratings.push(rating);
  return structuredClone(recipe);
}
