"""Views for customer management."""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Customer
from .serializers import CustomerSerializer, CustomerListSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    """CRUD for customers."""
    queryset = Customer.objects.all()
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['name', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        return CustomerSerializer

    @action(detail=True, methods=['get'])
    def purchase_history(self, request, pk=None):
        """Get purchase history for a customer."""
        customer = self.get_object()
        from apps.sales.serializers import SaleListSerializer
        sales = customer.sales.all().order_by('-created_at')
        serializer = SaleListSerializer(sales, many=True)
        return Response({
            'success': True,
            'data': {
                'customer': CustomerSerializer(customer).data,
                'purchases': serializer.data,
            },
        })
