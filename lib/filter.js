export function filterRecipes(recipes, { cuisine, category, q = '', dietaryTag }) {
  const keyword = q.trim().toLowerCase();
  return recipes.filter(
    (recipe) =>
      (!cuisine || recipe.cuisine === cuisine) &&
      (!category || recipe.category === category) &&
      (!dietaryTag || recipe.dietaryTags?.includes(dietaryTag)) &&
      (!keyword || recipe.title.toLowerCase().includes(keyword) ||
        recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(keyword))),
  );
}
