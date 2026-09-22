"""Pre-export validation."""
def test(manifest):
    errors = []
    if not manifest.get("name"):
        errors.append("App name missing")
    if not manifest.get("language"):
        errors.append("Language missing")
    return errors
