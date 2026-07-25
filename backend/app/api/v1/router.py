from fastapi import APIRouter

from app.api.v1 import (
    analytics,
    auth,
    conversations,
    health,
    notifications,
    platform,
    search,
    settings,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(conversations.router)
api_router.include_router(analytics.router)
api_router.include_router(search.router)
api_router.include_router(health.router)
api_router.include_router(notifications.router)
api_router.include_router(platform.router)
api_router.include_router(settings.router)
