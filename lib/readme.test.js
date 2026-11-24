import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

describe('README', () => {
  it('links to the production Vercel app', () => {
    expect(readme).toMatch(/\]\(https:\/\/recipeshare-chavez\.vercel\.app\/?\)/);
  });

  it('lists each Must feature exactly once with a status', () => {
    for (const id of ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7']) {
      const rows = readme.split(/\r?\n/).filter((line) => line.startsWith(`| ${id} |`));
      expect(rows, id).toHaveLength(1);
      expect(rows[0]).toMatch(/\| (Done|Partly done|Not done) \|$/);
    }
  });

  it('defines Partly done and uses it for features with open deployed checks', () => {
    expect(readme).toContain('**Partly done** means');
    const openChecks = readme.split('### Open checks on the deployed app')[1];
    const pendingIds = [...openChecks.matchAll(/^- \*\*([MS]\d+)\*\*/gm)]
      .map((match) => match[1]);
    expect(pendingIds.length).toBeGreaterThan(0);
    for (const id of pendingIds) {
      expect(readme).toMatch(new RegExp(`^\\| ${id} \\| .* \\| Partly done \\|$`, 'm'));
    }
  });
});
