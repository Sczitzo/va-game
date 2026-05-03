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

## 2026-10-25 - Dynamic Character Counters and aria-live
**Learning:** Applying `aria-live` to a changing character count text can cause noisy screen reader updates on every keystroke.
**Action:** Instead of dynamically updating an element with `aria-live`, conditionally render separate, strictly static visually hidden elements (`<div role="status" className="sr-only">...</div>`) when approaching or reaching the character limit.

## 2026-10-25 - Redundant aria-describedby in Labels
**Learning:** Using `aria-describedby` to point to a description element (e.g., "Optional" or "(0-10)") that is already nested inside the `<label>` of an input causes screen readers to incorrectly announce the description twice.
**Action:** Do not use `aria-describedby` if the descriptive text is already inside the `<label>` that points to the input.
