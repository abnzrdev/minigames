import type { AppSession } from '../utils/appSession';
import { profileInitials, profileName } from '../utils/profile';
import personIcon from '../assets/auth/person.svg';
import { logout } from '../utils/session';

export function renderHeaderProfile(profile: AppSession): HTMLElement {
  const name = profileName(profile);
  const root = document.createElement('div');
  root.className = 'header__profile';
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', `Signed in as ${name}`);

  const avatar = document.createElement('span');
  avatar.className = 'header__avatar';
  avatar.setAttribute('aria-hidden', 'true');
  const fallback = document.createElement('span');
  fallback.className = 'header__avatar-fallback';
  const initials = profileInitials(name);
  if (initials) {
    fallback.textContent = initials;
  } else {
    const generic = document.createElement('img');
    generic.src = personIcon;
    generic.alt = '';
    fallback.append(generic);
  }
  avatar.append(fallback);

  if (profile.avatarUrl) {
    const image = document.createElement('img');
    image.className = 'header__avatar-photo';
    image.alt = '';
    image.addEventListener(
      'load',
      () => {
        fallback.hidden = true;
      },
      { once: true }
    );
    image.addEventListener(
      'error',
      () => {
        image.remove();
        fallback.hidden = false;
      },
      { once: true }
    );
    image.src = profile.avatarUrl;
    avatar.append(image);
  }

  const label = document.createElement('span');
  label.className = 'header__profile-name';
  // User-provided names must remain text even when they contain markup characters.
  label.textContent = name;
  label.title = name;
  root.append(avatar, label);
  const logoutButton = document.createElement('button');
  logoutButton.type = 'button';
  logoutButton.className = 'header__logout';
  logoutButton.textContent = 'Log Out';
  logoutButton.addEventListener('click', () => {
    logoutButton.disabled = true;
    void logout();
  });
  root.append(logoutButton);
  return root;
}
