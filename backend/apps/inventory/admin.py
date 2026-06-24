from django.contrib import admin
from .models import InventoryLog


@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = ['product', 'previous_quantity', 'new_quantity', 'change', 'action_type', 'performed_by', 'created_at']
    list_filter = ['action_type', 'created_at']
    search_fields = ['product__name', 'product__sku', 'notes']
    ordering = ['-created_at']
