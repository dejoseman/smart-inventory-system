"""Serializers for customers."""

from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    total_purchases = serializers.ReadOnlyField()
    total_spending = serializers.ReadOnlyField()
    last_purchase = serializers.ReadOnlyField()

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'phone', 'email', 'address',
            'total_purchases', 'total_spending', 'last_purchase',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerListSerializer(serializers.ModelSerializer):
    total_purchases = serializers.ReadOnlyField()
    total_spending = serializers.ReadOnlyField()

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'phone', 'email',
            'total_purchases', 'total_spending', 'created_at',
        ]
