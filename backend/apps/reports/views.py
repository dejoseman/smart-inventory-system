"""Views for reports and analytics."""

from datetime import datetime, timedelta
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from . import services
from .exporters import export_to_pdf, export_to_excel, export_to_csv
from apps.accounts.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """Get all dashboard data in a single request."""
    return Response({
        'success': True,
        'data': {
            'kpis': services.get_dashboard_kpis(),
            'revenue_trends': services.get_revenue_trends(30),
            'monthly_sales': services.get_monthly_sales(12),
            'category_distribution': services.get_category_distribution(),
            'top_products': services.get_top_selling_products(10),
            'recent_transactions': services.get_recent_transactions(10),
            'recent_customers': services.get_recent_customers(5),
            'low_stock_alerts': services.get_low_stock_alerts(),
        },
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_report_view(request):
    """Get sales report with date filters."""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

    report = services.get_sales_report(start_date, end_date)
    return Response({'success': True, 'data': report})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_report_view(request):
    """Get inventory report."""
    report = services.get_inventory_report()
    return Response({'success': True, 'data': report})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def staff_report_view(request):
    """Get staff performance report (admin only)."""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

    report = services.get_staff_performance(start_date, end_date)
    return Response({'success': True, 'data': report})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_report_view(request):
    """Export a report in PDF, Excel, or CSV format."""
    report_type = request.query_params.get('type', 'sales')
    export_format = request.query_params.get('format', 'pdf')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

    # Generate report data based on type
    if report_type == 'sales':
        title = 'Sales Report'
        headers = ['Invoice #', 'Customer', 'Staff', 'Total', 'Payment', 'Status', 'Date']
        from apps.sales.models import Sale
        queryset = Sale.objects.select_related('customer', 'staff').all()
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        data = [
            [
                s.invoice_number,
                s.customer.name if s.customer else 'Walk-in',
                s.staff.full_name if s.staff else 'N/A',
                f"${s.total:,.2f}",
                s.get_payment_method_display(),
                s.get_payment_status_display(),
                s.created_at.strftime('%Y-%m-%d %H:%M'),
            ]
            for s in queryset
        ]
    elif report_type == 'inventory':
        title = 'Inventory Report'
        headers = ['Product', 'SKU', 'Category', 'Quantity', 'Cost Price', 'Stock Value', 'Status']
        report = services.get_inventory_report()
        data = [
            [
                item['name'],
                item['sku'],
                item['category'],
                item['quantity'],
                f"${item['cost_price']:,.2f}",
                f"${item['stock_value']:,.2f}",
                'LOW STOCK' if item['is_low_stock'] else 'OK',
            ]
            for item in report['items']
        ]
    elif report_type == 'staff':
        title = 'Staff Performance Report'
        headers = ['Name', 'Email', 'Total Sales', 'Revenue', 'Avg Sale Value']
        report = services.get_staff_performance(start_date, end_date)
        data = [
            [
                s['name'],
                s['email'],
                s['total_sales'],
                f"${s['total_revenue']:,.2f}",
                f"${s['avg_sale_value']:,.2f}",
            ]
            for s in report
        ]
    else:
        return Response({
            'success': False,
            'message': f'Unknown report type: {report_type}',
        }, status=400)

    # Generate export
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    if export_format == 'pdf':
        buffer = export_to_pdf(title, headers, data)
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{report_type}_report_{timestamp}.pdf"'
    elif export_format == 'excel':
        buffer = export_to_excel(title, headers, data)
        response = HttpResponse(
            buffer.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = f'attachment; filename="{report_type}_report_{timestamp}.xlsx"'
    elif export_format == 'csv':
        buffer = export_to_csv(headers, data)
        response = HttpResponse(buffer.read(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{report_type}_report_{timestamp}.csv"'
    else:
        return Response({
            'success': False,
            'message': f'Unknown format: {export_format}. Use pdf, excel, or csv.',
        }, status=400)

    return response
