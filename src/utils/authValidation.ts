export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Email is required.';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return 'Enter a valid email address.';
  }

  return null;
}

export function validateUsername(value: string): string | null {
  if (!value) return 'Username is required.';

  if (value.length < 2 || value.length > 30) {
    return 'Username must be 2–30 characters.';
  }

  if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
    return 'Start with an uppercase English letter; use only letters and digits.';
  }

  return null;
}

export function validateLoginPassword(value: string): string | null {
  if (!value) return 'Password is required.';

  if (value.length < 6) {
    return 'Password must have at least 6 characters.';
  }

  return null;
}

export function validateRegisterPassword(value: string): string | null {
  if (!value) return 'Password is required.';

  if (value.length < 6) {
    return 'Password must have at least 6 characters.';
  }

  if (!/^[\x21-\x7E]+$/.test(value)) {
    return 'Use English letters, digits, and special characters.';
  }

  if (!/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9\s]/.test(value)) {
    return 'Include an uppercase letter, a digit, and a special character.';
  }

  return null;
}

export function validateConfirmPassword(value: string, password: string): string | null {
  if (!value) return 'Confirm your password.';

  if (value !== password) {
    return 'Passwords do not match.';
  }

  return null;
}
