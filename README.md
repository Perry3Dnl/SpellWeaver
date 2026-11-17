# SpellWeaver — Arcane Atelier

Browser-first, dependency-free SpellWeaver spell creator based on **Spellwaving Game Design v37 (17 November 2026)**. The game rulebook is the source of truth. This is the *editor prototype*, not a validated magical behavior interpreter.

## Features

- 124 elemental catalogue entries (118 exact source chemical signature assignments and six magical entries), with dedicated mandatory central element and automatic visible Void fallback.
- 26 working ring styles, 26 proposed secondary runes, and five double-diamond Amp tiers; restrict Amp placement to the four diagonals and disallow the same axis on consecutive rings.
- Select and drag elements and runes around rings; independent element scale and rotation; before/after rune tracks; add rings; draw/erase freehand black ink; undo/redo.
- Exact 500 × 500 **unique filled pixel count**, recomputed from the assembled rendering; export/import editor JSON and a 500 × 500 binary ink card.
- Save local **immutable design snapshots**, explicitly NOT a finalized executable spell. The rulebook lacks calibrated mana, stability and recognition parameters. The editor intentionally labels these values `UNSET` rather than inventing them.

### Known limitations

Canonical machine-readable stroke definitions for Mana, Void, Light, Darkness, Holy and Unholy are not finalized; their displayed drawings are **provisional** and should not be treated as approved executable signatures. The 26 A–Z rune **icons are placeholders**, since the canonical rune drawings are similarly pending. Ring modifier geometries approximate the working visual families and **are not deterministic pattern recognition**. Component metadata informs visual editing; raw ink interpretation, target selection, full-card placements, embedded cards and game economy are not implemented. The browser frontend has no backend, account support or OpenAI API calls. Saving to the personal spellbook here creates a downloadable draft snapshot, without gameplay inventory usage or in-game executable behavior. The existing document defines these as follow-on tasks.

## Run and test

Node.js 22 recommended (no external npm dependencies). Run `npm run check` for tests and the build. Serve `dist/` using a static server (e.g. `python3 -m http.server 8080 --directory dist`), then open `http://localhost:8080`. Static JSON imports require an HTTP server, not `file://`.

## Deployment / Caddy safety

This repository follows the server's **existing** Docker/Caddy arrangement discovered in the Perry3Dnl/MetElkaarOnline project. Production is `https://spellweaver.perry3d.nl`; it shares the existing `dummy-stock-caddy` reverse proxy and `dummy-stock-simulator_default` network, without running another proxy on ports 80/443.

GitHub Actions checks the source, builds static `dist/`, authenticates over SSH with the configured host/user/password and an **ED25519 host-key fingerprint**, and uploads the exact commit as an isolated release under `/opt/spellweaver/releases/<sha>`. Deployment creates a dedicated static container with the `spellweaver-web` network alias. It modifies **only the dedicated SpellWeaver marker block** in `/opt/dummy-stock-simulator/deploy/Caddyfile`, preserves a timestamped backup, validates the combined Caddy configuration inside the running proxy, and reloads the existing proxy without recreating it. Other containers, storage, databases, and site blocks remain untouched. See `deploy/README.md`.

This initial production setup requires the deploy account to be able to create `/opt/spellweaver`, access Docker and edit the existing Caddyfile. If host permissions, fingerprint, or layout differ, deployment fails closed; do not relax security to force a pass. The repo's `DEPLOY_HOST_KEY_FINGERPRINT` variable may override the pinned identity used in the other production repo. Secret names: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PASSWORD`, and optional `DEPLOY_PORT`.

Successful deployment must be verified at `https://spellweaver.perry3d.nl/version.json` by matching its `revision` to the GitHub commit, and by testing the page and previously running services. A completed GitHub Actions job without a matching live version is not considered release completion.

## Versioned configuration

`spellweaver.creation.v1` JSON stores center, rings, placed elements, runes, Amps, hand-drawn strokes, and cast duration. `spellweaver.ink-card.v1` stores 500 × 500 filled pixel indices (black/transparent). These are documented prototype schemas, not the final game protocol.

## Experimental elemental starter cards

The new **Cards** tab contains Fire, Water, Ice, Lava, Steam and Wind compositions built from existing atomic element drawings, rings and runes. Click a card to place a copy of its ink on the outermost ring; click the placed card to select it, drag it, replace its template, or adjust ring, scale and rotation. Each placed card stores the entire template source in exported spell JSON, so importing the same design does not depend on a local catalogue. The composite ink is rendered and recorded with the rest of the inscription.

**No recipes are canonical yet.** The game design explicitly leaves chemical reactions, recognition thresholds and casting outcomes undefined. Names and ingredient lists are educational starting points, not awarded spells or guaranteed effects. No magical effect is derived from the card name, and no extra mana charge is assigned to card placement. These remain prototype ink constructions, not castable entries.
