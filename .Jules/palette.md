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

## 2024-05-18 - Dynamic Character Counter ARIA Optimization
**Learning:** When creating progressive character limit warnings (e.g., text changing from gray to orange to red), using a ternary operator to dynamically change the text inside a single persistent `div` can cause screen readers to incorrectly read the text on every keystroke if `aria-live` is applied. Even without `aria-live`, the changing visual state isn't explicitly announced when thresholds are crossed.
**Action:** Instead of making the visible counter dynamic for screen readers, render it without special ARIA roles. Conditionally render a *completely separate, visually hidden* element (`<div role="status" className="sr-only">`) that contains a strictly static warning message (e.g., "Approaching limit" or "Character limit reached") only when the mathematical threshold is crossed. This ensures the screen reader announces the status exactly once when the condition is met, without noisy updates.
