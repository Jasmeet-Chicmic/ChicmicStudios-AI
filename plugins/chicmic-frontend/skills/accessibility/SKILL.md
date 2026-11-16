---
name: accessibility
description: Use when building UI that must be accessible, fixing a11y issues, adding keyboard support, focus management, ARIA, modals, menus or tabs, or auditing a React or Next.js page against WCAG 2.2 AA.
---

# Accessibility (WCAG 2.2 AA)

## Rules

- **Semantic HTML first**: `<button>` for actions, `<a href>` for navigation, `<nav>`, `<main>`, `<header>`, headings in order (`h1` → `h2` …). ARIA only when no native element exists.
- **Keyboard**: everything clickable is reachable with Tab and works with Enter/Space; no keyboard traps; visible focus style (never `outline: none` without a replacement).
- **Images**: meaningful images get descriptive `alt`; decorative ones get `alt=""`.
- **Forms**: every input has a label; errors are announced (`aria-describedby`, `role="alert"` for form-level errors).
- **Colour**: text contrast ≥ 4.5:1 (3:1 for large text and UI controls); never use colour alone to convey state.
- **Dynamic content**: loading and status updates use `role="status"` / `aria-live="polite"`.
- **Modals / dialogs**: use the native `<dialog>` or a tested library (Radix, Headless UI, React Aria). Focus moves into the dialog, is trapped while open, Escape closes it, and focus returns to the trigger on close.
- **Route changes (SPA)**: move focus to the new page's `h1` or announce the page title.
- **Touch targets**: at least 24×24 CSS px.
- **Motion**: respect `prefers-reduced-motion`.
- Icon-only buttons need an accessible name: `<button aria-label="Close">`.

## Audit steps

1. Run axe: browser extension, or `@axe-core/playwright` / `vitest-axe` in tests.
2. Tab through the whole page without a mouse.
3. Zoom to 200% and check nothing overlaps or is cut off.
4. Check with a screen reader on one key flow (NVDA on Windows, VoiceOver on Mac/iOS).
5. Lighthouse accessibility score as a quick sanity check (not a replacement for 1–4).

## Report format

```markdown
| Issue | Where | WCAG | Severity | Fix |
| ----- | ----- | ---- | -------- | --- |
```
