# Design System Sync Bundle

Self-contained HTML previews of U.Psy's live design tokens (colors, type scale, buttons, cards, badges), generated from `src/styles.css` (Tailwind v4 `@theme` tokens).

These exist so the design system can be synced to a Claude Design project via the `/design-sync` skill and the `DesignSync` tool as soon as design-system authorization is available in this environment (it currently requires `/design-login` in an interactive terminal). Each file under `previews/` is self-contained (inline styles, Google Fonts CDN links) and starts with a `<!-- @dsCard group="..." -->` marker so it's picked up automatically as a card in the Design System pane on upload — no manual registration needed.

To sync: run `/design-sync` from a local `claude` session in this repo (after `/design-login`), or drag these files into an existing claude.ai/design project.
