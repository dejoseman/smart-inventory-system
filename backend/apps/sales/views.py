"""Views for sales management and POS."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Sale
from .serializers import (
    SaleListSerializer,
    SaleDetailSerializer,
    CreateSaleSerializer,
)
from .services import create_sale, InsufficientStockError, ProductNotFoundError
from apps.customers.models import Customer


class SaleViewSet(viewsets.ModelViewSet):
    """ViewSet for sales - list, create, and view sales."""
    queryset = Sale.objects.select_related('customer', 'staff').prefetch_related('items')
    permission_classes = [IsAuthenticated]
    search_fields = ['invoice_number', 'customer__name']
    ordering_fields = ['created_at', 'total']
    filterset_fields = ['payment_method', 'payment_status']

    def get_serializer_class(self):
        if self.action == 'list':
            return SaleListSerializer
        if self.action == 'create':
            return CreateSaleSerializer
        return SaleDetailSerializer

    def create(self, request, *args, **kwargs):
        """Create a new sale (POS checkout)."""
        serializer = CreateSaleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # Get customer if provided
        customer = None
        customer_id = data.get('customer_id')
        if customer_id:
            try:
                customer = Customer.objects.get(id=customer_id)
            except Customer.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Customer not found.',
                }, status=status.HTTP_404_NOT_FOUND)

        try:
            sale = create_sale(
                staff=request.user,
                items=data['items'],
                customer=customer,
                payment_method=data.get('payment_method', 'cash'),
                payment_status=data.get('payment_status', 'paid'),
                discount=data.get('discount', 0),
                tax_rate=data.get('tax_rate'),
                notes=data.get('notes', ''),
            )
        except InsufficientStockError as e:
            return Response({
                'success': False,
                'message': str(e),
            }, status=status.HTTP_400_BAD_REQUEST)
        except ProductNotFoundError as e:
            return Response({
                'success': False,
                'message': str(e),
            }, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({
                'success': False,
                'message': str(e),
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'message': 'Sale created successfully.',
            'data': SaleDetailSerializer(sale).data,
        }, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """Prevent sale deletion - sales are permanent records."""
        return Response({
            'success': False,
            'message': 'Sales records cannot be deleted.',
        }, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get 10 most recent sales."""
        sales = self.queryset[:10]
        serializer = SaleListSerializer(sales, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
        })
