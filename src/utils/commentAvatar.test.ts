import { describe, expect, it, vi } from 'vitest';
import {
  AVATAR_RANDOM_CLASSES,
  commenterInitial,
  createCommentAvatarColors,
} from './commentAvatar';

describe('comment avatars', () => {
  it.each([
    ['  alice', 'A'],
    ['\t\nÉmile ', 'É'],
    ['  𐐨name', '𐐀'],
    ['   ', ''],
  ])('uppercases the first trimmed code point of %s', (name, initial) => {
    expect(commenterInitial(name)).toBe(initial);
  });

  it('samples every token color without introducing non-token colors', () => {
    for (let index = 0; index < AVATAR_RANDOM_CLASSES.length; index += 1) {
      const colors = createCommentAvatarColors(() => (index + 0.5) / AVATAR_RANDOM_CLASSES.length);
      expect(colors('Alice')).toBe(AVATAR_RANDOM_CLASSES[index]);
    }
  });

  it('keeps each commenter stable across renders and resets only for a new view', () => {
    const random = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.99);
    const colors = createCommentAvatarColors(random);
    expect(colors(' Alice ')).toBe(AVATAR_RANDOM_CLASSES[0]);
    expect(colors('Alice')).toBe(AVATAR_RANDOM_CLASSES[0]);
    expect(colors('Bob')).toBe(AVATAR_RANDOM_CLASSES[4]);
    expect(random).toHaveBeenCalledTimes(2);
    expect(createCommentAvatarColors(() => 0.99)('Alice')).toBe(AVATAR_RANDOM_CLASSES[4]);
  });
});
