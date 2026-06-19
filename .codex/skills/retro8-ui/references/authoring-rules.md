# Retro8 Authoring Rules

## Class Composition

Use this order when composing classes:

1. Base class: `r8-btn`, `r8-panel`, `r8-navbar`
2. Modifier class: `r8-btn--primary`, `r8-badge--success`, `r8-btn--lg`
3. Inner element class: `r8-panel__header`, `r8-window__titlebar`

## Do

- Prefer semantic HTML and use `r8-*` as the visual API.
- Reuse documented patterns from component docs and examples.
- Keep markup concise and legible.
- Verify classes against official docs or the installed package before finalizing.

## Avoid

- Inventing undocumented `r8-*` classes or `data-r8-*` attributes.
- Replacing the semantic `r8-*` API with large utility-only class strings.
- Replicating a library component in application CSS.
- Adding another runtime import; this project already imports `retro8-ui/retro8.js`.

## Accessibility Checks

- Use `button` for actions and `a` for navigation.
- Preserve focus visibility and keyboard navigation.
- Keep landmarks and labels clear (`nav`, `aria-label`, `aria-current`, and related attributes).
- Keep component state synchronized with attributes such as `aria-expanded`, `aria-controls`, `aria-selected`, and `aria-checked` where applicable.
