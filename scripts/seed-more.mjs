import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { neon } from '@neondatabase/serverless';

const unsplash = (photo) => `https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=960&q=80`;

const recipes = [
  {
    title: 'Japanese Salmon Nigiri',
    cuisine: 'Japanese',
    category: 'Main Dish',
    prepTimeMinutes: 25,
    dietaryTags: ['gluten-free'],
    imageUrl: unsplash('1680675228874-9b9963812b7c'),
    ingredients: [
      '1 cup Japanese short-grain rice', '1 1/4 cups water', '2 tbsp unseasoned rice vinegar',
      '1 tbsp sugar', '1/2 tsp fine salt', '8 oz skinless salmon fillet', '1 tsp neutral oil',
      '1 sheet plain nori', '2 tbsp gluten-free tamari', '2 tbsp pickled ginger',
    ],
    steps: [
      'Rinse and drain the rice. Add the water, bring to a boil, cover, and cook on low for 15 minutes. Turn off the heat and rest, covered, for 10 minutes.',
      'Stir the vinegar, sugar, and salt together until dissolved. Fold into the hot rice and let it cool until just warm.',
      'Pat the salmon dry, brush with oil, and cook in a hot skillet until the center reaches 145°F (63°C). Rest briefly, then slice across the grain into 12 portions.',
      'With damp hands, shape the rice into 12 small ovals. Top each with salmon and wrap the center with a thin strip of nori. Serve with tamari and pickled ginger.',
    ],
  },
  {
    title: 'Blueberry Buttermilk Pancakes',
    cuisine: 'American',
    category: 'Breakfast',
    prepTimeMinutes: 10,
    dietaryTags: ['vegetarian'],
    imageUrl: unsplash('1650134973809-d8c3a2da59ba'),
    ingredients: [
      '1 1/2 cups all-purpose flour', '2 tbsp sugar', '1 1/2 tsp baking powder',
      '1/2 tsp baking soda', '1/2 tsp fine salt', '1 1/4 cups buttermilk', '1 large egg',
      '3 tbsp unsalted butter', '1 cup blueberries', '1/4 cup maple syrup',
    ],
    steps: [
      'Whisk the flour, sugar, baking powder, baking soda, and salt. Melt 2 tablespoons of butter, then whisk it with the buttermilk and egg.',
      'Stir the wet mixture into the dry ingredients just until combined. Reserve a handful of blueberries for serving and gently fold the rest into the batter.',
      'Heat a skillet over medium heat and grease it with the remaining butter as needed. Scoop in 1/4 cup of batter per pancake. Flip when bubbles open and the edges set, then cook until golden.',
      'Top with the reserved blueberries and maple syrup.',
    ],
  },
  {
    title: 'Zereshk Polo ba Morgh',
    cuisine: 'Iranian',
    category: 'Main Dish',
    prepTimeMinutes: 25,
    dietaryTags: ['gluten-free'],
    imageUrl: unsplash('1604741333810-0ef6017256da'),
    ingredients: [
      '4 bone-in chicken thighs', '1 onion, thinly sliced', '2 tbsp neutral oil',
      '1 tsp ground turmeric', '1 1/2 tsp fine salt, divided', '1/2 tsp ground black pepper',
      '2 tbsp tomato paste', '1 cup water for the chicken', '2 cups basmati rice',
      '3 cups water for the rice', '1/4 tsp saffron threads', '3 tbsp hot water for the saffron',
      '1/2 cup dried barberries', '2 tbsp unsalted butter', '1 tbsp sugar',
    ],
    steps: [
      'Crush the saffron and steep in 3 tablespoons of hot water. Rinse the rice, then rinse the barberries separately and drain well.',
      'Season the chicken with turmeric, 1 teaspoon salt, and pepper. Brown both sides in the oil, then set aside. Soften the onion in the same pan and fry the tomato paste for 1 minute.',
      'Return the chicken to the pan with 1 cup water and half the saffron infusion. Cover and simmer until tender and at least 165°F (74°C) at the thickest part, about 35 minutes.',
      'Bring the rice, 3 cups water, and remaining salt to a boil. Cover, cook on low for 15 minutes, then rest off heat for 10 minutes.',
      'Warm the barberries, butter, and sugar in a skillet for 1 minute. Fold the remaining saffron into a scoop of cooked rice, scatter it and the barberries over the plain rice, and serve with the chicken and sauce.',
    ],
  },
  {
    title: 'Jalapeño Smash Cheeseburgers',
    cuisine: 'American',
    category: 'Fast Food',
    prepTimeMinutes: 15,
    dietaryTags: ['spicy'],
    imageUrl: unsplash('1568901346375-23c9450c58cd'),
    ingredients: [
      '1 lb 80% lean ground beef', '3/4 tsp fine salt', '1/2 tsp ground black pepper',
      '4 slices American cheese', '2 burger buns', '2 tbsp mayonnaise', '1 tbsp ketchup',
      '1 tbsp yellow mustard', '1/4 cup pickled jalapeño slices', '2 lettuce leaves',
      '2 tomato slices', '2 thin onion slices',
    ],
    steps: [
      'Mix mayonnaise, ketchup, and mustard. Toast the buns cut side down, then spread them with the sauce.',
      'Divide the beef into four loose balls. Heat a cast-iron skillet over medium-high heat. Working in batches, press the balls into thin patties with a sturdy spatula and season with salt and pepper.',
      'Cook until browned underneath, about 2 minutes. Scrape up and flip each patty, add cheese, and cook until the beef reaches 160°F (71°C).',
      'Stack two patties per bun with jalapeños, lettuce, tomato, and onion.',
    ],
  },
  {
    title: 'German Potato and Leek Soup',
    cuisine: 'German',
    category: 'Soup',
    prepTimeMinutes: 15,
    dietaryTags: ['vegetarian'],
    imageUrl: unsplash('1585251173707-f0550bf7c2a2'),
    ingredients: [
      '1 1/2 lb Yukon Gold potatoes, peeled and diced', '2 leeks, white and light green parts',
      '2 tbsp unsalted butter', '4 cups low-sodium vegetable stock', '1 tsp dried marjoram',
      '1/2 tsp fine salt', '1/4 tsp ground black pepper', '1/2 cup heavy cream', '2 tbsp chopped chives',
    ],
    steps: [
      'Halve and slice the leeks. Rinse them well to remove grit and drain.',
      'Melt the butter in a pot over medium heat. Cook the leeks for 5 minutes until soft. Stir in the potatoes, stock, marjoram, salt, and pepper.',
      'Simmer for 20 minutes or until the potatoes are tender. Blend with an immersion blender until smooth.',
      'Stir in the cream, warm gently, and sprinkle with chives before serving.',
    ],
  },
  {
    title: 'Tomato and Basil Caprese Salad',
    cuisine: 'Italian',
    category: 'Salad',
    prepTimeMinutes: 10,
    dietaryTags: ['vegetarian'],
    imageUrl: unsplash('1769458313860-3c8db667d990'),
    ingredients: [
      '3 ripe tomatoes', '8 oz fresh mozzarella made with vegetarian rennet', '1/2 cup fresh basil leaves',
      '2 tbsp extra-virgin olive oil', '1 tbsp balsamic glaze', '1/2 tsp flaky sea salt',
      '1/4 tsp ground black pepper',
    ],
    steps: [
      'Slice the tomatoes and mozzarella into rounds about 1/4 inch thick. Pat the mozzarella dry.',
      'Alternate tomato and mozzarella slices on a platter and tuck basil leaves between them.',
      'Drizzle with olive oil and balsamic glaze, then season with salt and pepper just before serving.',
    ],
  },
  {
    title: 'Mexican Cinnamon-Sugar Churros',
    cuisine: 'Mexican',
    category: 'Dessert',
    prepTimeMinutes: 20,
    dietaryTags: ['vegetarian'],
    imageUrl: unsplash('1624371414361-e670edf4898d'),
    ingredients: [
      '1 cup water', '2 tbsp unsalted butter', '1/4 tsp fine salt', '1 cup all-purpose flour',
      '1 large egg', '1 tsp vanilla extract', '4 cups neutral frying oil',
      '1/2 cup granulated sugar', '2 tsp ground cinnamon',
    ],
    steps: [
      'Bring the water, butter, and salt to a boil. Stir in the flour all at once. Cook over low heat, stirring, until the dough pulls away from the pan.',
      'Cool the dough for 5 minutes. Beat in the egg and vanilla until smooth, then transfer to a sturdy piping bag fitted with a large star tip.',
      'Heat the oil to 350°F (175°C) in a deep, heavy pot. Pipe 4-inch lengths close to the surface, snip with kitchen scissors, and fry in batches until golden on all sides, 3 to 4 minutes.',
      'Drain on a rack. Mix sugar and cinnamon in a shallow bowl and roll the warm churros in it.',
    ],
  },
  {
    title: 'Lebanese Lemon-Tahini Hummus',
    cuisine: 'Arabic',
    category: 'Snack',
    prepTimeMinutes: 15,
    dietaryTags: ['vegan'],
    imageUrl: unsplash('1647482770231-0efa17132429'),
    ingredients: [
      '1 can (15 oz) chickpeas', '1/4 cup tahini', '3 tbsp lemon juice', '1 garlic clove',
      '1/2 tsp fine salt', '3 tbsp ice water', '1 tbsp extra-virgin olive oil',
      '1/4 tsp sweet paprika', '1 tbsp chopped parsley', '2 pita breads',
    ],
    steps: [
      'Drain and rinse the chickpeas. Blend the tahini, lemon juice, garlic, and salt in a food processor.',
      'Add the chickpeas and blend, scraping the bowl as needed. Stream in the ice water and process until smooth.',
      'Spread the hummus in a shallow bowl. Drizzle with olive oil, sprinkle with paprika and parsley, and serve with toasted pita wedges.',
    ],
  },
  {
    title: 'Ginger Cardamom Masala Chai',
    cuisine: 'Indian',
    category: 'Drink',
    prepTimeMinutes: 5,
    dietaryTags: ['vegetarian'],
    imageUrl: unsplash('1619581073186-5b4ae1b0caad'),
    ingredients: [
      '1 cup water', '1 cup whole milk', '2 tsp loose Assam black tea',
      '4 green cardamom pods', '1 inch fresh ginger, thinly sliced', '1/2 cinnamon stick',
      '2 whole cloves', '2 tsp sugar',
    ],
    steps: [
      'Crush the cardamom and cloves. Simmer them with the water, ginger, and cinnamon for 3 minutes.',
      'Add the tea, milk, and sugar. Bring just to a boil, then reduce the heat and simmer for 2 minutes.',
      'Strain into two cups and serve hot.',
    ],
  },
];

const { DATABASE_URL } = parseEnv(readFileSync(new URL('../.env.local', import.meta.url), 'utf8'));
if (!DATABASE_URL) throw new Error('Set DATABASE_URL in .env.local before running this script.');

const sql = neon(DATABASE_URL);
const [, deleted, ...results] = await sql.transaction([
  // The schema cascades recipe deletion to ratings. The lock protects title checks from concurrent writes.
  sql`LOCK TABLE recipes IN SHARE ROW EXCLUSIVE MODE`,
  sql`DELETE FROM recipes WHERE title = 'Nigiri' RETURNING title`,
  ...recipes.map((recipe) => sql`
    INSERT INTO recipes (
      id, "authorName", title, cuisine, category, ingredients, steps,
      "prepTimeMinutes", "imageUrl", dietary_tags
    )
    SELECT ${randomUUID()}, 'RecipeShare', ${recipe.title}, ${recipe.cuisine}, ${recipe.category},
      ${JSON.stringify(recipe.ingredients)}::jsonb, ${JSON.stringify(recipe.steps)}::jsonb,
      ${recipe.prepTimeMinutes}, ${recipe.imageUrl}, ARRAY[${recipe.dietaryTags[0]}]::text[]
    WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = ${recipe.title})
    RETURNING title
  `),
  sql`SELECT title FROM recipes ORDER BY title, position`,
]);

const titles = results.pop();
const insertedCount = results.flat().length;
console.log(`Deleted ${deleted.length} Nigiri recipe(s) and their ratings. Inserted ${insertedCount} recipe(s), skipped ${recipes.length - insertedCount} existing title(s).`);
console.log('Recipe titles in the database:');
for (const { title } of titles) console.log(`- ${title}`);
