"""Customer model."""

from django.db import models
import uuid


class Customer(models.Model):
    """Customer profile."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    address = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def total_purchases(self):
        return self.sales.count()

    @property
    def total_spending(self):
        from django.db.models import Sum
        return float(self.sales.aggregate(total=Sum('total'))['total'] or 0)

    @property
    def last_purchase(self):
        last_sale = self.sales.order_by('-created_at').first()
        if last_sale:
            return last_sale.created_at
        return None
