import { beforeEach, expect, it, vi } from 'vitest';
import { revalidatePath } from 'next/cache';
import { getSignedInUser } from '../../../auth.js';
import { getDatabase } from '../../../lib/db.js';
import { rateRecipe } from './actions.js';

vi.mock('../../../auth.js', () => ({ getSignedInUser: vi.fn() }));
vi.mock('../../../lib/db.js', () => ({ getDatabase: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const recipeId = 'test-recipe';
const author = { email: 'author@example.com', googleSubject: 'google-author' };
const reader = { email: author.email, googleSubject: 'google-reader' };
const ratings = new Map();
const sql = vi.fn((parts, value, subject, id, ownershipSubject) => {
  const query = parts.join('?');
  expect(query).toContain('WHERE id = ? AND author_google_subject IS DISTINCT FROM ?');
  expect(query).toContain('ON CONFLICT (recipe_id, rater_google_subject) DO UPDATE SET value = EXCLUDED.value');
  expect(ownershipSubject).toBe(subject);
  if (id !== recipeId || ownershipSubject === author.googleSubject) return [];

  ratings.set(subject, value);
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
  form.set('raterSubject', reader.googleSubject);
  return form;
}

it('replaces a signed-in reader’s rating and refreshes the detail and card', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(reader);
  await rateRecipe(recipeId, ratingForm('2'));
  expect([...ratings.values()]).toEqual([2]);

  vi.mocked(revalidatePath).mockClear();
  await rateRecipe(recipeId, ratingForm('5'));

  expect([...ratings]).toEqual([[reader.googleSubject, 5]]);
  expect(revalidatePath.mock.calls).toEqual([[`/recipes/${recipeId}`], ['/']]);
});

it('rejects an author’s direct rating request even with a reader’s subject in the form', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(author);
  await rateRecipe(recipeId, ratingForm('5'));

  expect(sql).toHaveBeenCalledWith(expect.any(Array), 5, author.googleSubject, recipeId, author.googleSubject);
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
