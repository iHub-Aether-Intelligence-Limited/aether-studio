"""Package final app bundle."""
import os, zipfile

def pack(output_dir, out_path):
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(output_dir):
            for f in files:
                full = os.path.join(root, f)
                arc = os.path.relpath(full, output_dir)
                zf.write(full, arc)
    return out_path
