import unittest
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('caddy_update',Path(__file__).resolve().parents[1]/'deploy'/'caddy-update.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

class CaddyPreservationTests(unittest.TestCase):
    def test_append_retains_original_sites_and_is_idempotent(self):
        original='stocks.perry3d.nl {\n    reverse_proxy stocks:8080\n}\n\nmetelkaar.online {\n    reverse_proxy metelkaar-online-web:3000\n}\n'
        updated=module.update(original)
        self.assertTrue(updated.startswith(original))
        self.assertIn('spellweaver.perry3d.nl',updated)
        self.assertEqual(module.update(updated),updated)
    def test_existing_unmanaged_site_is_not_replaced(self):
        with self.assertRaises(ValueError):module.update('spellweaver.perry3d.nl { reverse_proxy old:80 }')
    def test_unbalanced_markers_abort(self):
        with self.assertRaises(ValueError):module.update(module.START+'\n')
    def test_modifies_only_own_marked_block(self):
        original='a.nl {\n respond "a"\n}\n'+module.START+'\nold\n'+module.END+'\nz.nl {\n respond "z"\n}\n'
        updated=module.update(original)
        self.assertTrue(updated.startswith('a.nl {\n respond "a"\n}\n'))
        self.assertTrue(updated.endswith('\nz.nl {\n respond "z"\n}\n'))

if __name__=='__main__':unittest.main()
