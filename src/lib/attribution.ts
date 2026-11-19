/**
 * Canonical value for `contributed_by`.
 *
 * Firestore rules (see `firestore.rules` -> isValidContribution) only accept the
 * caller's uid or the `name` claim from their verified token, so one user cannot
 * post vocabulary under someone else's name. Everything that writes a
 * contribution must go through this helper.
 */

export interface AttributionUser {
  uid: string;
  displayName?: string | null;
  email?: string | null;
}

export function attributionFor(user: AttributionUser | null | undefined): string {
  if (!user) return 'local-device';
  // Display name is the value the rules accept via request.auth.token.name;
  // uid is always accepted, so fall back to it.
  return user.displayName?.trim() || user.uid;
}
