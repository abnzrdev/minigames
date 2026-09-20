export function renderAuthDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'auth-dialog';
  dialog.id = 'auth-dialog';
  dialog.setAttribute('aria-labelledby', 'auth-dialog-title');

  dialog.innerHTML = `
    <div class="auth-dialog__card">
      <button type="button" class="auth-dialog__close" id="auth-dialog-close" aria-label="Close dialog">
        &times;
      </button>

      <div class="auth-dialog__tabs" role="tablist" aria-label="Authentication">
        <button
          type="button"
          class="auth-dialog__tab auth-dialog__tab--active"
          role="tab"
          id="auth-tab-login"
          aria-selected="true"
          aria-controls="auth-panel-login"
          data-auth-tab="login"
        >
          Login
        </button>
        <button
          type="button"
          class="auth-dialog__tab"
          role="tab"
          id="auth-tab-register"
          aria-selected="false"
          aria-controls="auth-panel-register"
          data-auth-tab="register"
        >
          Registration
        </button>
      </div>

      <div class="auth-dialog__panels">
        <section
          class="auth-dialog__panel auth-dialog__panel--switching"
          id="auth-panel-login"
          role="tabpanel"
          aria-labelledby="auth-tab-login"
        >
          <h2 class="auth-dialog__title" id="auth-dialog-title">Welcome back</h2>
          <form class="auth-dialog__form">
            <label class="auth-dialog__field">
              <span class="auth-dialog__label">Email</span>
              <input type="email" name="login-email" autocomplete="email" required />
            </label>
            <label class="auth-dialog__field">
              <span class="auth-dialog__label">Password</span>
              <input type="password" name="login-password" autocomplete="current-password" required />
            </label>
            <button type="submit" class="auth-dialog__submit">Log In</button>
          </form>
          <p class="auth-dialog__switch">
            Don&apos;t have an account?
            <button type="button" class="auth-dialog__switch-link" data-auth-switch="register">Register</button>
          </p>
        </section>

        <section
          class="auth-dialog__panel auth-dialog__panel--hidden"
          id="auth-panel-register"
          role="tabpanel"
          aria-labelledby="auth-tab-register"
          hidden
        >
          <h2 class="auth-dialog__title">Create account</h2>
          <form class="auth-dialog__form">
            <label class="auth-dialog__field">
              <span class="auth-dialog__label">Email</span>
              <input type="email" name="register-email" autocomplete="email" required />
            </label>
            <label class="auth-dialog__field">
              <span class="auth-dialog__label">Password</span>
              <input type="password" name="register-password" autocomplete="new-password" required />
            </label>
            <label class="auth-dialog__field">
              <span class="auth-dialog__label">Confirm password</span>
              <input type="password" name="register-password-confirm" autocomplete="new-password" required />
            </label>
            <button type="submit" class="auth-dialog__submit auth-dialog__submit--primary">Sign Up</button>
          </form>
          <p class="auth-dialog__switch">
            Already have an account?
            <button type="button" class="auth-dialog__switch-link" data-auth-switch="login">Login</button>
          </p>
        </section>
      </div>
    </div>
  `;

  dialog.querySelectorAll<HTMLFormElement>('.auth-dialog__form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
  });

  return dialog;
}
