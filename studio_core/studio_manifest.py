"""app.ihubmanifest schema + validator."""
import json

SCHEMA = {
    "name": "",
    "version": "1.0.0",
    "description": "",
    "language": "python",
    "modules": [],
    "pages": [],
    "database": "sqlite",
    "auth": True,
    "payments": False,
}

def validate(manifest):
    errors = []
    if not manifest.get("name"):
        errors.append("Missing app name")
    if not manifest.get("language"):
        errors.append("Missing language")
    return errors

def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save(path, manifest):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
