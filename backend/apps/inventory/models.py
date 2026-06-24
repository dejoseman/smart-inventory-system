"""Inventory log model for tracking stock changes."""

from django.db import models
from django.conf import settings
import uuid


class InventoryLog(models.Model):
    """Tracks all inventory changes for audit trail."""

    class ActionType(models.TextChoices):
        SALE = 'sale', 'Sale'
        RESTOCK = 'restock', 'Restock'
        ADJUSTMENT = 'adjustment', 'Adjustment'
        RETURN = 'return', 'Return'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='inventory_logs',
    )
    previous_quantity = models.IntegerField()
    new_quantity = models.IntegerField()
    change = models.IntegerField()  # Positive for additions, negative for deductions
    action_type = models.CharField(max_length=20, choices=ActionType.choices)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='inventory_logs',
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"{self.product.name}: {self.previous_quantity} → {self.new_quantity} "
            f"({self.get_action_type_display()})"
        )
