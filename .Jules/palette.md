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

## 2024-05-24 - Accessible Character Limit Warnings
**Learning:** Screen readers become overly noisy if `aria-live` is applied directly to a character counter that updates on every keystroke. It is better to use distinct, conditionally rendered static `role="status"` nodes to announce specific thresholds (e.g., "Approaching character limit"). Also, do not use `aria-describedby` for explanatory text already nested in a `<label>`.
**Action:** Implement progressive character limits by visually changing text color and rendering separate, static visually hidden nodes for critical screen reader announcements, and avoid redundant `aria-describedby` links inside labels.
