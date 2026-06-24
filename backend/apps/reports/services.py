"""
Report generation services.
"""

from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Sum, Count, Avg, F, Q
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone

from apps.sales.models import Sale, SaleItem
from apps.products.models import Product, Category
from apps.customers.models import Customer
from apps.inventory.models import InventoryLog
from django.contrib.auth import get_user_model

User = get_user_model()


def get_dashboard_kpis():
    """Get key performance indicators for the dashboard."""
    today = timezone.now().date()
    thirty_days_ago = today - timedelta(days=30)

    total_revenue = Sale.objects.aggregate(total=Sum('total'))['total'] or Decimal('0')
    monthly_revenue = Sale.objects.filter(
        created_at__date__gte=thirty_days_ago
    ).aggregate(total=Sum('total'))['total'] or Decimal('0')

    total_sales = Sale.objects.count()
    monthly_sales = Sale.objects.filter(created_at__date__gte=thirty_days_ago).count()
    today_sales = Sale.objects.filter(created_at__date=today).count()
    today_revenue = Sale.objects.filter(
        created_at__date=today
    ).aggregate(total=Sum('total'))['total'] or Decimal('0')

    low_stock_count = Product.objects.filter(
        is_active=True,
        quantity__lte=F('low_stock_threshold'),
    ).count()

    return {
        'total_products': Product.objects.filter(is_active=True).count(),
        'total_customers': Customer.objects.count(),
        'total_revenue': float(total_revenue),
        'monthly_revenue': float(monthly_revenue),
        'total_sales': total_sales,
        'monthly_sales': monthly_sales,
        'today_sales': today_sales,
        'today_revenue': float(today_revenue),
        'low_stock_count': low_stock_count,
        'total_staff': User.objects.filter(is_active=True).count(),
    }


def get_revenue_trends(days=30):
    """Get daily revenue for the past N days."""
    start_date = timezone.now().date() - timedelta(days=days)
    data = (
        Sale.objects
        .filter(created_at__date__gte=start_date)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(
            revenue=Sum('total'),
            count=Count('id'),
        )
        .order_by('date')
    )
    return [
        {
            'date': item['date'].isoformat(),
            'revenue': float(item['revenue']),
            'count': item['count'],
        }
        for item in data
    ]


def get_monthly_sales(months=12):
    """Get monthly sales for the past N months."""
    start_date = timezone.now().date() - timedelta(days=months * 30)
    data = (
        Sale.objects
        .filter(created_at__date__gte=start_date)
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(
            revenue=Sum('total'),
            count=Count('id'),
        )
        .order_by('month')
    )
    return [
        {
            'month': item['month'].strftime('%Y-%m'),
            'revenue': float(item['revenue']),
            'count': item['count'],
        }
        for item in data
    ]


def get_category_distribution():
    """Get product count and revenue by category."""
    categories = Category.objects.annotate(
        product_count=Count('products', filter=Q(products__is_active=True)),
        total_revenue=Sum(
            'products__sale_items__total',
            default=0,
        ),
    ).values('name', 'product_count', 'total_revenue')

    return [
        {
            'name': cat['name'],
            'product_count': cat['product_count'],
            'revenue': float(cat['total_revenue'] or 0),
        }
        for cat in categories
    ]


def get_top_selling_products(limit=10):
    """Get top selling products by quantity sold."""
    data = (
        SaleItem.objects
        .values('product_name', 'product_sku')
        .annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('total'),
        )
        .order_by('-total_sold')[:limit]
    )
    return list(data)


def get_recent_transactions(limit=10):
    """Get most recent sales."""
    sales = Sale.objects.select_related('customer', 'staff').order_by('-created_at')[:limit]
    return [
        {
            'id': str(sale.id),
            'invoice_number': sale.invoice_number,
            'customer_name': sale.customer.name if sale.customer else 'Walk-in',
            'staff_name': sale.staff.full_name if sale.staff else 'N/A',
            'total': float(sale.total),
            'payment_method': sale.payment_method,
            'payment_status': sale.payment_status,
            'created_at': sale.created_at.isoformat(),
        }
        for sale in sales
    ]


def get_recent_customers(limit=5):
    """Get most recent customers."""
    customers = Customer.objects.order_by('-created_at')[:limit]
    return [
        {
            'id': str(c.id),
            'name': c.name,
            'email': c.email,
            'phone': c.phone,
            'total_purchases': c.total_purchases,
            'total_spending': c.total_spending,
            'created_at': c.created_at.isoformat(),
        }
        for c in customers
    ]


def get_low_stock_alerts():
    """Get products with low stock."""
    products = Product.objects.filter(
        is_active=True,
        quantity__lte=F('low_stock_threshold'),
    ).order_by('quantity')[:20]

    return [
        {
            'id': str(p.id),
            'name': p.name,
            'sku': p.sku,
            'quantity': p.quantity,
            'threshold': p.low_stock_threshold,
            'category': p.category.name if p.category else 'Uncategorized',
        }
        for p in products
    ]


def get_sales_report(start_date=None, end_date=None):
    """Generate a detailed sales report for a date range."""
    queryset = Sale.objects.all()
    if start_date:
        queryset = queryset.filter(created_at__date__gte=start_date)
    if end_date:
        queryset = queryset.filter(created_at__date__lte=end_date)

    summary = queryset.aggregate(
        total_revenue=Sum('total'),
        total_tax=Sum('tax'),
        total_discount=Sum('discount'),
        total_sales=Count('id'),
        avg_sale_value=Avg('total'),
    )

    by_payment = queryset.values('payment_method').annotate(
        count=Count('id'),
        total=Sum('total'),
    )

    daily = (
        queryset
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(revenue=Sum('total'), count=Count('id'))
        .order_by('date')
    )

    return {
        'summary': {
            'total_revenue': float(summary['total_revenue'] or 0),
            'total_tax': float(summary['total_tax'] or 0),
            'total_discount': float(summary['total_discount'] or 0),
            'total_sales': summary['total_sales'],
            'avg_sale_value': float(summary['avg_sale_value'] or 0),
        },
        'by_payment_method': list(by_payment),
        'daily_breakdown': [
            {
                'date': d['date'].isoformat(),
                'revenue': float(d['revenue']),
                'count': d['count'],
            }
            for d in daily
        ],
    }


def get_staff_performance(start_date=None, end_date=None):
    """Generate staff performance report."""
    queryset = Sale.objects.all()
    if start_date:
        queryset = queryset.filter(created_at__date__gte=start_date)
    if end_date:
        queryset = queryset.filter(created_at__date__lte=end_date)

    staff_data = (
        queryset
        .values('staff__id', 'staff__full_name', 'staff__email')
        .annotate(
            total_sales=Count('id'),
            total_revenue=Sum('total'),
            avg_sale_value=Avg('total'),
        )
        .order_by('-total_revenue')
    )

    return [
        {
            'id': str(s['staff__id']) if s['staff__id'] else None,
            'name': s['staff__full_name'] or 'Unknown',
            'email': s['staff__email'] or '',
            'total_sales': s['total_sales'],
            'total_revenue': float(s['total_revenue'] or 0),
            'avg_sale_value': float(s['avg_sale_value'] or 0),
        }
        for s in staff_data
    ]


def get_inventory_report():
    """Generate inventory report."""
    products = Product.objects.filter(is_active=True).select_related('category')

    total_value = sum(p.stock_value for p in products)

    items = [
        {
            'id': str(p.id),
            'name': p.name,
            'sku': p.sku,
            'category': p.category.name if p.category else 'Uncategorized',
            'quantity': p.quantity,
            'cost_price': float(p.cost_price),
            'stock_value': float(p.stock_value),
            'is_low_stock': p.is_low_stock,
        }
        for p in products
    ]

    return {
        'total_products': len(items),
        'total_stock_value': float(total_value),
        'low_stock_count': sum(1 for i in items if i['is_low_stock']),
        'out_of_stock': sum(1 for i in items if i['quantity'] == 0),
        'items': items,
    }
