# Shared Caddy deployment safety

The production server already hosts services behind Docker container `dummy-stock-caddy`, using Docker network `dummy-stock-simulator_default` and shared configuration `/opt/dummy-stock-simulator/deploy/Caddyfile`. This arrangement is established by the existing MetElkaarOnline deployment, not assumed from an empty SpellWeaver repository.

`remote-deploy.sh` requires those resources, checks the exact Caddyfile bind mount, creates a fully isolated candidate container, validates its revision, then inserts only the SpellWeaver marked block in the shared Caddyfile. It backs up the original and validates in the **running** Caddy container before reloading. The other site blocks are neither deleted nor regenerated. No unrelated container, volume, database, or storage is touched. A failed Caddy validation restores the backup and does not reload the shared proxy. A successful run swaps only the `spellweaver-web` container; no Compose cleanup runs.

The initial rollout requires write permission on `/opt/spellweaver` and the shared Caddyfile (plus Docker access). The `DEPLOY_HOST_KEY_FINGERPRINT` variable, when set, overrides the known SSH identity used by the other Perry3Dnl production deployment workflow. Existing domains should be smoke-tested after the first rollout. `https://spellweaver.perry3d.nl/version.json` is the definitive revision signal.
