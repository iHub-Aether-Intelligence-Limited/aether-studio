"""Build pipeline controller."""
import os, time
from studio_core import code_generator, sandbox_builder

def build_project(user_uid, project_id, manifest, log_cb=None):
    def log(msg, level="info"):
        if log_cb: log(msg, level)
    sdir = sandbox_builder.create_sandbox(user_uid, project_id)
    log("Build started for " + manifest.get("name", project_id), "info")
    log("Sandbox: " + sdir, "dir")
    src = os.path.join(sdir, "src")
    os.makedirs(src, exist_ok=True)
    with open(os.path.join(src, "routes.py"), "w", encoding="utf-8") as f:
        f.write(code_generator.generate_python_routes(manifest))
    log("Generated routes.py", "file")
    with open(os.path.join(src, "index.html"), "w", encoding="utf-8") as f:
        f.write(code_generator.generate_html(manifest))
    log("Generated index.html", "file")
    with open(os.path.join(sdir, "schema.sql"), "w", encoding="utf-8") as f:
        f.write(code_generator.generate_sql(manifest))
    log("Generated schema.sql", "file")
    log("Build complete. Files in " + sdir, "done")
    return {"success": True, "output": sdir, "files": ["src/routes.py", "src/index.html", "schema.sql"]}
