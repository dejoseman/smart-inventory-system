"""URL patterns for reports."""

from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('sales/', views.sales_report_view, name='sales-report'),
    path('inventory/', views.inventory_report_view, name='inventory-report'),
    path('staff/', views.staff_report_view, name='staff-report'),
    path('export/', views.export_report_view, name='export-report'),
]
