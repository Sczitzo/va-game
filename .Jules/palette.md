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

## 2026-03-05 - Progressive SR-Only Form Feedback
**Learning:** For dynamic character counters in input forms, updating numeric text strings with `aria-live` regions creates noisy, constant interruption for screen readers. Instead, calculating threshold boundaries and revealing an `sr-only` `role="status"` element dynamically alerts screen reader users at critical milestones without continuous disruption.
**Action:** When creating text limits or dynamic boundaries, ensure screen readers are notified at milestones via dedicated invisible `role="status"` nodes rather than putting `aria-live` on frequently changing text itself.
