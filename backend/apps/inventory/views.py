"""Views for inventory management."""

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import InventoryLog
from .serializers import InventoryLogSerializer, RestockSerializer, AdjustStockSerializer
from .services import restock, adjust_stock
from apps.products.models import Product
from apps.accounts.permissions import IsAdmin


class InventoryLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for inventory logs."""
    queryset = InventoryLog.objects.select_related('product', 'performed_by').all()
    serializer_class = InventoryLogSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['product__name', 'product__sku', 'notes']
    ordering_fields = ['created_at']
    filterset_fields = ['action_type', 'product']


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def restock_view(request):
    """Restock a product (admin only)."""
    serializer = RestockSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        product = Product.objects.get(id=serializer.validated_data['product_id'])
    except Product.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Product not found.',
        }, status=status.HTTP_404_NOT_FOUND)

    product = restock(
        product=product,
        quantity=serializer.validated_data['quantity'],
        user=request.user,
        notes=serializer.validated_data.get('notes', ''),
    )

    return Response({
        'success': True,
        'message': f'Restocked {product.name}. New quantity: {product.quantity}',
        'data': {
            'product_id': str(product.id),
            'new_quantity': product.quantity,
        },
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def adjust_stock_view(request):
    """Adjust stock to a specific quantity (admin only)."""
    serializer = AdjustStockSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        product = Product.objects.get(id=serializer.validated_data['product_id'])
    except Product.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Product not found.',
        }, status=status.HTTP_404_NOT_FOUND)

    product = adjust_stock(
        product=product,
        new_quantity=serializer.validated_data['new_quantity'],
        user=request.user,
        notes=serializer.validated_data.get('notes', ''),
    )

    return Response({
        'success': True,
        'message': f'Adjusted {product.name} stock to {product.quantity}.',
        'data': {
            'product_id': str(product.id),
            'new_quantity': product.quantity,
        },
    })
