"""
Serializers for products and categories.
"""

from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.ReadOnlyField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'product_count', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product lists."""
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'barcode', 'price', 'cost_price',
            'quantity', 'low_stock_threshold', 'image',
            'category', 'category_name', 'is_low_stock', 'is_active',
            'created_at', 'updated_at',
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail view."""
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    is_low_stock = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()
    stock_value = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'barcode', 'price', 'cost_price',
            'quantity', 'low_stock_threshold', 'image', 'description',
            'category', 'category_name', 'is_low_stock', 'is_active',
            'profit_margin', 'stock_value',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
