"""
Views for product and category management.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import F

from .models import Category, Product
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer
from .filters import ProductFilter
from apps.accounts.permissions import IsAdminOrReadOnly, IsAdmin


class CategoryViewSet(viewsets.ModelViewSet):
    """CRUD for product categories."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


class ProductViewSet(viewsets.ModelViewSet):
    """CRUD for products with advanced filtering."""
    queryset = Product.objects.select_related('category').all()
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filterset_class = ProductFilter
    search_fields = ['name', 'sku', 'barcode', 'description']
    ordering_fields = ['name', 'price', 'quantity', 'created_at']

    def get_serializer_class(self):
        if self.action in ('list',):
            return ProductListSerializer
        return ProductDetailSerializer

    def perform_destroy(self, instance):
        """Soft delete - deactivate instead of deleting."""
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock."""
        products = self.queryset.filter(
            quantity__lte=F('low_stock_threshold'),
            is_active=True,
        )
        serializer = ProductListSerializer(products, many=True)
        return Response({
            'success': True,
            'count': products.count(),
            'data': serializer.data,
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get product statistics."""
        from django.db.models import Sum, Avg, Count
        total = Product.objects.filter(is_active=True)
        stats = {
            'total_products': total.count(),
            'total_categories': Category.objects.count(),
            'total_stock_value': float(
                total.aggregate(
                    total=Sum(F('quantity') * F('cost_price'))
                )['total'] or 0
            ),
            'low_stock_count': total.filter(
                quantity__lte=F('low_stock_threshold')
            ).count(),
            'out_of_stock_count': total.filter(quantity=0).count(),
            'average_price': float(
                total.aggregate(avg=Avg('price'))['avg'] or 0
            ),
        }
        return Response({'success': True, 'data': stats})
