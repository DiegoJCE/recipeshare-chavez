import { beforeEach, expect, it, vi } from 'vitest';
import { revalidatePath } from 'next/cache';
import { getSignedInUser } from '../../../auth.js';
import { getDatabase } from '../../../lib/db.js';
import { rateRecipe } from './actions.js';

vi.mock('../../../auth.js', () => ({ getSignedInUser: vi.fn() }));
vi.mock('../../../lib/db.js', () => ({ getDatabase: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const recipeId = 'test-recipe';
const author = { email: 'author@example.com' };
const reader = { email: 'reader@example.com' };
const ratings = new Map();
const sql = vi.fn((parts, value, email, id, ownershipEmail) => {
  const query = parts.join('?');
  expect(query).toContain('WHERE id = ? AND author_email IS DISTINCT FROM ?');
  expect(query).toContain('ON CONFLICT (recipe_id, rater_email) DO UPDATE SET value = EXCLUDED.value');
  expect(ownershipEmail).toBe(email);
  if (id !== recipeId || ownershipEmail === author.email) return [];

  ratings.set(email, value);
  return [{ id: 1 }];
});

beforeEach(() => {
  vi.clearAllMocks();
  ratings.clear();
  vi.mocked(getDatabase).mockResolvedValue(sql);
});

function ratingForm(value) {
  const form = new FormData();
  form.set('rating', value);
  form.set('raterEmail', reader.email);
  return form;
}

it('replaces a signed-in reader’s rating and refreshes the detail and card', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(reader);
  await rateRecipe(recipeId, ratingForm('2'));
  expect([...ratings.values()]).toEqual([2]);

  vi.mocked(revalidatePath).mockClear();
  await rateRecipe(recipeId, ratingForm('5'));

  expect([...ratings]).toEqual([[reader.email, 5]]);
  expect(revalidatePath.mock.calls).toEqual([[`/recipes/${recipeId}`], ['/']]);
});

it('rejects an author’s direct rating request even with a reader’s email in the form', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(author);
  await rateRecipe(recipeId, ratingForm('5'));

  expect(sql).toHaveBeenCalledWith(expect.any(Array), 5, author.email, recipeId, author.email);
  expect(ratings.size).toBe(0);
  expect(revalidatePath).not.toHaveBeenCalled();
});

it('rejects a visitor’s direct rating request before accessing the database', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(null);
  await rateRecipe(recipeId, ratingForm('5'));

  expect(getDatabase).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});

it('skips revalidation when the recipe does not exist', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(reader);
  await rateRecipe('missing', ratingForm('5'));

  expect(ratings.size).toBe(0);
  expect(revalidatePath).not.toHaveBeenCalled();
});
