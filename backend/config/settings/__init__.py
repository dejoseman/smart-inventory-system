"""Settings package - defaults to development."""

import os

environment = os.getenv('DJANGO_SETTINGS_MODULE', 'config.settings.development')

if environment == 'config.settings.production':
    from .production import *  # noqa: F401, F403
else:
    from .development import *  # noqa: F401, F403
