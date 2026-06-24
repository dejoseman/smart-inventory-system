"""
Utility helpers for the API.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Custom exception handler that wraps errors in a consistent format."""
    response = exception_handler(exc, context)

    if response is not None:
        custom_response = {
            'success': False,
            'status_code': response.status_code,
            'errors': response.data,
        }
        response.data = custom_response

    return response


def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
    """Standard success response wrapper."""
    return Response({
        'success': True,
        'message': message,
        'data': data,
    }, status=status_code)


def error_response(errors=None, message='Error', status_code=status.HTTP_400_BAD_REQUEST):
    """Standard error response wrapper."""
    return Response({
        'success': False,
        'message': message,
        'errors': errors,
    }, status=status_code)
