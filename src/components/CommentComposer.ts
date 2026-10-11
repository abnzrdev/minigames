import { submitComment } from '../api/comments';
import { MutationFailure } from '../api/mutations';
import { appSession } from '../utils/session';
import { ensureActiveSession } from '../utils/protectedAction';
import { commenterInitial } from '../utils/commentAvatar';
import { commentAuthorName, validateCommentText } from '../utils/commentValidation';
import { showSnackbar } from './Snackbar';

export function initializeCommentComposer(
  root: HTMLElement,
  slug: string,
  refresh: () => Promise<void>
): () => void {
  const form = document.createElement('form');
  form.className = 'game-details__composer';
  form.noValidate = true;
  form.innerHTML = `
    <span class="game-details__avatar game-details__avatar--you" aria-hidden="true"></span>
    <div class="game-details__composer-field">
      <textarea aria-label="Write a comment" placeholder="Write a comment…" rows="1"></textarea>
    </div>
    <button class="game-details__send" type="submit" aria-label="Send comment">➤</button>
  `;
  const status = document.createElement('p');
  status.className = 'game-details__composer-status';
  status.setAttribute('role', 'status');
  status.hidden = true;
  root.querySelector('.game-details__comments')?.before(form, status);
  const textarea = form.querySelector('textarea')!;
  const button = form.querySelector('button')!;
  const avatar = form.querySelector('span')!;
  let pending = false;
  let live = true;

  function controls(): void {
    const session = appSession.check();
    form.hidden = !session;
    textarea.disabled = pending || !session;
    button.disabled = pending || !session || validateCommentText(textarea.value) !== null;
    avatar.textContent = session ? commenterInitial(commentAuthorName(session)) : '';
  }
  function resize(): void {
    textarea.style.height = 'auto';
    const maximum = Number.parseFloat(getComputedStyle(textarea).maxHeight);
    textarea.style.height = `${Math.min(textarea.scrollHeight, maximum || Infinity)}px`;
  }
  const unsubscribe = appSession.subscribe((session) => {
    if (!session) status.hidden = true;
    controls();
  });
  textarea.addEventListener('input', () => {
    resize();
    controls();
    const error = validateCommentText(textarea.value);
    status.hidden = !textarea.value || !error;
    status.textContent = error || '';
    textarea.setAttribute('aria-invalid', String(Boolean(textarea.value && error)));
  });
  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending || !ensureActiveSession()) return;
    const error = validateCommentText(textarea.value);
    if (error) {
      status.textContent = error;
      status.hidden = false;
      return;
    }
    const session = appSession.check()!;
    pending = true;
    controls();
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending comment…';
    status.hidden = false;
    try {
      await submitComment(slug, textarea.value, session);
      if (!live) return;
      // A confirmed creation is never replayed, even if the subsequent read-only refresh fails.
      textarea.value = '';
      resize();
      const current = appSession.check();
      if (current?.email !== session.email || current.authenticatedAt !== session.authenticatedAt)
        return;
      status.hidden = true;
      showSnackbar('Comment submitted successfully.', 'success');
      await refresh();
    } catch (failure) {
      if (!live || appSession.check()?.authenticatedAt !== session.authenticatedAt) return;
      const unknown = !(failure instanceof MutationFailure) || failure.kind === 'unknown';
      const message = unknown
        ? 'Comment result is unknown. Check the comments before retrying.'
        : 'Comment could not be submitted. Please try again.';
      status.textContent = message;
      status.hidden = false;
      showSnackbar(message, 'error');
    } finally {
      pending = false;
      if (live) {
        form.removeAttribute('aria-busy');
        controls();
      }
    }
  });
  return () => {
    live = false;
    unsubscribe();
    form.remove();
    status.remove();
  };
}
