"""Serializers for sales."""

from rest_framework import serializers
from .models import Sale, SaleItem


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'quantity', 'unit_price', 'total',
        ]
        read_only_fields = ['id', 'product_name', 'product_sku', 'total']


class SaleDetailSerializer(serializers.ModelSerializer):
    """Full sale detail with items."""
    items = SaleItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True, default=None)
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, default=None)

    class Meta:
        model = Sale
        fields = [
            'id', 'invoice_number', 'customer', 'customer_name',
            'staff', 'staff_name', 'subtotal', 'tax', 'tax_rate',
            'discount', 'total', 'payment_method', 'payment_status',
            'notes', 'items', 'created_at',
        ]
        read_only_fields = ['id', 'invoice_number', 'staff', 'created_at']


class SaleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for sale lists."""
    customer_name = serializers.CharField(source='customer.name', read_only=True, default='Walk-in')
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, default=None)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            'id', 'invoice_number', 'customer_name', 'staff_name',
            'total', 'payment_method', 'payment_status',
            'item_count', 'created_at',
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class CreateSaleSerializer(serializers.Serializer):
    """Serializer for creating a new sale."""
    customer_id = serializers.UUIDField(required=False, allow_null=True)
    payment_method = serializers.ChoiceField(choices=Sale.PaymentMethod.choices, default='cash')
    payment_status = serializers.ChoiceField(choices=Sale.PaymentStatus.choices, default='paid')
    discount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    notes = serializers.CharField(required=False, default='')
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
    )

    def validate_items(self, value):
        for item in value:
            if 'product_id' not in item or 'quantity' not in item:
                raise serializers.ValidationError(
                    "Each item must have 'product_id' and 'quantity'."
                )
            if int(item['quantity']) <= 0:
                raise serializers.ValidationError("Quantity must be positive.")
        return value
