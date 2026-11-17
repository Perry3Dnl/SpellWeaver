# SpellWeaver — Arcane Atelier

Browser-first, dependency-free SpellWeaver spell creator based on **Spellwaving Game Design v37 (17 November 2026)**. The game rulebook is the source of truth. This is the *editor prototype*, not a validated magical behavior interpreter.

## Features

- 124 elemental catalogue entries (118 exact source chemical signature assignments and six magical entries), with dedicated mandatory central element and automatic visible Void fallback.
- 26 working ring styles, 26 proposed secondary runes, and five double-diamond Amp tiers; restrict Amp placement to the four diagonals and disallow the same axis on consecutive rings.
- Select and drag elements and runes around rings; independent element scale and rotation; before/after rune tracks; add rings; draw/erase freehand black ink; undo/redo.
- Exact 500 × 500 **unique filled pixel count**, recomputed from the assembled rendering; export/import editor JSON and a 500 × 500 binary ink card.
- Save local **immutable design snapshots**, explicitly NOT a finalized executable spell. The rulebook lacks calibrated mana, stability and recognition parameters. The editor intentionally labels these values `UNSET` rather than inventing them.

### Known limitations

Canonical machine-readable stroke definitions for Mana, Void, Light, Darkness, Holy and Unholy are not finalized; their displayed drawings are **provisional** and should not be treated as approved executable signatures. The 26 A–Z rune **icons are placeholders**, since the canonical rune drawings are similarly pending. Ring modifier geometries approximate the working visual families and **are not deterministic pattern recognition**. Component metadata informs visual editing; raw ink interpretation, target selection, full-card placements, embedded cards and game economy are not implemented. The production demo has a protected Python backend with a single demo login and a limited OpenAI interpretation endpoint; it is not a full player account system. Saving to the personal spellbook here creates a downloadable draft snapshot, without gameplay inventory usage or in-game executable behavior. The existing document defines these as follow-on tasks.

## Run and test

Node.js 22 recommended (no external npm dependencies). Run `npm run check` for tests and the build. The checked-in static files remain build artifacts, but the private demo now requires the Python server: set `SPELLWEAVER_DEMO_PASSWORD` and `OPENAI_API_KEY` in your environment, then run `SPELLWEAVER_SITE=dist SPELLWEAVER_HOST=127.0.0.1 SPELLWEAVER_ORIGIN=http://localhost:8080 python3 dist/server.py`. The production cookie is Secure, so login requires HTTPS in production; use HTTPS for integration testing. `npm run check` runs all source, backend and deployment checks.

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

## Ring-targeted repeated placement

Click a ring on the inscription to select it as the active **placement target** (highlighted green). Then choose Elements, Runes or Cards in the left catalogue and click as many components as desired. The selected ring remains active so catalogue clicks **add new instances** without replacing the previously placed component. Its pattern can still be changed from the Rings catalogue. Clicking an existing element, rune, card, amp or the central element leaves placement mode and restores the normal left-catalogue **replace selected component** behavior; Escape also leaves placement mode. Adding a new ring makes the new ring the active target.

New elements, after-side runes and cards choose the midpoint of the largest available angular gap on their ring and track, keeping existing manually arranged placements unchanged. This is best-effort spacing rather than a physical collision guarantee: at high densities or large component scales strokes can still overlap, as the spell design allows.

## Materials catalogue (30 templates)

A dedicated **Materials** tab supplies 30 experimental reusable material ink cards: Rock, Dirt, Sand, Gravel, Clay, Granite, Basalt, Limestone, Marble, Obsidian, Quartz, Glass, Salt, Coal, Charcoal, Iron, Copper, Gold, Silver, Aluminium, Tin, Lead, Titanium, Nickel, Zinc, Steel, Bronze, Brass, Concrete and Brick. Each has a self-contained existing v37 elemental/ring/rune drawing; there are no new elemental primitives.

Click a selected ring, then repeatedly click material cards to place copies, automatically distributed among free angles. Click a placed card to change its template or edit ring, rotation, scale and position. Export and import embed the complete source ink. Material recipes use simplified constituent motifs rather than physically exact structures, and their names **do not guarantee** a material will be produced. A recognized, rule-governed interpreter is still required before these become validated castable results. The additional tab does not change the mana, stability or spellbook rules.

### Catalogue card click behavior

For both **Materials** and **Cards**, a single click edits/replaces the currently selected card when no placement ring is active. **Double-click** adds exactly one new card, including when another material is selected; **Shift+click** is an alternative for adding one card via mouse/keyboard. With a ring selected, any card click adds a new instance to that ring. To avoid replacing the card on the first click of a double-click, the single-click action waits briefly for a possible second click. Selection remains editable after insertion and the existing largest-free-gap placement logic remains in use.

## Private demo login and AI interpreter

The site is no longer publicly served as an unprotected static editor. The server exposes a **single demo username** (`bob`), with the password stored **only** in the `SPELLWEAVER_DEMO_PASSWORD` production GitHub Actions secret. Do not put this password or your OpenAI API key into source files, the browser bundle, or Git. The demo PIN is intentionally short; do not use this as an internet-facing multi-user authentication system. Use a long unique password if the project becomes publicly advertised.

The backend issues HTTP-only, Secure, SameSite=Strict signed cookies using a random signing key generated automatically at server startup (sessions expire on restart), checks request origin on POST, throttles login attempts, limits AI calls to 15 per IP and 100 globally per rolling 24 hours (in-memory per server process), and caps request size and generated tokens. It does not claim canonical v37 spell behavior: AI output is a **provisional interpretation**, not a certified simulation, mana calculation or resolved spellbook entry. Responses are not retained by the app and API calls use `store: false`. The OpenAI API is billed separately from ChatGPT subscriptions.

### Required production secrets (no server shell access required)

Open the repository's **Settings → Secrets and variables → Actions → New repository secret** (or configure these as secrets in the production environment):

- `SPELLWEAVER_DEMO_PASSWORD`: the demo password selected by the project owner; the username is `bob`.
- `OPENAI_API_KEY`: a project-scoped key from [OpenAI Platform](https://platform.openai.com/api-keys). Set project-level spend limits in Platform billing. The default model is `gpt-4.1-mini` (server-side only).

**Deployment fails closed** if either secret is missing, leaving the last healthy site running. The workflow transfers a `0600` private runtime file to `/opt/spellweaver/private/runtime.env` through pinned SSH and uses Docker's `--env-file`; only the SpellWeaver container is replaced. Caddy continues to proxy its existing host block. The key/password are not printed or written under the static release directory. No other containers are changed.

To verify production, unauthenticated `/` should redirect to `/login`, unauthenticated `/app.js` should return 401, an authenticated session should access the editor, `/api/session` should report authentication and AI readiness, and a test interpretation should return a provisional result. The public `/version.json` reports the deployed commit for release verification.

No manually provisioned session secret is required: the backend generates one at startup. Logging in again after a deployment or container restart is expected. All setup is done in GitHub Actions secrets; no SSH or server commands are required from the project owner.
