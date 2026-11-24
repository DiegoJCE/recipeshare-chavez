import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import RecipePhoto from './RecipePhoto';

it('renders a recipe photo with its title as alt text', () => {
  const html = renderToStaticMarkup(
    <RecipePhoto imageUrl="https://example.com/rice.jpg" title="Rice pilaf" />,
  );
  expect(html).toContain('<img src="https://example.com/rice.jpg" alt="Rice pilaf"');
  expect(html).not.toContain('Photo unavailable');
});

it('renders the passport stamp when there is no photo URL', () => {
  const html = renderToStaticMarkup(<RecipePhoto title="Rice pilaf" />);
  expect(html).toContain('class="recipe-photo-stamp">Photo unavailable');
  expect(html).not.toContain('<img');
});
