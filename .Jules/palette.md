# Palette's Journal

## 2026-01-26 - Accordion Semantics
**Learning:** Found an `<h2>` inside a `<button>` in an accordion header, which is invalid HTML and confusing for screen readers.
**Action:** Always wrap the button with the heading tag (e.g., `<h2><button>...</button></h2>`) for proper document structure and navigation.

## 2026-01-28 - Smart Skip Safety
**Learning:** Implementing a "soft" confirmation for destructive actions (like Skip) that resets on user interaction creates a safer yet non-intrusive experience.
**Action:** Use state-based button transformations for minor destructive actions instead of blocking modals.

## 2026-02-07 - Accessible Character Limits
**Learning:** Screen readers need explicit linking between inputs and their dynamic character counters, but `aria-live` on the counter itself is too verbose.
**Action:** Use `maxLength` on the input + `aria-describedby` pointing to the counter ID. Do NOT use `aria-live` on the counter.
