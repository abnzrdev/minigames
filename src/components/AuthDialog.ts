import googleIcon from '../assets/auth/google.svg';
import lockIcon from '../assets/auth/lock.svg';
import mailIcon from '../assets/auth/mail.svg';
import personIcon from '../assets/auth/person.svg';
import visibilityOffIcon from '../assets/auth/visibility-off.svg';
import visibilityIcon from '../assets/auth/visibility.svg';
import {
  validateEmail,
  validateUsername,
  validateLoginPassword,
  validateRegisterPassword,
  validateConfirmPassword,
} from '../utils/authValidation';

function field(
  label: string,
  name: string,
  type: string,
  placeholder: string,
  icon: string,
  autocomplete: string
): string {
  return `
  <label class="auth-dialog__field">
    <span class="auth-dialog__label">${label}</span>

    <span class="auth-dialog__control">
      <img src="${icon}" width="20" height="20" alt="" />
      <input
        type="${type}"
        name="${name}"
        placeholder="${placeholder}"
        autocomplete="${autocomplete}"
        aria-describedby="${name}-error"
        aria-invalid="false"
        required
      />
    </span>

    <!-- Each input needs its own message for real-time validation. -->
    <span
      id="${name}-error"
      class="auth-dialog__error"
      aria-live="polite"
      hidden
    ></span>
  </label>
`;
}

// Choose the correct validation rule for each input.
// Return null when valid or an error message when invalid.
function getValidationError(input: HTMLInputElement, form: HTMLFormElement): string | null {
  switch (input.name) {
    case 'login-email':
    case 'register-email':
      return validateEmail(input.value);

    case 'register-username':
      return validateUsername(input.value);

    case 'login-password':
      return validateLoginPassword(input.value);

    case 'register-password':
      return validateRegisterPassword(input.value);

    case 'register-password-confirm': {
      const password = form.querySelector<HTMLInputElement>('[name="register-password"]');

      return validateConfirmPassword(input.value, password?.value ?? '');
    }

    default:
      return null;
  }
}

function initializeFormValidation(form: HTMLFormElement): void {
  const inputs = form.querySelectorAll<HTMLInputElement>('input');
  const submitButton = form.querySelector<HTMLButtonElement>('.auth-dialog__submit');

  if (!submitButton) return;

  // We display our own inline errors instead of browser popups.
  form.noValidate = true;

  // Update the submit button based on every field in this form.
  function updateSubmitState(): void {
    submitButton!.disabled = Array.from(inputs).some(
      (input) => getValidationError(input, form) !== null
    );
  }

  // Show or clear the error belonging to one input.
  function showFieldError(input: HTMLInputElement): void {
    const message = getValidationError(input, form);
    const field = input.closest('.auth-dialog__field');
    const errorElement = field?.querySelector<HTMLElement>('.auth-dialog__error');

    input.setAttribute('aria-invalid', String(message !== null));
    field?.classList.toggle('auth-dialog__field--invalid', message !== null);

    if (errorElement) {
      errorElement.textContent = message ?? '';
      errorElement.hidden = message === null;
    }
  }

  // Validate as the user types or leaves an input.
  inputs.forEach((input) => {
    const validate = (): void => {
      showFieldError(input);

      // Changing the password must recheck confirmation.
      if (input.name === 'register-password') {
        const confirm = form.querySelector<HTMLInputElement>('[name="register-password-confirm"]');

        if (confirm && confirm.value) {
          showFieldError(confirm);
        }
      }

      updateSubmitState();
    };

    input.addEventListener('input', validate);
    input.addEventListener('blur', validate);
  });

  // The form starts invalid because required fields are empty.
  updateSubmitState();
}

export function renderAuthDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'auth-dialog';
  dialog.id = 'auth-dialog';
  dialog.setAttribute('aria-labelledby', 'auth-dialog-title');

  dialog.innerHTML = `
    <div class="auth-dialog__frame">
      <button type="button" class="auth-dialog__close" id="auth-dialog-close" aria-label="Close dialog">&times;</button>
      <div class="auth-dialog__card">
      <div class="auth-dialog__tabs" role="tablist" aria-label="Authentication">
        <button type="button" class="auth-dialog__tab auth-dialog__tab--active" role="tab" id="auth-tab-login" aria-selected="true" aria-controls="auth-panel-login" data-auth-tab="login">Login</button>
        <button type="button" class="auth-dialog__tab" role="tab" id="auth-tab-register" aria-selected="false" aria-controls="auth-panel-register" data-auth-tab="register">Register</button>
      </div>

      <div class="auth-dialog__panels">
        <section class="auth-dialog__panel auth-dialog__panel--switching" id="auth-panel-login" role="tabpanel" aria-labelledby="auth-tab-login">
          <div class="auth-dialog__heading">
            <h2 class="auth-dialog__title" id="auth-dialog-title">Welcome Back!</h2>
            <p class="auth-dialog__subtitle">Sign in to resume your games and progress.</p>
          </div>
          <form class="auth-dialog__form">
            ${field('Email Address', 'login-email', 'email', 'e.g. alex@minigames.com', mailIcon, 'email')}
            <label class="auth-dialog__field">
              <span class="auth-dialog__label">Password</span>
              <span class="auth-dialog__control">
                <img src="${lockIcon}" width="20" height="20" alt="" />
                <!-- Connect the password input to its validation message. -->
                <input type="password" name="login-password" placeholder="••••••••" autocomplete="current-password" aria-describedby="login-password-error-message" aria-invalid="false" required />
                <button type="button" class="auth-dialog__reveal" aria-label="Show password" aria-pressed="false">
                  <img class="auth-dialog__reveal-on" src="${visibilityIcon}" width="20" height="20" alt="" />
                  <img class="auth-dialog__reveal-off" src="${visibilityOffIcon}" width="20" height="20" alt="" hidden />
                </button>
              </span>
              <span
                id="login-password-error-message"
                class="auth-dialog__error"
                aria-live="polite"
                hidden
              ></span>
            </label>
            <div class="auth-dialog__links">
              <button type="button" class="auth-dialog__forgot">Forgot Password?</button>
            </div>
            <button type="submit" class="auth-dialog__submit">Login</button>
            <div class="auth-dialog__divider" aria-hidden="true"><span></span>or<span></span></div>
            <button type="button" class="auth-dialog__google">
              <img src="${googleIcon}" width="24" height="24" alt="" />
              Continue with Google
            </button>
          </form>
          <p class="auth-dialog__switch">
            Don't have an account?
            <button type="button" class="auth-dialog__switch-link" data-auth-switch="register">Register</button>
          </p>
        </section>

        <section class="auth-dialog__panel auth-dialog__panel--hidden" id="auth-panel-register" role="tabpanel" aria-labelledby="auth-tab-register" hidden>
          <div class="auth-dialog__heading">
            <h2 class="auth-dialog__title">Create Account</h2>
            <p class="auth-dialog__subtitle">Join MiniGames to track your score &amp; streak.</p>
          </div>
          <form class="auth-dialog__form">
            ${field('Username', 'register-username', 'text', 'e.g. CozyGamer99', personIcon, 'username')}
            ${field('Email Address', 'register-email', 'email', 'your.email@domain.com', mailIcon, 'email')}
            ${field('Password', 'register-password', 'password', 'Min. 6 characters', lockIcon, 'new-password')}
            ${field('Confirm Password', 'register-password-confirm', 'password', 'Repeat your password', lockIcon, 'new-password')}
            <button type="submit" class="auth-dialog__submit">Create Account</button>
            <div class="auth-dialog__divider" aria-hidden="true"><span></span>or<span></span></div>
            <button type="button" class="auth-dialog__google">
              <img src="${googleIcon}" width="24" height="24" alt="" />
              Sign up with Google
            </button>
          </form>
          <p class="auth-dialog__switch">
            Already have an account?
            <button type="button" class="auth-dialog__switch-link" data-auth-switch="login">Login</button>
          </p>
        </section>
      </div>
      </div>
    </div>
  `;

  dialog.querySelectorAll<HTMLFormElement>('.auth-dialog__form').forEach((form) => {
    initializeFormValidation(form);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
  });

  dialog.querySelectorAll<HTMLButtonElement>('.auth-dialog__reveal').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.parentElement?.querySelector('input');
      if (!(input instanceof HTMLInputElement)) {
        return;
      }
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      button.querySelector('.auth-dialog__reveal-on')?.toggleAttribute('hidden', show);
      button.querySelector('.auth-dialog__reveal-off')?.toggleAttribute('hidden', !show);
    });
  });

  return dialog;
}
