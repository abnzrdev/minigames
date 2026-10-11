import { appSession } from '../utils/session';
import type { AppSession } from '../utils/appSession';

export class MutationFailure extends Error {
  readonly kind: 'unauthorized' | 'rejected' | 'unknown';
  constructor(kind: 'unauthorized' | 'rejected' | 'unknown', message: string) {
    super(message);
    this.kind = kind;
  }
}

export async function postSessionMutation(
  path: string,
  fields: Record<string, string> = {},
  expected?: AppSession,
  expectedStatus = 200
): Promise<unknown> {
  const session = appSession.check();
  if (
    !session ||
    (expected &&
      (session.email !== expected.email || session.authenticatedAt !== expected.authenticatedAt))
  ) {
    throw new MutationFailure('unauthorized', 'Please sign in before continuing.');
  }
  try {
    const response = await fetch(
      `https://faxb76kxra.execute-api.eu-central-1.amazonaws.com${path}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, userEmail: session.email }),
        signal: AbortSignal.timeout(15_000),
      }
    );
    if (!response.ok) {
      throw new MutationFailure(
        response.status >= 400 && response.status < 500 && response.status !== 408
          ? 'rejected'
          : 'unknown',
        `Request failed (${response.status}).`
      );
    }
    if (response.status !== expectedStatus) {
      throw new MutationFailure('unknown', 'Server result could not be confirmed.');
    }
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object' || !('data' in result)) {
      throw new MutationFailure('unknown', 'Server result could not be confirmed.');
    }
    return result.data;
  } catch (error) {
    if (error instanceof MutationFailure) throw error;
    // POST toggles are not idempotent: a lost response must never cause an automatic retry.
    throw new MutationFailure(
      'unknown',
      'The result is unknown. Refresh the state before trying again.'
    );
  }
}

export function readToggleResult(
  value: unknown,
  stateField: string
): { active: boolean; likesCount: number } {
  if (!value || typeof value !== 'object')
    throw new MutationFailure('unknown', 'Invalid server result.');
  const record = value as Record<string, unknown>;
  if (
    typeof record[stateField] !== 'boolean' ||
    typeof record.likesCount !== 'number' ||
    !Number.isSafeInteger(record.likesCount) ||
    record.likesCount < 0
  ) {
    throw new MutationFailure('unknown', 'Invalid server result.');
  }
  return { active: record[stateField], likesCount: record.likesCount };
}
