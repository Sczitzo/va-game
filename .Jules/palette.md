# Palette's Journal

## 2026-01-26 - Accordion Semantics
**Learning:** Found an `<h2>` inside a `<button>` in an accordion header, which is invalid HTML and confusing for screen readers.
**Action:** Always wrap the button with the heading tag (e.g., `<h2><button>...</button></h2>`) for proper document structure and navigation.

## 2026-01-28 - Smart Skip Safety
**Learning:** Implementing a "soft" confirmation for destructive actions (like Skip) that resets on user interaction creates a safer yet non-intrusive experience.
**Action:** Use state-based button transformations for minor destructive actions instead of blocking modals.

## 2026-02-05 - Accessible Character Limits
**Learning:** Users typing long responses need clear feedback before they hit the limit. Screen readers need `aria-describedby` to associate the counter with the input.
**Action:** Combine `maxLength`, `aria-describedby`, and a dynamic counter that changes color (e.g., to red) when approaching the limit.
