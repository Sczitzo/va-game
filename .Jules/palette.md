# Palette's Journal

## 2026-01-26 - Accordion Semantics
**Learning:** Found an `<h2>` inside a `<button>` in an accordion header, which is invalid HTML and confusing for screen readers.
**Action:** Always wrap the button with the heading tag (e.g., `<h2><button>...</button></h2>`) for proper document structure and navigation.

## 2026-01-28 - Smart Skip Safety
**Learning:** Implementing a "soft" confirmation for destructive actions (like Skip) that resets on user interaction creates a safer yet non-intrusive experience.
**Action:** Use state-based button transformations for minor destructive actions instead of blocking modals.

## 2026-01-30 - Contextual Loading States
**Learning:** For list items with async actions, tracking loading state by ID (e.g., `${id}-${action}`) prevents blocking the entire list and provides precise feedback.
**Action:** Use a composite key state for tracking pending actions in lists instead of a global `isLoading` boolean.
