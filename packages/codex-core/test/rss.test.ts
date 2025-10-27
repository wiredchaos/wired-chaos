import { describe, it, expect } from 'vitest';
import { toPromptDrills } from '../src/rss';

describe('rss → drills', () => {
  it('creates drills from items', () => {
    const items = [{ title: 'Test AI Article', link: 'https://example.com' }];
    const drills = toPromptDrills(items as any);
    expect(drills.length).toBe(1);
    expect(drills[0].prompts.length).toBeGreaterThan(0);
  });
});
