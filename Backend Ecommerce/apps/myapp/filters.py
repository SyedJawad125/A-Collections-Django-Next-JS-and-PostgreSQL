from django_filters import DateFilter, CharFilter, FilterSet, BooleanFilter, NumberFilter
from .models import *
from django.db import models
from .models import Product

from django_filters import FilterSet, CharFilter, DateFilter


class ProductFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    price = CharFilter(field_name='price')
    description = CharFilter(field_name='description', lookup_expr='icontains')
    tags = CharFilter(field_name='tags__name', lookup_expr='iexact')

    class Meta:
        model = Product
        exclude = ['image', 'images']
       
        

# import django_filters
# from django.db.models import Q

class PublicproductFilter(FilterSet):
    id = CharFilter(field_name='id')
    # dept_updated_by_user= CharFilter(field_name='id')
    # dept_added_by_user= CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')
    price = CharFilter(field_name='price')
    description = CharFilter(field_name='description', lookup_expr='icontains')
    category = CharFilter(field_name='prod_has_category')
    tags = CharFilter(field_name='tags__name', lookup_expr='iexact')
    
    # Add this new search filter
    # search = django_filters.CharFilter(method='custom_search')

    # def custom_search(self, queryset, name, value):
    #     return queryset.filter(
    #         Q(name__icontains=value) |
    #         Q(description__icontains=value) |
    #         Q(tags__name__icontains=value)
    #     ).distinct()
    
    class Meta:
        model = Product
        exclude = ['image']
       

class SliderproductFilter(FilterSet):
    id = CharFilter(field_name='id')
    # dept_updated_by_user= CharFilter(field_name='id')
    # dept_added_by_user= CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')
    price = CharFilter(field_name='price')
    description = CharFilter(field_name='description', lookup_expr='icontains')

    class Meta:
        model = Product
        exclude = ['image', 'images']

class DropDownListProductFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Product
        # fields ='__all__'
        exclude = ['image']


class ColorFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Color
        fields ='__all__'
        

class ProductVariantFilter(FilterSet):
    id = CharFilter(field_name='id')
    product_id = CharFilter(field_name='product__id')
    product_name = CharFilter(field_name='product__name', lookup_expr='icontains')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    size = CharFilter(field_name='size', lookup_expr='iexact')
    color = CharFilter(field_name='color', lookup_expr='icontains')
    material = CharFilter(field_name='material', lookup_expr='icontains')
    sku = CharFilter(field_name='sku', lookup_expr='icontains')
    min_stock = NumberFilter(field_name='stock_quantity', lookup_expr='gte')
    max_stock = NumberFilter(field_name='stock_quantity', lookup_expr='lte')
    min_price = NumberFilter(field_name='additional_price', lookup_expr='gte')
    max_price = NumberFilter(field_name='additional_price', lookup_expr='lte')
    is_active = BooleanFilter(field_name='is_active')
    
    class Meta:
        model = ProductVariant
        fields = {
            'size': ['exact'],
            'color': ['exact', 'icontains'],
            'material': ['exact', 'icontains'],
        }
        exclude = []  # Add any fields you want to exclude




class InventoryFilter(FilterSet):
    # Filters
    id = CharFilter(field_name='id')
    product_id = CharFilter(field_name='product_variant__product__id')
    product_name = CharFilter(field_name='product_variant__product__name', lookup_expr='icontains')
    variant_id = CharFilter(field_name='product_variant__id')

    # Stock filters
    min_stock = NumberFilter(field_name='current_stock', lookup_expr='gte')
    max_stock = NumberFilter(field_name='current_stock', lookup_expr='lte')

    # Minimum / Maximum stock level filters
    min_level = NumberFilter(field_name='minimum_stock_level', lookup_expr='gte')
    max_level = NumberFilter(field_name='maximum_stock_level', lookup_expr='lte')

    # Reorder point
    min_reorder = NumberFilter(field_name='reorder_point', lookup_expr='gte')
    max_reorder = NumberFilter(field_name='reorder_point', lookup_expr='lte')

    # Cost price filters
    min_cost = NumberFilter(field_name='cost_price', lookup_expr='gte')
    max_cost = NumberFilter(field_name='cost_price', lookup_expr='lte')

    # Date filters
    restocked_from = DateFilter(field_name='last_restocked', lookup_expr='gte')
    restocked_to = DateFilter(field_name='last_restocked', lookup_expr='lte')

    # Boolean filters (custom properties)
    is_low_stock = BooleanFilter(method='filter_is_low_stock')
    needs_reorder = BooleanFilter(method='filter_needs_reorder')

    class Meta:
        model = Inventory
        fields = []

    # Custom methods for property-based filtering
    def filter_is_low_stock(self, queryset, name, value):
        if value:
            return queryset.filter(current_stock__lte=models.F('minimum_stock_level'))
        return queryset

    def filter_needs_reorder(self, queryset, name, value):
        if value:
            return queryset.filter(current_stock__lte=models.F('reorder_point'))
        return queryset

class SalesProductFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    price = CharFilter(field_name='price')
    discount_price = CharFilter(field_name='discount_price')
    description = CharFilter(field_name='description', lookup_expr='icontains')

    class Meta:
        model = SalesProduct
        exclude = ['image']
        
class PublicSalesProductFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    price = CharFilter(field_name='price')
    discount_price = CharFilter(field_name='discount_price')
    description = CharFilter(field_name='description', lookup_expr='icontains')

    class Meta:
        model = SalesProduct
        exclude = ['image']

class DropDownListSalesProductFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = SalesProduct
        # fields ='__all__'
        exclude = ['image']
class CategoryFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Category
        # fields ='__all__'
        exclude = ['image']

class PubliccategoryFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Category
        # fields ='__all__'
        exclude = ['image']

class PubliccategorywiseFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Category
        # fields ='__all__'
        exclude = ['image']

class DropDownListCategoryFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Category
        # fields ='__all__'
        exclude = ['image']
class SlidercategoryFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Category
        # fields ='__all__'
        exclude = ['image']

class OrderFilter(FilterSet):
    id = CharFilter(field_name='id')
    # dept_updated_by_user= CharFilter(field_name='id')
    # dept_added_by_user= CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    delivery_address = CharFilter(field_name='delivery_address', lookup_expr='icontains')
    bill = CharFilter(field_name='bill')

    class Meta:
        model = Order
        fields ='__all__'


class TextBoxOrderFilter(FilterSet):
    id = CharFilter(field_name='id')
    # dept_updated_by_user= CharFilter(field_name='id')
    # dept_added_by_user= CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    delivery_address = CharFilter(field_name='delivery_address', lookup_expr='icontains')
    bill = CharFilter(field_name='bill')

    class Meta:
        model = Order
        fields ='__all__'

class PublicOrderFilter(FilterSet):
    id = CharFilter(field_name='id')
    # dept_updated_by_user= CharFilter(field_name='id')
    # dept_added_by_user= CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    delivery_address = CharFilter(field_name='delivery_address', lookup_expr='icontains')
    bill = CharFilter(field_name='bill')

    class Meta:
        model = Order
        fields ='__all__'

class ProductTagFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = ProductTag
        fields ='__all__'

class ContactFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Contact
        fields ='__all__'
        
class PublicContactFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Contact
        fields ='__all__'



# class ReviewFilter(FilterSet):
#     id = CharFilter(field_name='id')
#     name = CharFilter(field_name='name', lookup_expr='icontains')
#     date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
#     date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    

#     class Meta:
#         model = Review
#         fields ='__all__'



from django_filters import FilterSet, CharFilter, DateFilter, NumberFilter, ChoiceFilter
from django.db.models import Q

class ReviewFilter(FilterSet):
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    rating = NumberFilter(field_name='rating')
    user = CharFilter(field_name='user__username', lookup_expr='icontains')
    
    # Date filters
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    
    # Product/SalesProduct filters
    product_id = NumberFilter(field_name='product__id')
    product_name = CharFilter(field_name='product__name', lookup_expr='icontains')
    sales_product_id = NumberFilter(field_name='sales_product__id')
    sales_product_name = CharFilter(field_name='sales_product__name', lookup_expr='icontains')
    
    # Combined filter for any product type
    item_id = NumberFilter(method='filter_by_item_id')
    item_name = CharFilter(method='filter_by_item_name')

    class Meta:
        model = Review
        fields = {
            'rating': ['exact', 'gte', 'lte'],
        }

    def filter_by_item_id(self, queryset, name, value):
        """Filter by either product_id or sales_product_id"""
        return queryset.filter(
            Q(product__id=value) | Q(sales_product__id=value)
        )

    def filter_by_item_name(self, queryset, name, value):
        """Filter by either product name or sales product name"""
        return queryset.filter(
            Q(product__name__icontains=value) | 
            Q(sales_product__name__icontains=value)
        )

class PublicReviewFilter(FilterSet):
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    

    class Meta:
        model = Review
        fields ='__all__'
