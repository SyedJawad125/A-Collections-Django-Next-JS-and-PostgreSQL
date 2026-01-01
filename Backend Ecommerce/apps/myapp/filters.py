"""
E-commerce Filters
Django-filter classes for filtering querysets in views and APIs
"""

from django_filters import (
    FilterSet, 
    CharFilter, 
    DateFilter, 
    BooleanFilter, 
    NumberFilter,
    ChoiceFilter
)
from django.db.models import Q, F

from .models import (
    Category,
    ProductTag,
    Product,
    ProductImage,
    Color,
    ProductVariant,
    Inventory,
    SalesProduct,
    SalesProductImage,
    Order,
    OrderDetail,
    Contact,
    Review
)


# ============================================================================
# CATEGORY FILTERS
# ============================================================================

class CategoryFilter(FilterSet):
    """Filter for Category model - Admin use"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Category
        exclude = ['image', 'description']


class PublicCategoryFilter(FilterSet):
    """Filter for Category model - Public API"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Category
        fields = ['id', 'name']


class CategoryDropdownFilter(FilterSet):
    """Simplified filter for dropdown lists"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Category
        fields = ['id', 'name']


# ============================================================================
# PRODUCT TAG FILTERS
# ============================================================================

class ProductTagFilter(FilterSet):
    """Filter for ProductTag model"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    slug = CharFilter(field_name='slug', lookup_expr='icontains')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = ProductTag
        fields = '__all__'


# ============================================================================
# PRODUCT FILTERS
# ============================================================================

class ProductFilter(FilterSet):
    """Comprehensive filter for Product model - Admin use"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    description = CharFilter(field_name='description', lookup_expr='icontains')
    group = ChoiceFilter(field_name='group', choices=Product.FOR_CHOICES)
    
    # Price filters
    price = NumberFilter(field_name='price')
    min_price = NumberFilter(field_name='price', lookup_expr='gte')
    max_price = NumberFilter(field_name='price', lookup_expr='lte')
    
    # Category filter
    category = CharFilter(field_name='prod_has_category__id')
    category_name = CharFilter(field_name='prod_has_category__name', lookup_expr='icontains')
    
    # Tags filter
    tags = CharFilter(field_name='tags__name', lookup_expr='iexact')
    tag_slug = CharFilter(field_name='tags__slug', lookup_expr='iexact')
    
    # Date filters
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    
    # Search across multiple fields
    search = CharFilter(method='multi_field_search')

    class Meta:
        model = Product
        fields = {
            'price': ['exact', 'gte', 'lte'],
            'group': ['exact'],
        }
    
    def multi_field_search(self, queryset, name, value):
        """Search across name, description, and tags"""
        return queryset.filter(
            Q(name__icontains=value) |
            Q(description__icontains=value) |
            Q(tags__name__icontains=value)
        ).distinct()


class PublicProductFilter(FilterSet):
    """Filter for Product model - Public API with essential filters"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    description = CharFilter(field_name='description', lookup_expr='icontains')
    group = ChoiceFilter(field_name='group', choices=Product.FOR_CHOICES)
    
    # Price filters
    min_price = NumberFilter(field_name='price', lookup_expr='gte')
    max_price = NumberFilter(field_name='price', lookup_expr='lte')
    
    # Category filter
    category = CharFilter(field_name='prod_has_category__id')
    category_name = CharFilter(field_name='prod_has_category__name', lookup_expr='icontains')
    
    # Tags filter
    tags = CharFilter(field_name='tags__name', lookup_expr='iexact')
    
    # Search
    search = CharFilter(method='multi_field_search')

    class Meta:
        model = Product
        fields = ['id', 'name', 'group']
    
    def multi_field_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value) |
            Q(description__icontains=value) |
            Q(tags__name__icontains=value)
        ).distinct()


class ProductDropdownFilter(FilterSet):
    """Simplified filter for dropdown lists"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    category = CharFilter(field_name='prod_has_category__id')

    class Meta:
        model = Product
        fields = ['id', 'name']


# ============================================================================
# COLOR FILTERS
# ============================================================================

class ColorFilter(FilterSet):
    """Filter for Color model"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Color
        fields = '__all__'


# ============================================================================
# PRODUCT VARIANT FILTERS
# ============================================================================

class ProductVariantFilter(FilterSet):
    """Comprehensive filter for ProductVariant model"""
    id = CharFilter(field_name='id')
    
    # Product filters
    product_id = CharFilter(field_name='product__id')
    product_name = CharFilter(field_name='product__name', lookup_expr='icontains')
    
    # Variant attributes
    size = CharFilter(field_name='size', lookup_expr='iexact')
    colors = CharFilter(field_name='colors__name', lookup_expr='icontains')  # Fixed: colors not color
    material = CharFilter(field_name='material', lookup_expr='icontains')
    sku = CharFilter(field_name='sku', lookup_expr='icontains')
    
    # Stock filters
    min_stock = NumberFilter(field_name='stock_quantity', lookup_expr='gte')
    max_stock = NumberFilter(field_name='stock_quantity', lookup_expr='lte')
    
    # Price filters
    min_price = NumberFilter(field_name='additional_price', lookup_expr='gte')
    max_price = NumberFilter(field_name='additional_price', lookup_expr='lte')
    
    # Status filter
    is_active = BooleanFilter(field_name='is_active')
    
    # Date filters
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = ProductVariant
        fields = {
            'size': ['exact'],
            'material': ['exact', 'icontains'],
            'is_active': ['exact'],
        }


class PublicProductVariantFilter(FilterSet):
    """Filter for ProductVariant - Public API (only active variants)"""
    product_id = CharFilter(field_name='product__id')
    size = CharFilter(field_name='size', lookup_expr='iexact')
    colors = CharFilter(field_name='colors__name', lookup_expr='icontains')
    material = CharFilter(field_name='material', lookup_expr='icontains')
    in_stock = BooleanFilter(method='filter_in_stock')
    
    class Meta:
        model = ProductVariant
        fields = ['product_id', 'size', 'material']
    
    def filter_in_stock(self, queryset, name, value):
        """Filter variants that are in stock"""
        if value:
            return queryset.filter(stock_quantity__gt=0, is_active=True)
        return queryset


# ============================================================================
# INVENTORY FILTERS
# ============================================================================

class InventoryFilter(FilterSet):
    """Filter for Inventory model with stock management features"""
    id = CharFilter(field_name='id')
    
    # Product/Variant filters
    product_id = CharFilter(field_name='product_variant__product__id')
    product_name = CharFilter(field_name='product_variant__product__name', lookup_expr='icontains')
    variant_id = CharFilter(field_name='product_variant__id')
    variant_sku = CharFilter(field_name='product_variant__sku', lookup_expr='icontains')

    # Stock level filters
    min_stock = NumberFilter(field_name='current_stock', lookup_expr='gte')
    max_stock = NumberFilter(field_name='current_stock', lookup_expr='lte')
    exact_stock = NumberFilter(field_name='current_stock')

    # Stock level thresholds
    min_level = NumberFilter(field_name='minimum_stock_level', lookup_expr='gte')
    max_level = NumberFilter(field_name='maximum_stock_level', lookup_expr='lte')

    # Reorder point filters
    min_reorder = NumberFilter(field_name='reorder_point', lookup_expr='gte')
    max_reorder = NumberFilter(field_name='reorder_point', lookup_expr='lte')

    # Cost price filters
    min_cost = NumberFilter(field_name='cost_price', lookup_expr='gte')
    max_cost = NumberFilter(field_name='cost_price', lookup_expr='lte')

    # Date filters
    restocked_from = DateFilter(field_name='last_restocked', lookup_expr='gte')
    restocked_to = DateFilter(field_name='last_restocked', lookup_expr='lte')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')

    # Status filters (based on properties)
    is_low_stock = BooleanFilter(method='filter_is_low_stock')
    needs_reorder = BooleanFilter(method='filter_needs_reorder')

    class Meta:
        model = Inventory
        fields = []

    def filter_is_low_stock(self, queryset, name, value):
        """Filter items with low stock (current_stock <= minimum_stock_level)"""
        if value:
            return queryset.filter(current_stock__lte=F('minimum_stock_level'))
        return queryset.filter(current_stock__gt=F('minimum_stock_level'))

    def filter_needs_reorder(self, queryset, name, value):
        """Filter items that need reordering (current_stock <= reorder_point)"""
        if value:
            return queryset.filter(current_stock__lte=F('reorder_point'))
        return queryset.filter(current_stock__gt=F('reorder_point'))


# ============================================================================
# SALES PRODUCT FILTERS
# ============================================================================

class SalesProductFilter(FilterSet):
    """Filter for SalesProduct model - Admin use"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    description = CharFilter(field_name='description', lookup_expr='icontains')
    
    # Price filters - Fixed field names to match model
    min_original_price = NumberFilter(field_name='original_price', lookup_expr='gte')
    max_original_price = NumberFilter(field_name='original_price', lookup_expr='lte')
    min_final_price = NumberFilter(field_name='final_price', lookup_expr='gte')
    max_final_price = NumberFilter(field_name='final_price', lookup_expr='lte')
    
    # Discount filters
    min_discount = NumberFilter(field_name='discount_percent', lookup_expr='gte')
    max_discount = NumberFilter(field_name='discount_percent', lookup_expr='lte')
    has_discount = BooleanFilter(method='filter_has_discount')
    
    # Category filter
    category = CharFilter(field_name='salesprod_has_category__id')
    category_name = CharFilter(field_name='salesprod_has_category__name', lookup_expr='icontains')
    
    # Date filters
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = SalesProduct
        exclude = ['image']
    
    def filter_has_discount(self, queryset, name, value):
        """Filter products with discounts"""
        if value:
            return queryset.filter(discount_percent__gt=0)
        return queryset.filter(discount_percent=0)


class PublicSalesProductFilter(FilterSet):
    """Filter for SalesProduct - Public API"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    
    # Price filters
    min_price = NumberFilter(field_name='final_price', lookup_expr='gte')
    max_price = NumberFilter(field_name='final_price', lookup_expr='lte')
    
    # Discount filter
    min_discount = NumberFilter(field_name='discount_percent', lookup_expr='gte')
    
    # Category filter
    category = CharFilter(field_name='salesprod_has_category__id')
    category_name = CharFilter(field_name='salesprod_has_category__name', lookup_expr='icontains')

    class Meta:
        model = SalesProduct
        fields = ['id', 'name', 'category']


class SalesProductDropdownFilter(FilterSet):
    """Simplified filter for dropdown lists"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = SalesProduct
        fields = ['id', 'name']


# ============================================================================
# ORDER FILTERS
# ============================================================================

class OrderFilter(FilterSet):
    """Comprehensive filter for Order model - Admin use"""
    id = CharFilter(field_name='id')
    
    # Customer filters
    customer_id = CharFilter(field_name='customer__id')
    customer_name = CharFilter(field_name='customer_name', lookup_expr='icontains')
    customer_email = CharFilter(field_name='customer_email', lookup_expr='icontains')
    customer_phone = CharFilter(field_name='customer_phone', lookup_expr='icontains')
    
    # Address filters
    city = CharFilter(field_name='city', lookup_expr='icontains')
    delivery_address = CharFilter(field_name='delivery_address', lookup_expr='icontains')
    
    # Status filters
    status = ChoiceFilter(field_name='status', choices=Order.STATUS_CHOICES)
    payment_method = ChoiceFilter(field_name='payment_method', choices=Order.PAYMENT_CHOICES)
    payment_status = BooleanFilter(field_name='payment_status')
    
    # Rider filter
    rider_id = CharFilter(field_name='rider__id')
    rider_name = CharFilter(field_name='rider__username', lookup_expr='icontains')
    
    # Bill/Amount filters
    bill = NumberFilter(field_name='bill')
    min_bill = NumberFilter(field_name='bill', lookup_expr='gte')
    max_bill = NumberFilter(field_name='bill', lookup_expr='lte')
    
    # Date filters
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    delivery_from = DateFilter(field_name='delivery_date', lookup_expr='gte')
    delivery_to = DateFilter(field_name='delivery_date', lookup_expr='lte')

    class Meta:
        model = Order
        fields = {
            'status': ['exact'],
            'payment_status': ['exact'],
            'payment_method': ['exact'],
        }


class PublicOrderFilter(FilterSet):
    """Filter for Order model - Public API (customer's own orders)"""
    id = CharFilter(field_name='id')
    status = ChoiceFilter(field_name='status', choices=Order.STATUS_CHOICES)
    payment_status = BooleanFilter(field_name='payment_status')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Order
        fields = ['id', 'status', 'payment_status']


class OrderSearchFilter(FilterSet):
    """Text-based search filter for orders"""
    search = CharFilter(method='multi_field_search')

    class Meta:
        model = Order
        fields = []
    
    def multi_field_search(self, queryset, name, value):
        """Search across multiple order fields"""
        return queryset.filter(
            Q(id__icontains=value) |
            Q(customer_name__icontains=value) |
            Q(customer_email__icontains=value) |
            Q(customer_phone__icontains=value) |
            Q(delivery_address__icontains=value) |
            Q(city__icontains=value)
        ).distinct()


# ============================================================================
# ORDER DETAIL FILTERS
# ============================================================================

class OrderDetailFilter(FilterSet):
    """Filter for OrderDetail model"""
    id = CharFilter(field_name='id')
    order_id = CharFilter(field_name='order__id')
    product_id = CharFilter(field_name='product__id')
    product_name = CharFilter(field_name='product__name', lookup_expr='icontains')
    sales_product_id = CharFilter(field_name='sales_product__id')
    sales_product_name = CharFilter(field_name='sales_product__name', lookup_expr='icontains')
    
    # Quantity filters
    min_quantity = NumberFilter(field_name='quantity', lookup_expr='gte')
    max_quantity = NumberFilter(field_name='quantity', lookup_expr='lte')
    
    # Price filters
    min_unit_price = NumberFilter(field_name='unit_price', lookup_expr='gte')
    max_unit_price = NumberFilter(field_name='unit_price', lookup_expr='lte')
    min_total_price = NumberFilter(field_name='total_price', lookup_expr='gte')
    max_total_price = NumberFilter(field_name='total_price', lookup_expr='lte')
    
    # Date filters
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = OrderDetail
        fields = ['id', 'order_id']


# ============================================================================
# CONTACT FILTERS
# ============================================================================

class ContactFilter(FilterSet):
    """Filter for Contact model - Admin use"""
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    email = CharFilter(field_name='email', lookup_expr='icontains')
    phone_number = CharFilter(field_name='phone_number', lookup_expr='icontains')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    
    # Search filter
    search = CharFilter(method='multi_field_search')

    class Meta:
        model = Contact
        fields = '__all__'
    
    def multi_field_search(self, queryset, name, value):
        """Search across name, email, and message"""
        return queryset.filter(
            Q(name__icontains=value) |
            Q(email__icontains=value) |
            Q(message__icontains=value)
        ).distinct()


class PublicContactFilter(FilterSet):
    """Filter for Contact model - Public API (limited fields)"""
    id = CharFilter(field_name='id')
    email = CharFilter(field_name='email', lookup_expr='icontains')

    class Meta:
        model = Contact
        fields = ['id', 'email']


# ============================================================================
# REVIEW FILTERS
# ============================================================================

class ReviewFilter(FilterSet):
    """Comprehensive filter for Review model - Admin use"""
    id = CharFilter(field_name='id')
    
    # Reviewer filters
    name = CharFilter(field_name='name', lookup_expr='icontains')
    email = CharFilter(field_name='email', lookup_expr='icontains')
    user_id = CharFilter(field_name='user__id')
    username = CharFilter(field_name='user__username', lookup_expr='icontains')
    
    # Rating filters
    rating = NumberFilter(field_name='rating')
    min_rating = NumberFilter(field_name='rating', lookup_expr='gte')
    max_rating = NumberFilter(field_name='rating', lookup_expr='lte')
    
    # Product filters
    product_id = NumberFilter(field_name='product__id')
    product_name = CharFilter(field_name='product__name', lookup_expr='icontains')
    sales_product_id = NumberFilter(field_name='sales_product__id')
    sales_product_name = CharFilter(field_name='sales_product__name', lookup_expr='icontains')
    
    # Combined filters for any product type
    item_id = NumberFilter(method='filter_by_item_id')
    item_name = CharFilter(method='filter_by_item_name')
    
    # Date filters
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    
    # Search filter
    search = CharFilter(method='multi_field_search')

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
    
    def multi_field_search(self, queryset, name, value):
        """Search across multiple review fields"""
        return queryset.filter(
            Q(name__icontains=value) |
            Q(comment__icontains=value) |
            Q(user__username__icontains=value) |
            Q(product__name__icontains=value) |
            Q(sales_product__name__icontains=value)
        ).distinct()


class PublicReviewFilter(FilterSet):
    """Filter for Review model - Public API"""
    product_id = NumberFilter(field_name='product__id')
    sales_product_id = NumberFilter(field_name='sales_product__id')
    item_id = NumberFilter(method='filter_by_item_id')
    
    # Rating filters
    rating = NumberFilter(field_name='rating')
    min_rating = NumberFilter(field_name='rating', lookup_expr='gte')
    
    class Meta:
        model = Review
        fields = ['rating']
    
    def filter_by_item_id(self, queryset, name, value):
        """Filter by either product_id or sales_product_id"""
        return queryset.filter(
            Q(product__id=value) | Q(sales_product__id=value)
        )
    

class PubliccategorywiseFilter(FilterSet):
    id = CharFilter(field_name='id')
    date_from = DateFilter(field_name='created_at', lookup_expr='gte' )
    date_to = DateFilter(field_name='created_at', lookup_expr='lte' )
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Category
        # fields ='__all__'
        exclude = ['image']