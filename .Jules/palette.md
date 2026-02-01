# Palette's Journal

## 2026-01-26 - Accordion Semantics
**Learning:** Found an `<h2>` inside a `<button>` in an accordion header, which is invalid HTML and confusing for screen readers.
**Action:** Always wrap the button with the heading tag (e.g., `<h2><button>...</button></h2>`) for proper document structure and navigation.

## 2026-01-28 - Smart Skip Safety
**Learning:** Implementing a "soft" confirmation for destructive actions (like Skip) that resets on user interaction creates a safer yet non-intrusive experience.
**Action:** Use state-based button transformations for minor destructive actions instead of blocking modals.

## 2026-02-01 - Media Accessibility Beyond Labels
**Learning:** While `aria-label` helps screen readers, providing visible descriptions for media (video/audio) benefits all users by setting context before playback. Also, strict payload types can hide existing data fields (like `name`/`description`) needed for accessibility.
**Action:** Always check if backend data models have descriptive fields that are being omitted from API/Socket payloads, and expose them to improve UI accessibility.
