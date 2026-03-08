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

## 2026-03-08 - Accessible Character Counters
**Learning:** Input fields with character limits must use a dynamic counter with progressive feedback (gray -> `text-orange-700` font-medium >80% -> `text-red-600` font-bold >90%). To prevent noisy screen reader updates, do NOT apply `aria-live` to the changing number text.
**Action:** Render a separate `sr-only` element with `role='status'` containing a static warning message (e.g., 'Approaching limit') only when the threshold is crossed.