"""
Custom pagination classes for the API.
"""

from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Standard pagination with configurable page size."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        response.data['total_pages'] = self.page.paginator.num_pages
        response.data['current_page'] = self.page.number
        response.data['page_size'] = self.page.paginator.per_page
        return response


class SmallPagination(PageNumberPagination):
    """Small pagination for widgets and previews."""
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 20
