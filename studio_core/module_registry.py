"""Registry of all pre-baked native modules."""
MODULES = [
    {"id": "core_runtime", "name": "Core Runtime", "desc": "API gateway, cipher, SQLite ORM, threat shield, task scheduler, hardware balancer", "required": True},
    {"id": "auth", "name": "Authentication", "desc": "JWT login, registration, session management", "required": True},
    {"id": "admin_rbac", "name": "Admin RBAC", "desc": "Super admin / regular admin permission system", "required": False},
    {"id": "api_key_manager", "name": "API Key Manager", "desc": "Full API key lifecycle + audit", "required": False},
    {"id": "aether_ai", "name": "Aether AI", "desc": "AI inference + token quota pipeline", "required": False},
    {"id": "vision_latent", "name": "Vision / Latent", "desc": "Vector search / KDTree latent index", "required": False},
    {"id": "ihub_pay", "name": "Payments", "desc": "Stripe, Momo, Alipay, WeChat Pay", "required": False},
    {"id": "notifications", "name": "Notifications", "desc": "Email and push notifications", "required": False},
]

def list_modules():
    return MODULES

def is_valid(mod_id):
    return any(m["id"] == mod_id for m in MODULES)
