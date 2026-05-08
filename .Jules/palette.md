# Palette's Journal

## 2026-01-26 - Accordion Semantics
**Learning:** Found an `<h2>` inside a `<button>` in an accordion header, which is invalid HTML and confusing for screen readers.
**Action:** Always wrap the button with the heading tag (e.g., `<h2><button>...</button></h2>`) for proper document structure and navigation.

## 2026-01-28 - Smart Skip Safety
**Learning:** Implementing a "soft" confirmation for destructive actions (like Skip) that resets on user interaction creates a safer yet non-intrusive experience.
**Action:** Use state-based button transformations for minor destructive actions instead of blocking modals.

## 2026-02-11 - Contrast for Required Fields
**Learning:** The project's standard `text-red-500` for required asterisks fails WCAG AA contrast (3.7:1) on white backgrounds.
**Action:** Use `text-red-600` (5.7:1) or darker for all critical red text on light backgrounds.

## 2026-10-24 - Form Success State Feedback
**Learning:** Temporarily disabling the submit button and changing its state to a success message without wiping the form inputs asynchronously prevents data loss while maintaining clear feedback for the user on successful submissions.
**Action:** For successful form submissions, temporarily (e.g., 2s) disable the submit button, change its text to a success message, and reset the form inputs immediately rather than inside the timeout.

## 2024-05-08 - Accessible Character Counter Progression and Label Clean-up
**Learning:**
1. Conditionally updating color/weight for a character counter (e.g. orange at 80%, red at 90%) significantly improves the visual UX but should not have `aria-live` on the persistent changing number itself, to avoid annoying screen-reader feedback on every key stroke. Conditionally rendering separate `sr-only` static text messages when crossing specific thresholds works well to alert screen readers unobtrusively. (Though, ideally, keeping a persistent, empty live region and injecting text into it can be slightly more robust across all browser/SR combos).
2. Linking explanatory text inside a `<label>` to an input using `aria-describedby` causes double-reading issues because screen readers automatically read everything inside the `<label>` anyway.
**Action:** Use progressive color feedback for character limits coupled with static, threshold-based visually hidden live regions. Avoid using `aria-describedby` if the description is already physically located inside the input's associated `<label>`.
