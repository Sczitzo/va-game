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

## 2025-03-04 - Progressive Feedback for Character Limits
**Learning:** Character counters that simply display numbers (e.g., "240 / 300") do not provide enough immediate visual cue when a user is approaching a limit, and attaching `aria-live` to the counter creates an overly noisy experience for screen readers.
**Action:** Use dynamic text colors (e.g., `text-orange-700` at 80%, `text-red-600` at 90%) for visual feedback, and introduce a separate, conditionally rendered `sr-only` element with `role="status"` to announce the warning to screen readers only when a threshold is crossed.
