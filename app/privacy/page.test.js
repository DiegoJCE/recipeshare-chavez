import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import PrivacyPage from './page';

it('explains which Google data RecipeShare stores, why, and who can see it', () => {
  const html = renderToStaticMarkup(PrivacyPage());

  expect(html).toContain('<h1>Privacy</h1>');
  expect(html).toContain('stores only your Google name and email to link recipes you publish to you as their author');
  expect(html).toContain('Your name appears on your recipes');
  expect(html).toContain('Your email stays private');
  expect(html).toContain('does not share your Google account data with third parties');
});
