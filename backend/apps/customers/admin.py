from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'total_purchases', 'total_spending', 'created_at']
    search_fields = ['name', 'phone', 'email']
    ordering = ['-created_at']
