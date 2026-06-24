"""
Inventory service layer - handles stock operations and audit logging.
"""

from django.db import transaction
from .models import InventoryLog


@transaction.atomic
def deduct_stock(product, quantity, user, notes=''):
    """Deduct stock from a product and log the change."""
    previous_qty = product.quantity
    new_qty = previous_qty - quantity

    product.quantity = max(0, new_qty)
    product.save(update_fields=['quantity'])

    InventoryLog.objects.create(
        product=product,
        previous_quantity=previous_qty,
        new_quantity=product.quantity,
        change=-quantity,
        action_type=InventoryLog.ActionType.SALE,
        performed_by=user,
        notes=notes,
    )

    return product


@transaction.atomic
def restock(product, quantity, user, notes=''):
    """Add stock to a product and log the change."""
    previous_qty = product.quantity
    product.quantity = previous_qty + quantity
    product.save(update_fields=['quantity'])

    InventoryLog.objects.create(
        product=product,
        previous_quantity=previous_qty,
        new_quantity=product.quantity,
        change=quantity,
        action_type=InventoryLog.ActionType.RESTOCK,
        performed_by=user,
        notes=notes,
    )

    return product


@transaction.atomic
def adjust_stock(product, new_quantity, user, notes=''):
    """Manually adjust stock to a specific quantity and log the change."""
    previous_qty = product.quantity
    change = new_quantity - previous_qty

    product.quantity = new_quantity
    product.save(update_fields=['quantity'])

    InventoryLog.objects.create(
        product=product,
        previous_quantity=previous_qty,
        new_quantity=new_quantity,
        change=change,
        action_type=InventoryLog.ActionType.ADJUSTMENT,
        performed_by=user,
        notes=notes,
    )

    return product


@transaction.atomic
def return_stock(product, quantity, user, notes=''):
    """Return stock (e.g., from a sale return) and log the change."""
    previous_qty = product.quantity
    product.quantity = previous_qty + quantity
    product.save(update_fields=['quantity'])

    InventoryLog.objects.create(
        product=product,
        previous_quantity=previous_qty,
        new_quantity=product.quantity,
        change=quantity,
        action_type=InventoryLog.ActionType.RETURN,
        performed_by=user,
        notes=notes,
    )

    return product
