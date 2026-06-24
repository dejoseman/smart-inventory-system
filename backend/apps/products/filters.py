"""
Filter sets for products.
"""

import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    """Advanced filtering for products."""
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    low_stock = django_filters.BooleanFilter(method='filter_low_stock')
    category_name = django_filters.CharFilter(field_name='category__name', lookup_expr='icontains')

    class Meta:
        model = Product
        fields = ['category', 'is_active', 'min_price', 'max_price', 'low_stock']

    def filter_low_stock(self, queryset, name, value):
        if value:
            return queryset.filter(quantity__lte=models.F('low_stock_threshold'))
        return queryset

    def filter_low_stock(self, queryset, name, value):
        from django.db.models import F
        if value:
            return queryset.filter(quantity__lte=F('low_stock_threshold'))
        return queryset
