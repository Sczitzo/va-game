## 2024-05-14 - Character Limit Feedback
**Learning:** Input fields with character limits must use a dynamic counter with progressive feedback (gray -> `text-orange-700` font-medium >80% -> `text-red-600` font-bold >90%). To prevent noisy screen reader updates, do NOT apply `aria-live` to the changing number text. Instead, render a separate `sr-only` element with `role='status'` containing a static warning message (e.g., 'Approaching limit') only when the threshold is crossed.
**Action:** Implemented dynamic counter in ResponseForm.tsx.

## 2024-05-15 - Form Submission Success Feedback
**Learning:** For successful form submissions, temporarily (e.g., 2s) disable the submit button, change its text to a success message (e.g., '✅ Sent!'), and apply a success color with `!opacity-100` to override default disabled styling. Crucially, reset the form inputs *immediately* rather than inside the timeout, preventing input wiping if the user starts typing their next entry during the success state.
**Action:** Implemented success feedback in ResponseForm.tsx.

## 2024-05-16 - Destructive Action Confirmations
**Learning:** Native `window.confirm` dialogs present accessibility issues and abruptly break the user flow. Prefer state-based "soft" confirmations for destructive actions (like ending a session or skipping a prompt) where the button changes visually (e.g., text to "⚠️ Confirm Action", red styling, bold) and requires a second click within a short timeout window.
**Action:** Replaced `window.confirm` with a state-based double-click soft confirmation in SessionConsole.tsx using a timeout.
