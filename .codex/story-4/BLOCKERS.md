# Blockers

## Active prerequisite merge gate — PR #30

1. Existing screenshot shows project overview only. User must provide/attach genuine Firebase Console Authentication → Sign-in method evidence showing Email/Password enabled for minigames-rsschool. No connected Firebase Console access is available. Do not request passwords.
2. PR deadline is `[official RS App deadline]`. User must supply the actual RS App deadline (DD.MM.YYYY), including whether it differs across the six tasks. Do not invent it.

## Deployment readiness

Pages workflow currently triggers create-footer, story-2 and story-3 only. Before later public runtime evidence, a minimal separate infrastructure PR may be required to deploy story-4 and verify the served commit. No infrastructure branch created while Firebase prerequisite is blocked.

## Preserved local state

Existing modifications: src/components/AuthDialog.ts, src/styles/components/_auth-dialog.scss, src/utils/authDialog.ts, src/utils/authValidation.ts. Do not overwrite or include them without understanding their provenance.

Initial tracker files are uncommitted; include them in the first authorized task PR after resolving the prerequisite.

