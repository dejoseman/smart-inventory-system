"""Serializers for inventory management."""

from rest_framework import serializers
from .models import InventoryLog


class InventoryLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.full_name', read_only=True, default=None)

    class Meta:
        model = InventoryLog
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'previous_quantity', 'new_quantity', 'change',
            'action_type', 'performed_by', 'performed_by_name',
            'notes', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class RestockSerializer(serializers.Serializer):
    """Serializer for restocking a product."""
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, default='')


class AdjustStockSerializer(serializers.Serializer):
    """Serializer for adjusting stock to a specific quantity."""
    product_id = serializers.UUIDField()
    new_quantity = serializers.IntegerField(min_value=0)
    notes = serializers.CharField(required=False, default='')
