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

## 2026-10-25 - Progressive Character Limit Feedback
**Learning:** Using `aria-live` on a dynamic character count creates excessive noise for screen reader users. Additionally, linking an input to explanatory text via `aria-describedby` when that text is already in the `<label>` causes duplicate announcements.
**Action:** Implement character limits with a progressive visual indicator, but conditionally render strictly static `sr-only` elements with `role="status"` at specific thresholds (e.g., 80% and 100%) for non-intrusive accessibility. Never use `aria-describedby` for text inside a label.
