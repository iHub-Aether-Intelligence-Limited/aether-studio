"""Aether Studio entry point — starts gateway + serves web UI."""
import os, sys, json
from http.server import HTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)

STATIC = os.path.join(ROOT, "static")
PORT = 5200

from gateway import studio_routes

class StudioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC, **kwargs)

    def _send_json(self, obj, code=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path.startswith("/api/"):
            user = "default_user"
            result = studio_routes.handle(path, "GET", {}, user)
            self._send_json(result)
            return
        super().do_GET()

    def do_POST(self):
        path = self.path.split("?")[0]
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length else "{}"
        try:
            data = json.loads(body)
        except:
            data = {}
        if path.startswith("/api/"):
            user = "default_user"
            result = studio_routes.handle(path, "POST", data, user)
            self._send_json(result)
            return
        self._send_json({"error": "Not found"}, 404)

    def do_PUT(self):
        path = self.path.split("?")[0]
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length else "{}"
        try:
            data = json.loads(body)
        except:
            data = {}
        if path.startswith("/api/"):
            user = "default_user"
            result = studio_routes.handle(path, "PUT", data, user)
            self._send_json(result)
            return
        self._send_json({"error": "Not found"}, 404)

if __name__ == "__main__":
    print("=" * 50)
    print("  AETHER STUDIO v1.0.0")
    print("  Web UI:  http://127.0.0.1:%d" % PORT)
    print("=" * 50)
    server = HTTPServer(("0.0.0.0", PORT), StudioHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStudio stopped.")
