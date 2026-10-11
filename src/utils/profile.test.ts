import { describe, expect, it } from 'vitest';
import { GENERIC_PROFILE_NAME, profileInitials, profileName } from './profile';

describe('profile name', () => {
  it('prefers trimmed displayName, then email local part, then generic name', () => {
    expect(profileName({ displayName: '  Alice Smith  ', email: 'player@example.com' })).toBe(
      'Alice Smith'
    );
    expect(profileName({ displayName: ' \t ', email: '  player@example.com' })).toBe('player');
    expect(profileName({ displayName: '', email: '@example.com' })).toBe(GENERIC_PROFILE_NAME);
    expect(profileName({ displayName: '', email: '' })).toBe(GENERIC_PROFILE_NAME);
  });

  it('preserves markup characters as literal name text', () => {
    expect(
      profileName({ displayName: '<img src=x onerror=attack()>', email: 'player@example.com' })
    ).toBe('<img src=x onerror=attack()>');
  });
});

describe('Unicode-aware profile initials', () => {
  it.each([
    ['alice', 'A'],
    [' Alice   Smith Jones ', 'AS'],
    ['\tÉmile\nÖztürk', 'ÉÖ'],
    ['123player', '1'],
    ['😺alice !bob', 'AB'],
    ['王 小明', '王小'],
    ['𐐨name ٣digits', '𐐀٣'],
    ['!!!', ''],
    ['', ''],
    [' \t ', ''],
    ['--- Alice Bob', 'A'],
    ['Émile', 'É'],
  ])('calculates %s as %s', (name, initials) => {
    expect(profileInitials(name)).toBe(initials);
  });
});
