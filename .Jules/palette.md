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

## 2026-03-05 - Safe Form Destructive Actions
**Learning:** Avoid using native `window.confirm` for minor destructive actions like ending a session, as it blocks the thread and screen readers handle it inconsistently. A better approach is a local two-step confirmation (e.g., changing button state from "End Session" to a red "⚠️ Click again to confirm" with a timeout).
**Action:** Use a soft state-based confirmation for disruptive actions (using `useState` and `setTimeout`) to improve accessibility and visual flow without blocking the user.
