"""
Sales service layer - handles sale creation, stock deduction, and invoice generation.
"""

from decimal import Decimal
from django.db import transaction
from django.conf import settings

from .models import Sale, SaleItem
from apps.products.models import Product
from apps.inventory.services import deduct_stock


class InsufficientStockError(Exception):
    """Raised when a product doesn't have enough stock."""
    pass


class ProductNotFoundError(Exception):
    """Raised when a product is not found."""
    pass


@transaction.atomic
def create_sale(
    staff,
    items,
    customer=None,
    payment_method='cash',
    payment_status='paid',
    discount=Decimal('0'),
    tax_rate=None,
    notes='',
):
    """
    Create a complete sale with automatic stock deduction.

    Args:
        staff: User performing the sale
        items: List of dicts with 'product_id' and 'quantity'
        customer: Customer instance (optional)
        payment_method: cash, card, or transfer
        payment_status: paid, pending, or partial
        discount: Discount amount
        tax_rate: Tax rate percentage (uses default if None)
        notes: Additional notes

    Returns:
        Sale instance with items

    Raises:
        InsufficientStockError: If any product has insufficient stock
        ProductNotFoundError: If any product is not found
    """
    if tax_rate is None:
        tax_rate = Decimal(str(settings.DEFAULT_TAX_RATE))

    # Validate all products and stock before creating anything
    validated_items = []
    for item in items:
        try:
            product = Product.objects.select_for_update().get(
                id=item['product_id'],
                is_active=True,
            )
        except Product.DoesNotExist:
            raise ProductNotFoundError(
                f"Product with ID {item['product_id']} not found or inactive."
            )

        quantity = int(item['quantity'])
        if quantity <= 0:
            raise ValueError(f"Quantity must be positive for {product.name}.")

        if product.quantity < quantity:
            raise InsufficientStockError(
                f"Insufficient stock for {product.name}. "
                f"Available: {product.quantity}, Requested: {quantity}"
            )

        validated_items.append({
            'product': product,
            'quantity': quantity,
            'unit_price': product.price,
        })

    # Calculate totals
    subtotal = sum(
        item['quantity'] * item['unit_price'] for item in validated_items
    )
    tax_amount = (subtotal * tax_rate / Decimal('100')).quantize(Decimal('0.01'))
    total = subtotal + tax_amount - discount

    # Create sale
    sale = Sale.objects.create(
        customer=customer,
        staff=staff,
        invoice_number=Sale.generate_invoice_number(),
        subtotal=subtotal,
        tax=tax_amount,
        tax_rate=tax_rate,
        discount=discount,
        total=total,
        payment_method=payment_method,
        payment_status=payment_status,
        notes=notes,
    )

    # Create sale items and deduct stock
    for item in validated_items:
        product = item['product']
        quantity = item['quantity']

        SaleItem.objects.create(
            sale=sale,
            product=product,
            product_name=product.name,
            product_sku=product.sku,
            quantity=quantity,
            unit_price=item['unit_price'],
            total=quantity * item['unit_price'],
        )

        # Deduct stock
        deduct_stock(
            product=product,
            quantity=quantity,
            user=staff,
            notes=f"Sale {sale.invoice_number}",
        )

    return sale
