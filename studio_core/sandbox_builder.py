"""Isolated workspace sandbox for each build job."""
import os, shutil, time

WORKSPACES = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "workspaces")

def create_sandbox(user_uid, project_id):
    sdir = os.path.join(WORKSPACES, user_uid, "build_queue", project_id + "_" + str(int(time.time())))
    os.makedirs(sdir, exist_ok=True)
    return sdir

def cleanup_sandbox(sdir):
    if os.path.exists(sdir):
        shutil.rmtree(sdir, ignore_errors=True)
