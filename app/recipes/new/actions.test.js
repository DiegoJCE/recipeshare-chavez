import { expect, it, vi } from 'vitest';
import { getSignedInUser } from '../../../auth.js';
import { addRecipe } from '../../../lib/data.js';
import { createRecipe } from './actions.js';

vi.mock('../../../auth.js', () => ({ getSignedInUser: vi.fn() }));
vi.mock('../../../lib/data.js', () => ({ addRecipe: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

it.each([
  [null, 'Guest Cook', null],
  [{ name: 'Google Cook', email: 'cook@example.com' }, 'Google Cook', 'cook@example.com'],
])('saves authorship from the session when present (%j)', async (user, authorName, authorEmail) => {
  vi.mocked(getSignedInUser).mockResolvedValue(user);
  const formData = new FormData();
  for (const [name, value] of Object.entries({
    authorName: 'Guest Cook',
    authorEmail: 'forged@example.com',
    title: 'Pasta',
    cuisine: 'Italian',
    category: 'Main Dish',
    ingredients: 'Pasta',
    steps: 'Boil pasta',
    prepTimeMinutes: '15',
    imageUrl: 'https://example.com/pasta.jpg',
  })) {
    formData.set(name, value);
  }

  await createRecipe({ attempt: 0 }, formData);

  expect(addRecipe).toHaveBeenLastCalledWith(expect.objectContaining({ authorName, authorEmail }));
});
