"""Create / save / load user projects."""
import os, json, time

WORKSPACES = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "workspaces")

def list_projects(user_uid):
    pdir = os.path.join(WORKSPACES, user_uid, "projects")
    if not os.path.exists(pdir):
        return []
    out = []
    for pid in os.listdir(pdir):
        mf = os.path.join(pdir, pid, "app.ihubmanifest")
        if os.path.exists(mf):
            try:
                with open(mf, "r", encoding="utf-8") as f:
                    m = json.load(f)
                out.append({"id": pid, "name": m.get("name", pid), "updated": os.path.getmtime(mf)})
            except:
                out.append({"id": pid, "name": pid})
    return out

def create_project(user_uid, name, language="python"):
    pid = name.lower().replace(" ", "_").replace("-", "_") + "_" + str(int(time.time()))
    pdir = os.path.join(WORKSPACES, user_uid, "projects", pid)
    os.makedirs(pdir, exist_ok=True)
    manifest = {
        "name": name, "version": "1.0.0", "description": "",
        "language": language, "modules": [], "pages": [{"name": "Home", "route": "/"}],
        "database": "sqlite", "auth": True, "payments": False, "created": time.time()
    }
    with open(os.path.join(pdir, "app.ihubmanifest"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    os.makedirs(os.path.join(pdir, "assets"), exist_ok=True)
    os.makedirs(os.path.join(pdir, "build_output"), exist_ok=True)
    return pid, manifest

def load_project(user_uid, pid):
    mf = os.path.join(WORKSPACES, user_uid, "projects", pid, "app.ihubmanifest")
    with open(mf, "r", encoding="utf-8") as f:
        return json.load(f)

def save_project(user_uid, pid, manifest):
    mf = os.path.join(WORKSPACES, user_uid, "projects", pid, "app.ihubmanifest")
    with open(mf, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
