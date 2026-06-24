"""
Custom permission classes for role-based access control.
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allows access only to admin users."""
    message = 'Admin access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsSalesStaff(BasePermission):
    """Allows access only to sales staff users."""
    message = 'Sales staff access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'sales_staff'
        )


class IsAdminOrSalesStaff(BasePermission):
    """Allows access to both admin and sales staff."""
    message = 'Staff access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'sales_staff')
        )


class IsAdminOrReadOnly(BasePermission):
    """Allows full access to admins, read-only to others."""
    message = 'Admin access required for this action.'

    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )
