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

The GitHub Actions deploy workflow deploys **only** to `/opt/spellweaver/releases/<commit>` and atomically updates `/opt/spellweaver/current`. It does **not** modify `/etc/caddy/Caddyfile`, perform `docker compose down`, delete other application directories, or bind 80/443. It expects an already provisioned `spellweaver.service` listening on **127.0.0.1:18087**, and a shared Caddy route forwarding `spellweaver.perry3d.nl` to that local listener.

**One-time server provisioning (review current proxy first):**

1. Inspect `sudo systemctl status caddy`, `sudo cat /etc/caddy/Caddyfile`, `sudo ss -lntp` and the current shared reverse-proxy method. Verify 18087 is available. Do not disturb existing domains.
2. Install `deploy/spellweaver.service` under `/etc/systemd/system/spellweaver.service`, run `sudo systemctl daemon-reload` and `sudo systemctl enable --now spellweaver.service` *after* the first static release exists. The deploy workflow intentionally refuses to install system units with broad sudo.
3. **Only when appropriate for the actual shared proxy**, append the standalone host block from `deploy/Caddyfile.fragment` to the existing shared Caddyfile (or add it through the proxy's established include mechanism). Back up the original first, run `caddy validate --config /etc/caddy/Caddyfile` and reload Caddy; never replace the whole file or start a second proxy.
4. Add GitHub secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PASSWORD`, optionally `DEPLOY_PORT`, and repository variable `DEPLOY_HOST_KEY_FINGERPRINT` (the verified server ED25519 SHA256 fingerprint). Trigger push-to-main deployment.
5. Check `https://spellweaver.perry3d.nl/version.json` reports the exact deployed commit, then check the editor and existing domains. If the main Caddy process runs in Docker and cannot access host loopback, adapt only the dedicated host block to an appropriate reachable address after inspecting the shared network; do not assume `127.0.0.1` in a container reaches the host.

The shared server proxy and unit locations have **not** been directly inspected from this environment; the workflow deliberately fails safe rather than changing a live Caddy configuration without that inspection.

## Versioned configuration

`spellweaver.creation.v1` JSON stores center, rings, placed elements, runes, Amps, hand-drawn strokes, and cast duration. `spellweaver.ink-card.v1` stores 500 × 500 filled pixel indices (black/transparent). These are documented prototype schemas, not the final game protocol.
