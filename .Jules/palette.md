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

## 2024-04-11 - Accessible Progressive Character Limit Feedback
**Learning:** Adding dynamic visual character counters (e.g. gray -> orange -> red based on percentage capacity) is great for visual feedback, but causes extremely noisy screen reader experiences if `aria-live` is applied to the changing numbers on every keystroke. Using static `aria-describedby` provides context but doesn't alert the user when they approach the limit.
**Action:** When implementing character limit warnings, use standard visually dynamic classes (e.g., `text-orange-700` at >80%, `text-red-600` at >90% or 100%), but for screen readers, render separate, strictly static visually hidden elements (`<div role="status" className="sr-only">Approaching character limit</div>`) only when the thresholds are crossed. Do not include dynamic numbers in this hidden text to prevent repetitive announcements.
