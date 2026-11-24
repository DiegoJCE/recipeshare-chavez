'use client';

import { useActionState } from 'react';
import { COMMENT_MAX_LENGTH } from '@/lib/comments';

export default function CommentForm({ action }) {
  const [state, formAction, pending] = useActionState(action, { error: '' });

  return (
    <form action={formAction}>
      <label className="field-label" htmlFor="comment">Your comment</label>
      <textarea
        id="comment"
        name="comment"
        rows={3}
        required
        maxLength={COMMENT_MAX_LENGTH}
        aria-invalid={Boolean(state.error)}
        aria-describedby={state.error ? 'comment-error' : undefined}
      />
      {state.error && <p id="comment-error" className="field-error" role="alert">{state.error}</p>}
      <button type="submit" className="button button-primary" disabled={pending}>
        {pending ? 'Posting…' : 'Post comment'}
      </button>
    </form>
  );
}
