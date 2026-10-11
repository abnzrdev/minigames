import { describe, expect, it } from 'vitest';
import {
  validateConfirmPassword,
  validateEmail,
  validateLoginPassword,
  validateRegisterPassword,
  validateUsername,
} from './authValidation';

describe('authentication validation', () => {
  it('accepts trimmed email addresses and rejects malformed or empty values', () => {
    expect(validateEmail(' player@example.com ')).toBeNull();
    for (const value of ['', '   ', 'player', 'player@', 'a b@example.com']) {
      expect(validateEmail(value)).not.toBeNull();
    }
  });

  it('enforces username boundaries and uppercase English initial', () => {
    expect(validateUsername('Ab')).toBeNull();
    expect(validateUsername('A'.repeat(30))).toBeNull();
    for (const value of ['', 'A', 'A'.repeat(31), 'alice', 'Alice Smith', 'Émile']) {
      expect(validateUsername(value)).not.toBeNull();
    }
  });

  it('allows login passwords without imposing registration complexity', () => {
    expect(validateLoginPassword('abcdef')).toBeNull();
    expect(validateLoginPassword('12345')).not.toBeNull();
    expect(validateLoginPassword('')).not.toBeNull();
  });

  it('requires registration length, uppercase, digit and special character', () => {
    expect(validateRegisterPassword('Abcd1!')).toBeNull();
    for (const value of ['', 'Ab1!', 'abcd1!', 'Abcdef!', 'Abcde1', 'Abcd1! ', 'Аbcd1!']) {
      expect(validateRegisterPassword(value)).not.toBeNull();
    }
  });

  it('requires a nonempty matching confirmation', () => {
    expect(validateConfirmPassword('Abcd1!', 'Abcd1!')).toBeNull();
    expect(validateConfirmPassword('', '')).not.toBeNull();
    expect(validateConfirmPassword('Abcd2!', 'Abcd1!')).not.toBeNull();
  });
});
