"""Aether Studio - run command."""
import os
import sys
import webbrowser
from threading import Timer

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from http.server import HTTPServer
from gateway.studio_routes import handle as studio_handle

STATIC = os.path.join(HERE, "static")

class Handler:
    pass

def run():
    from http.server import SimpleHTTPRequestHandler
    import json

    class StudioHandler(SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=STATIC, **kw)

        def _send_json(self, obj, code=200):
            body = json.dumps(obj).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            path = self.path.split("?")[0]
            if path.startswith("/api/"):
                self._send_json(studio_handle(path, "GET", {}, "local"))
                return
            super().do_GET()

        def do_POST(self):
            path = self.path.split("?")[0]
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode() if length else "{}"
            try: data = json.loads(body)
            except: data = {}
            if path.startswith("/api/"):
                self._send_json(studio_handle(path, "POST", data, "local"))
                return
            self._send_json({"error": "not found"}, 404)

    port = 5200
    Timer(1.5, lambda: webbrowser.open(f"http://127.0.0.1:{port}")).start()
    print("=" * 50)
    print("  AETHER STUDIO v1.0.0")
    print(f"  Web UI:  http://127.0.0.1:{port}")
    print("=" * 50)
    HTTPServer(("0.0.0.0", port), StudioHandler).serve_forever()

if __name__ == "__main__":
    run()
