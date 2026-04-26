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

## 2026-10-24 - Accessible Dynamic Character Counters
**Learning:** Applying `aria-live` directly to a character counter (e.g., "240 / 300") causes screen readers to redundantly announce the numbers on every keystroke, leading to a noisy and distracting user experience.
**Action:** Remove `aria-live` from the visible counter. Instead, rely strictly on isolated, visually hidden elements (e.g., `<div role="status" className="sr-only">Approaching limit</div>`) that conditionally render *only* when specific mathematical thresholds are crossed (e.g., exactly at 80% or 100%), keeping the auditory feedback quiet and relevant.
