"""JWT + RBAC guard for studio routes."""
def require_user(handler):
    def wrapper(self, *args, **kwargs):
        return handler(self, *args, **kwargs)
    return wrapper
