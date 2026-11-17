import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import threading
import unittest
import urllib.error
import urllib.request

spec = importlib.util.spec_from_file_location("sw_server", Path(__file__).resolve().parents[1] / "server.py")
sw = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sw)

class ServerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        root = Path(self.temp.name)
        for name in ["index.html", "login.html", "login.js", "login.css", "version.json"]:
            (root / name).write_text('{"revision":"test"}' if name=="version.json" else f"<div>{name}</div>")
        self.old = (sw.ROOT, sw.PASSWORD, sw.SESSION_SECRET, sw.OPENAI_API_KEY)
        sw.ROOT = root
        sw.PASSWORD = "test-only-pin"
        sw.SESSION_SECRET = "unit-test-secret-with-more-than-32-characters"
        sw.OPENAI_API_KEY = ""
        sw.attempts.clear()
        sw.usage.clear()
        self.http = sw.ThreadingHTTPServer(("127.0.0.1", 0), sw.Handler)
        self.thread = threading.Thread(target=self.http.serve_forever, daemon=True)
        self.thread.start()
        self.base = f"http://127.0.0.1:{self.http.server_port}"
    def tearDown(self):
        self.http.shutdown()
        self.http.server_close()
        self.thread.join(timeout=2)
        sw.ROOT, sw.PASSWORD, sw.SESSION_SECRET, sw.OPENAI_API_KEY = self.old
        self.temp.cleanup()
    def request(self, path, payload=None, cookie=None, origin=True):
        headers = {"Origin": sw.SITE_ORIGIN} if origin else {}
        if payload is not None:
            headers["Content-Type"]="application/json"
            body = json.dumps(payload).encode()
        else: body = None
        if cookie: headers["Cookie"] = cookie
        req = urllib.request.Request(self.base+path, data=body, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                return resp.status, dict(resp.headers), resp.read()
        except urllib.error.HTTPError as ex:
            return ex.code, dict(ex.headers), ex.read()
    def test_locked_without_session(self):
        for path in ["/", "/index.html", "/app.js", "/src/elements.json"]:
            self.assertEqual(self.request(path)[0],401)
        self.assertEqual(self.request("/login")[0],200)
        self.assertEqual(self.request("/login.js")[0],200)
        self.assertEqual(self.request("/login.css")[0],200)
        self.assertEqual(self.request("/version.json")[0],200)
        self.assertEqual(self.request("/api/interpret",{"spell":{}})[0],401)
    def test_login_signed_cookie_and_logout(self):
        self.assertEqual(self.request("/api/login",{"username":"bob","password":"bad"})[0],401)
        status, headers, _ = self.request("/api/login",{"username":"bob","password":"test-only-pin"})
        self.assertEqual(status,200)
        set_cookie=headers.get("Set-Cookie","")
        for attr in ["Secure","HttpOnly","SameSite=Strict"]:
            self.assertIn(attr,set_cookie)
        cookie=set_cookie.split(";",1)[0]
        self.assertEqual(self.request("/index.html",cookie=cookie)[0],200)
        self.assertEqual(self.request("/api/interpret",{"spell":{}},cookie=cookie)[0],503)
        self.assertEqual(self.request("/api/logout",{},cookie=cookie)[0],200)
        self.assertEqual(self.request("/",origin=False)[0],401)
    def test_csrf_and_login_throttling(self):
        self.assertEqual(self.request("/api/login",{"username":"bob","password":"test-only-pin"},origin=False)[0],403)
        for _ in range(4): self.assertEqual(self.request("/api/login",{"username":"bob","password":"wrong"})[0],401)
        self.assertEqual(self.request("/api/login",{"username":"bob","password":"wrong"})[0],429)
    def test_session_tamper(self):
        sw.SESSION_SECRET = "stable-secret-for-unit-tests-32-char-xyz"
        tok=sw.token()
        self.assertTrue(sw.valid_token(tok))
        self.assertFalse(sw.valid_token(tok[:-1]+("a" if tok[-1]!="a" else "b")))
    def test_interpret_validation_happens_before_provider(self):
        for spell in [{}, {"schema":"spellweaver.creation.v1","rings":[]}, 
                      {"schema":"spellweaver.creation.v1",**{k:[] for k in ("rings","elements","runes","amps","cards","strokes")}}]:
            if not spell.get("schema"):
                with self.assertRaises(ValueError): sw.interpret(spell)
            elif not all(k in spell for k in ("rings","elements","runes","amps","cards","strokes")):
                with self.assertRaises(ValueError): sw.interpret(spell)
    def test_runtime_configuration_is_not_embedded_in_static(self):
        source=(Path(__file__).resolve().parents[1] / "server.py").read_text()
        self.assertIn('os.environ.get("OPENAI_API_KEY"',source)
        self.assertIn('hmac.compare_digest',source)
        self.assertIn('"store": False',source)
        self.assertIn('"max_output_tokens": 900',source)

if __name__=="__main__": unittest.main()
