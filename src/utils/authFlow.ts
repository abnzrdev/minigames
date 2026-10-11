import { authenticateEmailPassword, authenticationErrorMessage } from './emailPasswordAuth';
import { currentRoute, updateRoute } from './navigation';
import { showSnackbar } from '../components/Snackbar';

export function initializeAuthenticationFlow(
  dialog: HTMLDialogElement,
  validate: (form: HTMLFormElement) => boolean
): void {
  let pending = false;
  const status = document.createElement('p');
  status.className = 'auth-dialog__request-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.hidden = true;
  dialog.querySelector('.auth-dialog__tabs')?.after(status);

  const disabledStates = new Map<HTMLInputElement | HTMLButtonElement, boolean>();
  function lock(): void {
    pending = true;
    dialog.dataset.pending = 'true';
    dialog.setAttribute('aria-busy', 'true');
    dialog
      .querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button')
      .forEach((control) => {
        disabledStates.set(control, control.disabled);
        control.disabled = true;
      });
    status.hidden = false;
    status.classList.remove('auth-dialog__request-status--error');
    status.textContent = 'Authenticating…';
  }

  function unlock(): void {
    pending = false;
    delete dialog.dataset.pending;
    dialog.removeAttribute('aria-busy');
    disabledStates.forEach((disabled, control) => {
      control.disabled = disabled;
    });
    disabledStates.clear();
  }

  dialog.querySelectorAll<HTMLFormElement>('.auth-dialog__form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (pending || !validate(form)) return;
      const mode = form.closest('#auth-panel-register') ? 'register' : 'login';
      const value = (name: string): string =>
        form.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value ?? '';
      const credentials = {
        email: value(`${mode}-email`),
        password: value(`${mode}-password`),
        ...(mode === 'register' ? { username: value('register-username') } : {}),
      };
      lock();
      try {
        await authenticateEmailPassword(mode, credentials);
        unlock();
        status.hidden = true;
        // The game query is retained when this dialog replaced an expired protected action.
        updateRoute({ auth: null, game: currentRoute().game });
        showSnackbar(
          mode === 'register' ? 'Account created successfully.' : 'Logged in successfully.',
          'success'
        );
      } catch (error) {
        unlock();
        validate(form);
        status.hidden = false;
        status.classList.add('auth-dialog__request-status--error');
        status.textContent = authenticationErrorMessage(error);
        showSnackbar(status.textContent, 'error');
      }
    });
  });

  dialog.addEventListener('close', () => {
    status.hidden = true;
    status.textContent = '';
  });
}
