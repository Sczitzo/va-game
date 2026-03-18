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

## 2026-02-24 - Accessible Character Counters
**Learning:** Applying `aria-live` directly to a character counter's text (e.g. "245/300 characters") is too noisy as it announces every keystroke. Screen reader users need warning of impending limits without constant interruption.
**Action:** Apply progressive visual styling (e.g. orange at 80%, bold red at 90%) to the visible counter, but use a separate, visually hidden element (`role="status"`) to announce a static warning only when a threshold is crossed (e.g. "Approaching limit").
