"""Auto-generate routes, SQL, HTML skeleton."""
import os

def generate_python_routes(manifest):
    name = manifest.get("name", "app")
    lines = ['"""Auto-generated routes for %s"""' % name, "from flask import Flask, jsonify, request", "",
             "app = Flask(__name__)", "", "@app.route('/')",
             "def home():", "    return jsonify({'app': '%s', 'status': 'running'})" % name, ""]
    for mod in manifest.get("modules", []):
        if mod == "auth":
            lines += ["@app.route('/api/auth/login', methods=['POST'])",
                      "def login():", "    return jsonify({'ok': True})", ""]
        if mod == "api_key_manager":
            lines += ["@app.route('/api/keys', methods=['GET', 'POST'])",
                      "def keys():", "    return jsonify({'keys': []})", ""]
        if mod == "ihub_pay":
            lines += ["@app.route('/api/pay/checkout', methods=['POST'])",
                      "def checkout():", "    return jsonify({'ok': True})", ""]
    return "\n".join(lines)

def generate_html(manifest):
    name = manifest.get("name", "App")
    return """<!DOCTYPE html><html><head><meta charset="utf-8"><title>%s</title></head>
<body><h1>Welcome to %s</h1><p>Built with Aether Studio</p></body></html>""" % (name, name)

def generate_sql(manifest):
    lines = ["CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, name TEXT);"]
    if "api_key_manager" in manifest.get("modules", []):
        lines.append("CREATE TABLE IF NOT EXISTS api_keys (id INTEGER PRIMARY KEY, key_hash TEXT, user_id INTEGER);")
    return "\n".join(lines)
