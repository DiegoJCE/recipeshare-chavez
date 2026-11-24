import { beforeEach, expect, it, vi } from 'vitest';
import { getSignedInUser } from '../../../../auth.js';
import { deleteOwnedRecipe, getOwnedRecipe, updateOwnedRecipe } from '../../../../lib/data.js';
import { sampleRecipes } from '../../../../lib/sampleRecipes.js';
import { deleteRecipe, editRecipe } from './actions.js';

vi.mock('../../../../auth.js', () => ({ getSignedInUser: vi.fn() }));
vi.mock('../../../../lib/data.js', () => ({
  deleteOwnedRecipe: vi.fn(), getOwnedRecipe: vi.fn(), updateOwnedRecipe: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('Not found'); },
  redirect: (path) => { throw new Error(`Redirect to ${path}`); },
}));

const recipe = sampleRecipes[0];
const owner = { name: recipe.authorName, email: 'owner@example.com', googleSubject: 'google-owner' };
const otherUser = { name: owner.name, email: owner.email, googleSubject: 'google-other' };
beforeEach(() => {
  vi.resetAllMocks();
});

function recipeForm() {
  const form = new FormData();
  for (const [field, value] of Object.entries(recipe)) {
    form.set(field, Array.isArray(value) ? value.join('\n') : value);
  }
  form.set('authorSubject', owner.googleSubject);
  form.set('title', 'Updated recipe');
  return form;
}

it.each([null, otherUser])('rejects direct edit and delete requests from %j', async (user) => {
  vi.mocked(getSignedInUser).mockResolvedValue(user);

  await expect(editRecipe(recipe.id, { attempt: 0 }, recipeForm())).rejects.toThrow('Not found');
  await expect(deleteRecipe(recipe.id)).rejects.toThrow('Not found');
  expect(updateOwnedRecipe).not.toHaveBeenCalled();
  if (user) {
    expect(getOwnedRecipe).toHaveBeenCalledWith(recipe.id, user);
    expect(deleteOwnedRecipe).toHaveBeenCalledWith(recipe.id, user);
  } else {
    expect(getOwnedRecipe).not.toHaveBeenCalled();
    expect(deleteOwnedRecipe).not.toHaveBeenCalled();
  }
});

it('passes the session identity to the edit and delete operations', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(owner);
  vi.mocked(getOwnedRecipe).mockResolvedValue(recipe);
  vi.mocked(updateOwnedRecipe).mockResolvedValue(true);
  vi.mocked(deleteOwnedRecipe).mockResolvedValue(true);

  await expect(editRecipe(recipe.id, { attempt: 0 }, recipeForm())).rejects.toThrow(`Redirect to /recipes/${recipe.id}`);
  expect(updateOwnedRecipe).toHaveBeenCalledWith(recipe.id, owner, expect.objectContaining({ title: 'Updated recipe' }));

  await expect(deleteRecipe(recipe.id)).rejects.toThrow('Redirect to /');
  expect(deleteOwnedRecipe).toHaveBeenCalledWith(recipe.id, owner);
});
