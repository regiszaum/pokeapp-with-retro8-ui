---
name: retro8-ui
description: Design, implement, and review this project's interfaces with Retro8 UI semantic classes (`r8-*`), tokens, components, accessibility patterns, and optional runtime behavior. Use for every UI, layout, styling, theme, form, navigation, feedback, or interactive component task in this repository, including migrations away from ad hoc CSS or utility-heavy markup.
---

# Retro8 UI

## Project Contract

Use `retro8-ui` as this application's interface library. Produce production-ready Nuxt/Vue patches with documented semantic markup and preserve the existing Retro8 visual language.

Treat Retro8 UI as the default for interface primitives. Add application CSS only for product-specific composition that the library does not cover.

## Workflow

1. Confirm the existing integration.
- Inspect `package.json`, `nuxt.config.ts`, `app/plugins/retro8.client.ts`, and nearby markup before editing.
- Preserve the existing `retro8-ui/retro8.css` and `retro8-ui/retro8.js` integration.
- Do not add another UI component library for a pattern Retro8 UI provides.

2. Select documented components.
- Read `references/component-index.md` to map the requested interface to component IDs.
- Use `references/llms.txt` as the complete official route map.
- Open the linked official component documentation when exact markup, modifiers, inner elements, or `data-r8-*` behavior matters.

3. Compose semantic markup.
- Prefer semantic HTML first (`button`, `nav`, `dialog`, `label`, `table`, and similar).
- Compose classes as base + optional modifiers + optional inner elements.
- Keep consumer markup concise; prefer documented `r8-*` classes over utility-heavy strings and one-off replicas.
- Never invent an `r8-*` class or interaction API.

4. Wire behavior deliberately.
- Use CSS-only components for static presentation.
- For interactive components, follow documented `data-r8-*` contracts and the runtime already imported by the Nuxt client plugin.
- Ensure dynamically rendered interactive markup is compatible with `window.Retro8UI.refresh()`.

5. Validate the result.
- Verify class names and interaction attributes against official documentation or the installed package.
- Preserve accessible names, semantics, keyboard behavior, focus visibility, landmarks, and state attributes.
- Run `pnpm typecheck` and `pnpm build` after meaningful changes.

## Output Rules

- Return concrete file edits instead of abstract design notes when implementation is requested.
- Prefer minimal diffs that fit the existing Nuxt architecture.
- Preserve Retro8 UI's visual identity unless the user explicitly requests a supported theme or variant.
- State any unavoidable custom styling or departure from documented patterns.

## References

- Read `references/quick-start.md` for setup, import, and runtime decisions.
- Read `references/authoring-rules.md` for markup, class composition, and accessibility conventions.
- Read `references/component-index.md` to select components and documentation routes.
- Read `references/llms.txt` for the complete official documentation map supplied for LLM ingestion.
- Read `references/llms-guide.md` for the complete human-facing guide to that feed.
- Read `references/skills-guide.md` when authoring or reviewing AI workflows and accessibility audits for Retro8 UI.
