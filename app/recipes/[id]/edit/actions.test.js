import { beforeEach, expect, it, vi } from 'vitest';
import { getSignedInUser } from '../../../../auth.js';
import { getDatabase } from '../../../../lib/db.js';
import { sampleRecipes } from '../../../../lib/sampleRecipes.js';
import { deleteRecipe, editRecipe } from './actions.js';

vi.mock('../../../../auth.js', () => ({ getSignedInUser: vi.fn() }));
vi.mock('../../../../lib/db.js', () => ({ getDatabase: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('Not found'); },
  redirect: (path) => { throw new Error(`Redirect to ${path}`); },
}));

const recipe = sampleRecipes[0];
const owner = { name: recipe.authorName, email: 'owner@example.com' };
const otherUser = { name: owner.name, email: 'other@example.com' };
const sql = vi.fn((parts, ...params) => {
  const query = parts.join('?');
  if (query.includes('SELECT r.id')) {
    expect(query).toContain('r.author_email = ?');
    const [, id, , email] = params;
    return id === recipe.id && email === owner.email ? [recipe] : [];
  } else {
    expect(query).toContain('WHERE id = ? AND author_email = ?');
  }
  return params.at(-2) === recipe.id && params.at(-1) === owner.email ? [recipe] : [];
});

beforeEach(() => {
  sql.mockClear();
  vi.mocked(getDatabase).mockResolvedValue(sql);
});

function recipeForm() {
  const form = new FormData();
  for (const [field, value] of Object.entries(recipe)) {
    form.set(field, Array.isArray(value) ? value.join('\n') : value);
  }
  form.set('authorEmail', owner.email);
  form.set('title', 'Updated recipe');
  return form;
}

it.each([null, otherUser])('rejects direct edit and delete requests from %j', async (user) => {
  vi.mocked(getSignedInUser).mockResolvedValue(user);

  await expect(editRecipe(recipe.id, { attempt: 0 }, recipeForm())).rejects.toThrow('Not found');
  await expect(deleteRecipe(recipe.id)).rejects.toThrow('Not found');
  expect(sql.mock.calls.some(([parts]) => parts.join('?').includes('UPDATE recipes'))).toBe(false);
  if (user) {
    expect(sql).toHaveBeenLastCalledWith(expect.any(Array), recipe.id, user.email);
  } else {
    expect(sql).not.toHaveBeenCalled();
  }
});

it('lets the owner update and delete their recipe', async () => {
  vi.mocked(getSignedInUser).mockResolvedValue(owner);

  await expect(editRecipe(recipe.id, { attempt: 0 }, recipeForm())).rejects.toThrow(`Redirect to /recipes/${recipe.id}`);
  const [parts, title, ...params] = sql.mock.lastCall;
  expect(parts.join('?')).toContain('UPDATE recipes');
  expect(title).toBe('Updated recipe');
  expect(params.slice(-2)).toEqual([recipe.id, owner.email]);

  await expect(deleteRecipe(recipe.id)).rejects.toThrow('Redirect to /');
  expect(sql.mock.lastCall[0].join('?')).toContain('DELETE FROM recipes');
  expect(sql).toHaveBeenLastCalledWith(expect.any(Array), recipe.id, owner.email);
});
