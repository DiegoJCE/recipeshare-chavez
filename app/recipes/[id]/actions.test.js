import { beforeEach, expect, it, vi } from 'vitest';
import { revalidatePath } from 'next/cache';
import { getSignedInUser } from '../../../auth.js';
import { addRating } from '../../../lib/data.js';
import { rateRecipe } from './actions.js';

vi.mock('../../../auth.js', () => ({ getSignedInUser: vi.fn() }));
vi.mock('../../../lib/data.js', () => ({ addRating: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const recipeId = 'test-recipe';
const author = { email: 'author@example.com', googleSubject: 'google-author' };
const reader = { email: author.email, googleSubject: 'google-reader' };
beforeEach(() => {
  vi.resetAllMocks();
});

function ratingForm(value) {
  const form = new FormData();
  form.set('rating', value);
  form.set('raterSubject', reader.googleSubject);
  return form;
}

it('passes the signed-in identity to the data layer and refreshes both pages on success', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(reader);
  vi.mocked(addRating).mockResolvedValue(true);
  await rateRecipe(recipeId, ratingForm('5'));

  expect(addRating).toHaveBeenCalledWith(recipeId, 5, reader);
  expect(revalidatePath.mock.calls).toEqual([[`/recipes/${recipeId}`], ['/']]);
});

it('uses the session identity even with a different subject in the submitted form', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(author);
  vi.mocked(addRating).mockResolvedValue(false);
  await rateRecipe(recipeId, ratingForm('5'));

  expect(addRating).toHaveBeenCalledWith(recipeId, 5, author);
  expect(revalidatePath).not.toHaveBeenCalled();
});

it('rejects a visitor?s direct rating request before accessing the database', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(null);
  await rateRecipe(recipeId, ratingForm('5'));

  expect(addRating).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});
