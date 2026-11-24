import { beforeEach, expect, it, vi } from 'vitest';
import { put } from '@vercel/blob';
import { prepareRecipeForm } from './prepareRecipeForm.js';
import { MAX_PHOTO_BYTES } from './recipePhoto.js';

vi.mock('@vercel/blob', () => ({ put: vi.fn() }));

const link = 'https://example.com/pasta.jpg';
const blobUrl = 'https://example.public.blob.vercel-storage.com/recipes/photo-unique.jpg';

beforeEach(() => {
  put.mockReset();
  put.mockResolvedValue({ url: blobUrl });
});

function recipeForm(imageUrl = '', file) {
  const form = new FormData();
  for (const [name, value] of Object.entries({
    authorName: 'Cook',
    title: 'Pasta',
    cuisine: 'Italian',
    category: 'Main Dish',
    ingredients: 'Pasta',
    steps: 'Boil pasta',
    prepTimeMinutes: '15',
    imageUrl,
  })) {
    form.set(name, value);
  }
  if (file) form.set('imageFile', file);
  return form;
}

it('keeps the pasted URL without calling Blob', async () => {
  const result = await prepareRecipeForm({ attempt: 0 }, recipeForm(link));
  expect(result.recipe.imageUrl).toBe(link);
  expect(put).not.toHaveBeenCalled();
});

it('uses the uploaded Blob URL even when the form already has a link', async () => {
  const bytes = new Uint8Array(MAX_PHOTO_BYTES);
  bytes.set([0xff, 0xd8, 0xff]);
  const file = new File([bytes], 'pasta.jpg', { type: 'image/jpeg' });
  const result = await prepareRecipeForm({ attempt: 0 }, recipeForm(link, file));
  expect(result.recipe.imageUrl).toBe(blobUrl);
  expect(put).toHaveBeenCalledWith('recipes/photo.jpg', expect.any(File), {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'image/jpeg',
  });
});

it.each([
  new File(['text'], 'notes.txt', { type: 'text/plain' }),
  new File(['text'], 'fake.jpg', { type: 'image/jpeg' }),
  new File([new Uint8Array(MAX_PHOTO_BYTES + 1)], 'large.jpg', { type: 'image/jpeg' }),
])('rejects $name without calling Blob', async (file) => {
  const result = await prepareRecipeForm({ attempt: 0 }, recipeForm('', file));
  expect(result.state.errors).toHaveProperty('imageFile');
  expect(put).not.toHaveBeenCalled();
});

it('returns an inline error and preserves the link when the upload fails', async () => {
  put.mockRejectedValue(new Error('Blob unavailable'));
  const file = new File([Uint8Array.of(0xff, 0xd8, 0xff)], 'pasta.jpg', { type: 'image/jpeg' });
  const result = await prepareRecipeForm({ attempt: 0 }, recipeForm(link, file));
  expect(result.state.values.imageUrl).toBe(link);
  expect(result.state.errors).toHaveProperty('imageFile');
  expect(result).not.toHaveProperty('recipe');
});
