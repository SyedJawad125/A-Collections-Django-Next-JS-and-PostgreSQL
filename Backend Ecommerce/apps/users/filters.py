import django_filters as filters
from django.db.models import Q
from .models import Employee, Role


class EmployeeFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    status = filters.CharFilter(field_name='status', lookup_expr='iexact')
    date_to = filters.DateFilter(field_name='created_at', lookup_expr='lte')
    date_from = filters.DateFilter(field_name='created_at', lookup_expr='gte')

    class Meta:
        model = Employee
        fields = ['status', 'created_at', 'user']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(user__full_name__icontains=value) |
            Q(user__email__icontains=value) |
            Q(user__mobile__icontains=value) |
            Q(user__role__name__icontains=value)
        )


class RoleFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    date_to = filters.DateFilter(field_name='created_at', lookup_expr='lte')
    date_from = filters.DateFilter(field_name='created_at', lookup_expr='gte')

    class Meta:
        model = Role
        fields = ['created_at']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value) |
            Q(code_name__icontains=value)
        )