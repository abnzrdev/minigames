import googleIcon from '../assets/auth/google.svg';
import lockIcon from '../assets/auth/lock.svg';
import mailIcon from '../assets/auth/mail.svg';
import personIcon from '../assets/auth/person.svg';
import visibilityOffIcon from '../assets/auth/visibility-off.svg';
import visibilityIcon from '../assets/auth/visibility.svg';

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
        <input type="${type}" name="${name}" placeholder="${placeholder}" autocomplete="${autocomplete}" required />
      </span>
    </label>
  `;
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
                <input type="password" name="login-password" placeholder="••••••••" autocomplete="current-password" required />
                <button type="button" class="auth-dialog__reveal" aria-label="Show password" aria-pressed="false">
                  <img class="auth-dialog__reveal-on" src="${visibilityIcon}" width="20" height="20" alt="" />
                  <img class="auth-dialog__reveal-off" src="${visibilityOffIcon}" width="20" height="20" alt="" hidden />
                </button>
              </span>
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
            ${field('Username', 'register-username', 'text', 'e.g. CozyGamer_99', personIcon, 'username')}
            ${field('Email Address', 'register-email', 'email', 'your.email@domain.com', mailIcon, 'email')}
            ${field('Password', 'register-password', 'password', 'Min. 8 characters', lockIcon, 'new-password')}
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
