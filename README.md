
## Story 4 app session

The app stores one profile JSON object under localStorage key `minigames:minigames-rsschool:app-session`. Fields: displayName, email, authenticatedAt (Date.now() milliseconds), and optional avatarUrl. Lifetime is exactly five minutes from successful authentication. Reloads and navigation do not renew the timestamp. Firebase identity is separate and never restores the app UI on its own; no passwords or Firebase tokens are stored in this record.

Review expiration by changing authenticatedAt to Date.now() - 300000, then reloading, navigating, or trying a protected action. Only this key is removed. Expiration clears UI state and calls Firebase signOut. Blocked actions are never replayed automatically; Game Details is restored when Auth closes.
