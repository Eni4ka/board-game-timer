import { describe, it, expect } from 'vitest';
import { showBuildInfo, formatBuildDate } from './build';

describe('информация о сборке', () => {
  it('видна только во внутреннем тестировании', () => {
    expect(showBuildInfo({ env: 'internal', version: '1.0 (120)', date: '' })).toBe(true);
    expect(showBuildInfo({ env: '', version: '1.0', date: '' })).toBe(false);
    expect(showBuildInfo({ env: 'production', version: '1.0', date: '' })).toBe(false);
  });
  it('дата форматируется как ДД.ММ.ГГГГ ЧЧ:ММ', () => {
    expect(formatBuildDate('2026-11-28T09:05:00')).toBe('28.11.2026 09:05');
    expect(formatBuildDate('bad')).toBe('bad');
  });
});
