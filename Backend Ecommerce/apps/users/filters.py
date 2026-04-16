# import django_filters as filters
# from django.db.models import Q
# from .models import Employee, Role


# class EmployeeFilter(filters.FilterSet):
#     search = filters.CharFilter(method='filter_search')
#     status = filters.CharFilter(field_name='status', lookup_expr='iexact')
#     date_to = filters.DateFilter(field_name='created_at', lookup_expr='lte')
#     date_from = filters.DateFilter(field_name='created_at', lookup_expr='gte')

#     class Meta:
#         model = Employee
#         fields = ['status', 'created_at', 'user']

#     def filter_search(self, queryset, name, value):
#         return queryset.filter(
#             Q(user__full_name__icontains=value) |
#             Q(user__email__icontains=value) |
#             Q(user__mobile__icontains=value) |
#             Q(user__role__name__icontains=value)
#         )


# class RoleFilter(filters.FilterSet):
#     search = filters.CharFilter(method='filter_search')
#     date_to = filters.DateFilter(field_name='created_at', lookup_expr='lte')
#     date_from = filters.DateFilter(field_name='created_at', lookup_expr='gte')

#     class Meta:
#         model = Role
#         fields = ['created_at']

#     def filter_search(self, queryset, name, value):
#         return queryset.filter(
#             Q(name__icontains=value) |
#             Q(code_name__icontains=value)
#         )


"""
E-commerce Filters
Follows the same pattern as apps/users/filters.py
"""

import django_filters as filters
from django.db.models import Q

from .models import (
    Product, SalesProduct, Order, Review, Coupon,
    Inventory, ReturnRequest, Category,
)


class ProductFilter(filters.FilterSet):
    search    = filters.CharFilter(method='filter_search')
    group     = filters.CharFilter(field_name='group', lookup_expr='iexact')
    category  = filters.NumberFilter(field_name='category__id')
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    is_active = filters.BooleanFilter(field_name='is_active')
    date_from = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to   = filters.DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model  = Product
        fields = ['group', 'category', 'is_active', 'created_at']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value) |
            Q(description__icontains=value) |
            Q(tags__name__icontains=value) |
            Q(category__name__icontains=value)
        ).distinct()


class SalesProductFilter(filters.FilterSet):
    search           = filters.CharFilter(method='filter_search')
    category         = filters.NumberFilter(field_name='category__id')
    min_price        = filters.NumberFilter(field_name='final_price', lookup_expr='gte')
    max_price        = filters.NumberFilter(field_name='final_price', lookup_expr='lte')
    min_discount     = filters.NumberFilter(field_name='discount_percent', lookup_expr='gte')
    date_from        = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to          = filters.DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model  = SalesProduct
        fields = ['category', 'created_at']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value) |
            Q(description__icontains=value) |
            Q(category__name__icontains=value)
        ).distinct()


class OrderFilter(filters.FilterSet):
    search         = filters.CharFilter(method='filter_search')
    status         = filters.CharFilter(field_name='status', lookup_expr='iexact')
    payment_method = filters.CharFilter(field_name='payment_method', lookup_expr='iexact')
    payment_status = filters.BooleanFilter(field_name='payment_status')
    city           = filters.CharFilter(field_name='city', lookup_expr='icontains')
    date_from      = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to        = filters.DateFilter(field_name='created_at', lookup_expr='lte')
    min_bill       = filters.NumberFilter(field_name='bill', lookup_expr='gte')
    max_bill       = filters.NumberFilter(field_name='bill', lookup_expr='lte')

    class Meta:
        model  = Order
        fields = ['status', 'payment_method', 'payment_status', 'city', 'created_at']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(customer_name__icontains=value)   |
            Q(customer_email__icontains=value)  |
            Q(customer_phone__icontains=value)  |
            Q(delivery_address__icontains=value)|
            Q(city__icontains=value)
        )


class ReviewFilter(filters.FilterSet):
    search    = filters.CharFilter(method='filter_search')
    rating    = filters.NumberFilter(field_name='rating')
    product   = filters.NumberFilter(field_name='product__id')
    date_from = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to   = filters.DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model  = Review
        fields = ['rating', 'product', 'created_at']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(comment__icontains=value) |
            Q(name__icontains=value)    |
            Q(email__icontains=value)
        )


class CouponFilter(filters.FilterSet):
    search        = filters.CharFilter(method='filter_search')
    is_active     = filters.BooleanFilter(field_name='is_active')
    discount_type = filters.CharFilter(field_name='discount_type', lookup_expr='iexact')
    date_from     = filters.DateFilter(field_name='valid_from', lookup_expr='gte')
    date_to       = filters.DateFilter(field_name='valid_to',   lookup_expr='lte')

    class Meta:
        model  = Coupon
        fields = ['is_active', 'discount_type']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(code__icontains=value)
        )


class InventoryFilter(filters.FilterSet):
    search        = filters.CharFilter(method='filter_search')
    is_low_stock  = filters.BooleanFilter(method='filter_low_stock')
    needs_reorder = filters.BooleanFilter(method='filter_needs_reorder')

    class Meta:
        model  = Inventory
        fields = []

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(product_variant__product__name__icontains=value) |
            Q(product_variant__sku__icontains=value)
        )

    def filter_low_stock(self, queryset, name, value):
        if value:
            from django.db.models import F
            return queryset.filter(current_stock__lte=F('minimum_stock_level'))
        return queryset

    def filter_needs_reorder(self, queryset, name, value):
        if value:
            from django.db.models import F
            return queryset.filter(current_stock__lte=F('reorder_point'))
        return queryset


class ReturnRequestFilter(filters.FilterSet):
    search    = filters.CharFilter(method='filter_search')
    status    = filters.CharFilter(field_name='status', lookup_expr='iexact')
    reason    = filters.CharFilter(field_name='reason', lookup_expr='iexact')
    date_from = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to   = filters.DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model  = ReturnRequest
        fields = ['status', 'reason']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(order__customer_name__icontains=value)  |
            Q(order__customer_email__icontains=value) |
            Q(description__icontains=value)
        )


class CategoryFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')

    class Meta:
        model  = Category
        fields = []

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value) |
            Q(description__icontains=value)
        )