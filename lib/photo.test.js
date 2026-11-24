import { expect, it, vi } from 'vitest';
import { put } from '@vercel/blob';
import { uploadPhoto, validatePhoto } from './photo.js';
import { validateRecipe } from './validate.js';
import { sampleRecipes } from './sampleRecipes.js';

vi.mock('@vercel/blob', () => ({ put: vi.fn() }));

it('accepts an image file in place of a URL and returns its public Blob URL', async () => {
  const photo = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'food.jpg', { type: 'image/jpeg' });
  const url = 'https://example.public.blob.vercel-storage.com/recipes/photo.jpg';
  put.mockResolvedValue({ url });
  expect(await validatePhoto(photo)).toBe('');
  expect(validateRecipe({ ...sampleRecipes[0], imageUrl: '' }, { hasPhoto: true })).toEqual({});
  await expect(uploadPhoto(photo)).resolves.toBe(url);
  expect(put).toHaveBeenCalledWith('recipes/photo.jpg', photo, {
    access: 'public', addRandomSuffix: true, contentType: 'image/jpeg',
  });
});

it('rejects oversized files, unsupported formats, and mismatched file contents', async () => {
  const jpeg = { type: 'image/jpeg' };
  expect(await validatePhoto(new File([new Uint8Array(3 * 1024 * 1024 + 1)], 'large.jpg', jpeg))).toMatch(/3 MB/);
  expect(await validatePhoto(new File(['<svg/>'], 'food.svg', { type: 'image/svg+xml' }))).toMatch(/JPEG/);
  expect(await validatePhoto(new File(['not a picture'], 'food.jpg', jpeg))).toMatch(/contents/);
});
