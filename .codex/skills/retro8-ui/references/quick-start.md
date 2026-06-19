# Retro8 Quick Start Reference

## Install

This project uses pnpm:

```bash
pnpm add retro8-ui
```

The package is already present in this repository. Do not reinstall it unless dependency repair or an explicit upgrade is required.

## Imports

Use compiled assets. Tailwind is not required.

### Bundler / ESM

```js
import 'retro8-ui/retro8.css'
import 'retro8-ui/retro8.js'
```

### CSS-only usage

```js
import 'retro8-ui/retro8.css'
```

### Plain HTML

```html
<link rel="stylesheet" href="./node_modules/retro8-ui/dist/retro8.css" />
<script src="./node_modules/retro8-ui/dist/retro8.js" defer></script>
```

## This Project

- `nuxt.config.ts` loads `retro8-ui/retro8.css` globally.
- `app/plugins/retro8.client.ts` loads `retro8-ui/retro8.js` on the client.
- The plugin calls `window.Retro8UI.refresh()` after navigation so the runtime can discover newly rendered markup.

## Runtime Guidance

Use the runtime for documented interactive behavior such as dropdowns, dialogs, drawers, tabs, collapses, carousels, select-like controls, sliders, input tags, transfer lists, poptips, and dismissible feedback.

Keep components CSS-only when the task is purely static layout or styling.
