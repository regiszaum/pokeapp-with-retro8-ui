# Project Instructions

## Retro8 UI is mandatory

- This project uses `retro8-ui` as its interface library. Build and refactor UI with documented Retro8 UI components, semantic `r8-*` classes, tokens, and interaction contracts.
- Before changing UI, read `.codex/skills/retro8-ui/SKILL.md` and the references it routes to for the task.
- Prefer existing Retro8 UI patterns over ad hoc component CSS, utility-heavy class strings, or replacement UI libraries.
- Do not invent `r8-*` classes or `data-r8-*` APIs. Verify them in `.codex/skills/retro8-ui/references/llms.txt`, then consult the linked official component page when exact markup or behavior matters.
- Keep custom CSS limited to application-specific composition or behavior that Retro8 UI does not provide.
- Preserve semantic HTML, keyboard behavior, visible focus, labels, and relevant `aria-*` state.

## Existing integration

- The dependency is already declared in `package.json`.
- Global CSS is already loaded from `retro8-ui/retro8.css` in `nuxt.config.ts`.
- The optional runtime is already loaded by `app/plugins/retro8.client.ts` and refreshed after Nuxt navigation.
- Use `pnpm` for dependency and project commands.
- Run `pnpm typecheck` and `pnpm build` after meaningful UI changes.
