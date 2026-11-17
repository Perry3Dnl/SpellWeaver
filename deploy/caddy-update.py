#!/usr/bin/env python3
"""Add/refresh exactly one SpellWeaver site block; keep all other Caddy text byte-for-byte.

Run before Caddy validation/reload. The caller is responsible for a backup and
transactional rollback when validation fails. Never create a new Caddyfile.
"""
from __future__ import annotations
import argparse
from pathlib import Path

START = '# --- spellweaver (managed by /opt/spellweaver) ---'
END = '# --- end spellweaver ---'
BLOCK = f'''{START}
spellweaver.perry3d.nl {{
    encode zstd gzip
    header X-Content-Type-Options nosniff
    header Referrer-Policy "strict-origin-when-cross-origin"
    reverse_proxy spellweaver-web:8080
}}
{END}'''


def update(current: str) -> str:
    if current.count(START) != current.count(END):
        raise ValueError('Incomplete SpellWeaver Caddy markers: refusing to modify shared configuration')
    if current.count(START) > 1:
        raise ValueError('Duplicate SpellWeaver Caddy markers: refusing to modify shared configuration')
    if current.count(START) == 1:
        before, rest = current.split(START, 1)
        _, after = rest.split(END, 1)
        return before + BLOCK + after
    # A site already administered by another deployment must not be hijacked.
    if 'spellweaver.perry3d.nl' in current.lower():
        raise ValueError('Existing unmanaged SpellWeaver site: manual inspection required')
    return current.rstrip('\n') + '\n\n' + BLOCK + '\n'


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('caddyfile')
    args = parser.parse_args()
    path = Path(args.caddyfile)
    if not path.is_file():
        parser.error('Shared Caddyfile does not exist')
    original = path.read_text(encoding='utf-8')
    planned = update(original)
    if planned != original:
        # Write in place to retain the inode of an existing Docker bind mount.
        with path.open('w', encoding='utf-8') as handle:
            handle.write(planned)
    print('SpellWeaver Caddy route ready; other sites preserved')


if __name__ == '__main__':
    main()
