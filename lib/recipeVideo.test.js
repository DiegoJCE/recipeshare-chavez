import { expect, it } from 'vitest';
import { youtubeEmbedUrl } from './recipeVideo.js';

it.each([
  'https://www.youtube.com/watch?v=M7lc1UVf-VE&list=example',
  'https://youtu.be/M7lc1UVf-VE?t=30',
  'https://m.youtube.com/shorts/M7lc1UVf-VE',
])('builds a fixed embed URL from %s', (link) => {
  expect(youtubeEmbedUrl(link)).toBe('https://www.youtube-nocookie.com/embed/M7lc1UVf-VE');
});

it.each([
  null,
  '   ',
  'https://youtube.com.example.org/watch?v=M7lc1UVf-VE',
  'https://youtube.com@elsewhere.test/watch?v=M7lc1UVf-VE',
  'ftp://youtu.be/M7lc1UVf-VE',
  'https://youtu.be/M7lc1UVf-VE/extra',
  'https://youtube.com/watch',
])('produces no embed for %s', (link) => {
  expect(youtubeEmbedUrl(link)).toBeNull();
});
