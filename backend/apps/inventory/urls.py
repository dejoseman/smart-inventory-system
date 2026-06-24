"""URL patterns for inventory management."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'logs', views.InventoryLogViewSet, basename='inventory-log')

urlpatterns = [
    path('restock/', views.restock_view, name='restock'),
    path('adjust/', views.adjust_stock_view, name='adjust-stock'),
    path('', include(router.urls)),
]
