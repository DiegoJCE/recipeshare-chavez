// @vitest-environment jsdom

import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import RecipePhoto from './RecipePhoto';

const imageUrl = 'https://example.com/rice.jpg';
const title = 'Rice pilaf';
let container;
let root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('replaces a failed recipe photo with the passport stamp', () => {
  act(() => root.render(<RecipePhoto imageUrl={imageUrl} title={title} />));
  const image = container.querySelector('img');
  expect(image?.getAttribute('src')).toBe(imageUrl);
  expect(image?.alt).toBe(title);
  expect(container.textContent).toBe('');

  act(() => image.dispatchEvent(new Event('error')));

  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('.recipe-photo-stamp')?.textContent).toBe('Photo unavailable');
});

it('shows the stamp if the photo has already failed when React attaches the ref', () => {
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0);

  act(() => root.render(<RecipePhoto imageUrl={imageUrl} title={title} />));

  expect(container.querySelector('img')).toBeNull();
  expect(container.textContent).toBe('Photo unavailable');
});

it('shows the stamp when there is no photo URL', () => {
  act(() => root.render(<RecipePhoto title={title} />));

  expect(container.querySelector('img')).toBeNull();
  expect(container.textContent).toBe('Photo unavailable');
});
