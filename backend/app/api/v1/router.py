from fastapi import APIRouter

from app.api.v1 import (
    analytics,
    auth,
    billing,
    conversations,
    health,
    leads,
    notifications,
    onboarding,
    platform,
    search,
    settings,
    team,
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
api_router.include_router(billing.router)
api_router.include_router(leads.router)
api_router.include_router(onboarding.router)
api_router.include_router(team.router)
