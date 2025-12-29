# """
# E-commerce Views
# Handles all API endpoints for products, orders, categories, reviews, and more
# Uses BaseView for standardized CRUD operations with soft delete support
# """

# import logging
# from datetime import date, timedelta

# from django.conf import settings
# from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
# from django.db import transaction
# from django.db.models import Q, F, Case, When, IntegerField
# from django.shortcuts import get_object_or_404

# from rest_framework import status
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.pagination import PageNumberPagination

# from utils.decorator import permission_required
# from utils.base_api import BaseView
# from utils.helpers import create_response, paginate_data, get_first_error_message
# from utils.response_messages import SUCCESSFUL, UNSUCCESSFUL

# from .models import (
#     Category,
#     Product,
#     ProductTag,
#     ProductImage,
#     Color,
#     ProductVariant,
#     Inventory,
#     SalesProduct,
#     SalesProductImage,
#     Order,
#     OrderDetail,
#     Contact,
#     Review
# )

# from .serializers import (
#     ProductSerializer,
#     ColorSerializer,
#     ProductVariantSerializer,
#     InventorySerializer,
#     SalesProductSerializer,
#     CategorySerializer,
#     ProductTagSerializer,
#     OrderSerializer,
#     ContactSerializer,
#     ReviewSerializer,
#     PublicReviewSerializer
# )

# from .filters import (
#     ProductFilter,
#     PublicProductFilter,
#     ProductDropdownFilter,
#     ColorFilter,
#     ProductVariantFilter,
#     PublicProductVariantFilter,
#     InventoryFilter,
#     SalesProductFilter,
#     PublicSalesProductFilter,
#     SalesProductDropdownFilter,
#     CategoryFilter,
#     PublicCategoryFilter,
#     CategoryDropdownFilter,
#     ProductTagFilter,
#     OrderFilter,
#     PublicOrderFilter,
#     OrderSearchFilter,
#     OrderDetailFilter,
#     ContactFilter,
#     PublicContactFilter,
#     ReviewFilter,
#     PublicReviewFilter
# )

# # Setup logger
# logger = logging.getLogger(__name__)


# # ============================================================================
# # PRODUCT VIEWS
# # ============================================================================

# class ProductView(BaseView):
#     """Admin product management view - uses BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ProductSerializer
#     filterset_class = ProductFilter
    
#     @permission_required(['create_product'])
#     def post(self, request):
#         return super().post_(request)
    
#     @permission_required(['read_product'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['update_product'])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required(['delete_product'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicProductView(BaseView):
#     """Public product listing view"""
#     permission_classes = ()
#     serializer_class = ProductSerializer
#     filterset_class = PublicProductFilter
    
#     def get_publicproduct(self, request):
#         """Get public products with pagination"""
#         try:
#             # Get all non-deleted products (BaseView pattern)
#             instances = self.serializer_class.Meta.model.objects.filter(deleted=False)
            
#             # Apply filters
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             queryset = filtered_data.qs
            
#             # Get and validate pagination parameters
#             page = request.GET.get('page', 1)
#             limit = request.GET.get('limit', 24)
#             offset = request.GET.get('offset', 0)
            
#             try:
#                 page = int(page)
#                 limit = int(limit)
#                 offset = int(offset)
                
#                 # Validate ranges
#                 if page < 1:
#                     page = 1
#                 if limit < 1:
#                     limit = 24
#                 if limit > 100:
#                     limit = 100
#                 if offset < 0:
#                     offset = 0
#             except (ValueError, TypeError):
#                 return create_response(
#                     {"error": "Invalid pagination parameters"},
#                     "BAD_REQUEST",
#                     400
#                 )
            
#             # Get total count
#             total_count = queryset.count()
            
#             # Apply offset
#             if offset > 0:
#                 if offset >= total_count:
#                     return create_response({
#                         "count": 0,
#                         "total_count": total_count,
#                         "total_pages": 0,
#                         "current_page": 1,
#                         "data": []
#                     }, SUCCESSFUL, 200)
#                 queryset = queryset[offset:]
            
#             # Paginate
#             paginator = Paginator(queryset, limit)
            
#             try:
#                 paginated_data = paginator.page(page)
#             except EmptyPage:
#                 return create_response({
#                     "error": "Page not found",
#                     "total_pages": paginator.num_pages
#                 }, "NOT_FOUND", 404)
            
#             # Serialize
#             serialized_data = self.serializer_class(paginated_data, many=True).data
            
#             response_data = {
#                 "count": total_count,
#                 "total_pages": paginator.num_pages,
#                 "current_page": page,
#                 "limit": limit,
#                 "offset": offset,
#                 "next": paginated_data.has_next(),
#                 "previous": paginated_data.has_previous(),
#                 "data": serialized_data,
#             }
            
#             return create_response(response_data, SUCCESSFUL, 200)

#         except Exception as e:
#             logger.error(f"Error in get_publicproduct: {str(e)}", exc_info=True)
#             return create_response(
#                 {"error": "Failed to fetch products"},
#                 UNSUCCESSFUL,
#                 500
#             )


# class ProductDropdownView(BaseView):
#     """Product dropdown list for forms"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ProductSerializer
#     filterset_class = ProductDropdownFilter
    
#     def get_dropdown(self, request):
#         """Get products for dropdown (uses BaseView pattern)"""
#         try:
#             instances = self.serializer_class.Meta.model.objects.filter(deleted=False)
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

#             paginated_data, count = paginate_data(data, request)
#             serialized_data = self.serializer_class(paginated_data, many=True).data
            
#             return create_response({
#                 "count": count,
#                 "data": serialized_data,
#             }, SUCCESSFUL, 200)
#         except Exception as e:
#             logger.error(f"Error in ProductDropdownView: {str(e)}")
#             return create_response({"error": str(e)}, UNSUCCESSFUL, 500)


# # ============================================================================
# # COLOR VIEWS
# # ============================================================================

# class ColorView(BaseView):
#     """Color management view - uses BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ColorSerializer
#     filterset_class = ColorFilter
    
#     @permission_required(['create_color'])
#     def post(self, request):
#         return super().post_(request)
    
#     @permission_required(['read_color'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['update_color'])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required(['delete_color'])
#     def delete(self, request):
#         return super().delete_(request)


# # ============================================================================
# # PRODUCT VARIANT VIEWS
# # ============================================================================

# class ProductVariantView(BaseView):
#     """Product variant management view - uses BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ProductVariantSerializer
#     filterset_class = ProductVariantFilter
    
#     @permission_required(['create_productvariant'])
#     def post(self, request):
#         return super().post_(request)
    
#     @permission_required(['read_productvariant'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['update_productvariant'])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required(['delete_productvariant'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicProductVariantView(BaseView):
#     """Public product variant view"""
#     permission_classes = ()
#     serializer_class = ProductVariantSerializer
#     filterset_class = PublicProductVariantFilter
    
#     def get_variants(self, request):
#         """Get public variants (only active)"""
#         try:
#             # Only show active, non-deleted variants
#             instances = self.serializer_class.Meta.model.objects.filter(
#                 deleted=False,
#                 is_active=True
#             )
            
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

#             paginated_data, count = paginate_data(data, request)
#             serialized_data = self.serializer_class(paginated_data, many=True).data
            
#             return create_response({
#                 "count": count,
#                 "data": serialized_data,
#             }, SUCCESSFUL, 200)
#         except Exception as e:
#             logger.error(f"Error in PublicProductVariantView: {str(e)}")
#             return create_response({"error": str(e)}, UNSUCCESSFUL, 500)


# # ============================================================================
# # INVENTORY VIEWS
# # ============================================================================

# class InventoryView(BaseView):
#     """Inventory management view - uses BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = InventorySerializer
#     filterset_class = InventoryFilter
    
#     @permission_required(['create_inventory'])
#     def post(self, request):
#         return super().post_(request)
    
#     @permission_required(['read_inventory'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['update_inventory'])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required(['delete_inventory'])
#     def delete(self, request):
#         return super().delete_(request)


# # ============================================================================
# # SALES PRODUCT VIEWS
# # ============================================================================

# class SalesProductView(BaseView):
#     """Admin sales product management view - uses BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = SalesProductSerializer
#     filterset_class = SalesProductFilter
    
#     @permission_required(['create_sales_product'])
#     def post(self, request):
#         return super().post_(request)
    
#     @permission_required(['read_sales_product'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['update_sales_product'])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required(['delete_sales_product'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicSalesProductView(BaseView):
#     """Public sales product listing view"""
#     permission_classes = ()
#     serializer_class = SalesProductSerializer
#     filterset_class = PublicSalesProductFilter
    
#     def get_publicsalesproduct(self, request):
#         """Get public sales products with pagination"""
#         try:
#             # Get all non-deleted sales products (BaseView pattern)
#             instances = self.serializer_class.Meta.model.objects.filter(deleted=False)
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             queryset = filtered_data.qs

#             # Get and validate pagination parameters
#             page = request.GET.get('page', 1)
#             limit = request.GET.get('limit', 12)
#             offset = request.GET.get('offset', 0)

#             try:
#                 page = int(page)
#                 limit = int(limit)
#                 offset = int(offset)
                
#                 # Validate parameter ranges
#                 if page < 1:
#                     page = 1
#                 if limit < 1:
#                     limit = 12
#                 if limit > 100:
#                     limit = 100
#                 if offset < 0:
#                     offset = 0
                    
#             except (ValueError, TypeError):
#                 return create_response(
#                     {"error": "Invalid pagination parameters"},
#                     "BAD_REQUEST",
#                     400
#                 )

#             # Get total count before applying offset
#             total_count = queryset.count()
            
#             # Apply offset if specified
#             if offset > 0:
#                 if offset >= total_count:
#                     return create_response({
#                         "count": 0,
#                         "total_count": total_count,
#                         "total_pages": 0,
#                         "current_page": 1,
#                         "data": [],
#                         "message": "Offset exceeds total number of records"
#                     }, SUCCESSFUL, 200)
#                 queryset = queryset[offset:]

#             # Get count after offset
#             remaining_count = queryset.count()
            
#             # Create paginator
#             paginator = Paginator(queryset, limit)

#             try:
#                 paginated_data = paginator.page(page)
#             except PageNotAnInteger:
#                 paginated_data = paginator.page(1)
#                 page = 1
#             except EmptyPage:
#                 if paginator.num_pages > 0:
#                     paginated_data = paginator.page(paginator.num_pages)
#                     page = paginator.num_pages
#                 else:
#                     return create_response({
#                         "count": 0,
#                         "total_count": total_count,
#                         "data": [],
#                         "message": "No data available"
#                     }, SUCCESSFUL, 200)

#             # Serialize the paginated data
#             serialized_data = self.serializer_class(paginated_data, many=True).data

#             response_data = {
#                 "count": remaining_count,
#                 "total_count": total_count,
#                 "total_pages": paginator.num_pages,
#                 "current_page": page,
#                 "limit": limit,
#                 "offset": offset,
#                 "next": paginated_data.has_next(),
#                 "previous": paginated_data.has_previous(),
#                 "data": serialized_data,
#             }

#             return create_response(response_data, SUCCESSFUL, 200)

#         except Exception as e:
#             logger.error(f"Error in get_publicsalesproduct: {str(e)}", exc_info=True)
#             return create_response(
#                 {"error": "Failed to fetch sales products"},
#                 UNSUCCESSFUL,
#                 500
#             )


# class SalesProductDropdownView(BaseView):
#     """Sales product dropdown list for forms"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = SalesProductSerializer
#     filterset_class = SalesProductDropdownFilter
    
#     def get_dropdown(self, request):
#         """Get sales products for dropdown"""
#         try:
#             instances = self.serializer_class.Meta.model.objects.filter(deleted=False)
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

#             paginated_data, count = paginate_data(data, request)
#             serialized_data = self.serializer_class(paginated_data, many=True).data
            
#             return create_response({
#                 "count": count,
#                 "data": serialized_data,
#             }, SUCCESSFUL, 200)
#         except Exception as e:
#             logger.error(f"Error in SalesProductDropdownView: {str(e)}")
#             return create_response({"error": str(e)}, UNSUCCESSFUL, 500)


# # ============================================================================
# # CATEGORY VIEWS
# # ============================================================================

# class CategoryView(BaseView):
#     """Admin category management view - uses BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = CategorySerializer
#     filterset_class = CategoryFilter
    
#     @permission_required(['create_category'])
#     def post(self, request):
#         return super().post_(request)
    
#     @permission_required(['read_category'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['update_category'])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required(['delete_category'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicCategoryView(BaseView):
#     """Public category listing view"""
#     permission_classes = ()
#     serializer_class = CategorySerializer
#     filterset_class = PublicCategoryFilter
    
#     def get_publiccategory(self, request):
#         """Get public categories with pagination"""
#         try:
#             # Get all non-deleted categories (BaseView pattern)
#             instances = self.serializer_class.Meta.model.objects.filter(deleted=False)
            
#             # Apply filters
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             queryset = filtered_data.qs
            
#             # Get and validate pagination parameters
#             page = request.GET.get('page', 1)
#             limit = request.GET.get('limit', 24)
#             offset = request.GET.get('offset', 0)
            
#             try:
#                 page = int(page)
#                 limit = int(limit)
#                 offset = int(offset)
                
#                 if page < 1:
#                     page = 1
#                 if limit < 1:
#                     limit = 24
#                 if limit > 100:
#                     limit = 100
#                 if offset < 0:
#                     offset = 0
#             except (ValueError, TypeError):
#                 return create_response(
#                     {"error": "Invalid pagination parameters"},
#                     "BAD_REQUEST",
#                     400
#                 )
            
#             # Get total count
#             total_count = queryset.count()
            
#             # Apply offset
#             if offset > 0:
#                 if offset >= total_count:
#                     return create_response({
#                         "count": 0,
#                         "total_count": total_count,
#                         "data": []
#                     }, SUCCESSFUL, 200)
#                 queryset = queryset[offset:]
            
#             # Paginate
#             paginator = Paginator(queryset, limit)
            
#             try:
#                 paginated_data = paginator.page(page)
#             except EmptyPage:
#                 return create_response({
#                     "error": "Page not found"
#                 }, "NOT_FOUND", 404)
            
#             serialized_data = self.serializer_class(paginated_data, many=True).data
            
#             response_data = {
#                 "count": total_count,
#                 "total_pages": paginator.num_pages,
#                 "current_page": page,
#                 "limit": limit,
#                 "offset": offset,
#                 "next": paginated_data.has_next(),
#                 "previous": paginated_data.has_previous(),
#                 "data": serialized_data,
#             }
            
#             return create_response(response_data, SUCCESSFUL, 200)

#         except Exception as e:
#             logger.error(f"Error in get_publiccategory: {str(e)}", exc_info=True)
#             return create_response(
#                 {"error": "Failed to fetch categories"},
#                 UNSUCCESSFUL,
#                 500
#             )


# class PublicCategoryDetailView(BaseView):
#     """Public category detail view - single category or list"""
#     permission_classes = ()
#     serializer_class = CategorySerializer
#     filterset_class = PublicCategoryFilter
    
#     def get_category_detail(self, request, pk=None):
#         """Get single category or paginated list"""
#         try:
#             if pk is not None:
#                 # Fetch single category by ID (BaseView pattern)
#                 instance = self.serializer_class.Meta.model.objects.filter(
#                     pk=pk,
#                     deleted=False
#                 ).first()
                
#                 if not instance:
#                     return create_response(
#                         {"error": "Category not found"},
#                         "NOT_FOUND",
#                         404
#                     )

#                 serialized_data = self.serializer_class(instance).data
#                 return create_response(serialized_data, SUCCESSFUL, 200)

#             # Fetch all categories (paginated, BaseView pattern)
#             instances = self.serializer_class.Meta.model.objects.filter(deleted=False)
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

#             paginated_data, count = paginate_data(data, request)
#             serialized_data = self.serializer_class(paginated_data, many=True).data

#             return create_response({
#                 "count": count,
#                 "data": serialized_data,
#             }, SUCCESSFUL, 200)

#         except Exception as e:
#             logger.error(f"Error in get_category_detail: {str(e)}", exc_info=True)
#             return create_response(
#                 {"error": "Failed to fetch category"},
#                 UNSUCCESSFUL,
#                 500
#             )


# class CategoryDropdownView(BaseView):
#     """Category dropdown list for forms"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = CategorySerializer
#     filterset_class = CategoryDropdownFilter
    
#     def get_dropdown(self, request):
#         """Get categories for dropdown"""
#         try:
#             instances = self.serializer_class.Meta.model.objects.filter(deleted=False)
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

#             paginated_data, count = paginate_data(data, request)
#             serialized_data = self.serializer_class(paginated_data, many=True).data
            
#             return create_response({
#                 "count": count,
#                 "data": serialized_data,
#             }, SUCCESSFUL, 200)
#         except Exception as e:
#             logger.error(f"Error in CategoryDropdownView: {str(e)}")
#             return create_response({"error": str(e)}, UNSUCCESSFUL, 500)


# # ============================================================================
# # PRODUCT TAG VIEWS
# # ============================================================================

# class ProductTagView(BaseView):
#     """Product tag management view - uses BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ProductTagSerializer
#     filterset_class = ProductTagFilter
    
#     def post(self, request):
#         return super().post_(request)
    
#     def get(self, request):
#         return super().get_(request)
    
#     def patch(self, request):
#         return super().patch_(request)
    
#     def delete(self, request):
#         return super().delete_(request)


# # ============================================================================
# # ORDER VIEWS
# # ============================================================================

# class OrderView(BaseView):
#     """Admin order management view - uses BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = OrderSerializer
#     filterset_class = OrderFilter
    
#     @permission_required(['create_order'])
#     def post(self, request):
#         return super().post_(request)
    
#     @permission_required(['read_order'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['update_order'])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required(['delete_order'])
#     def delete(self, request):
#         return super().delete_(request)


# class OrderSearchView(BaseView):
#     """Order search view with text-based search"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = OrderSerializer
#     filterset_class = OrderSearchFilter
    
#     def get_search(self, request):
#         """Search orders by ID or other fields"""
#         try:
#             order_id = request.query_params.get('id')

#             # If ID is provided, return a single order (BaseView pattern)
#             if order_id:
#                 instance = self.serializer_class.Meta.model.objects.filter(
#                     id=order_id,
#                     deleted=False
#                 ).first()
                
#                 if not instance:
#                     return create_response(
#                         {"error": "Order not found"},
#                         "NOT_FOUND",
#                         404
#                     )
                
#                 serialized_data = self.serializer_class(instance).data
#                 return create_response(serialized_data, SUCCESSFUL, 200)

#             # Else return paginated list (BaseView pattern)
#             instances = self.serializer_class.Meta.model.objects.filter(deleted=False)
#             filtered_data = self.filterset_class(request.query_params, queryset=instances)
#             data = filtered_data.qs

#             paginated_data, count = paginate_data(data, request)
#             serialized_data = self.serializer_class(paginated_data, many=True).data

#             return create_response({
#                 "count": count,
#                 "data": serialized_data,
#             }, SUCCESSFUL, 200)

#         except Exception as e:
#             logger.error(f"Error in OrderSearchView: {str(e)}", exc_info=True)
#             return create_response(
#                 {"error": "Failed to search orders"},
#                 UNSUCCESSFUL,
#                 500
#             )


# class PublicOrderView(BaseView):
#     """Public order creation view"""
#     permission_classes = ()
#     serializer_class = OrderSerializer

#     def _calculate_delivery_date(self):
#         """Calculate delivery date based on current day"""
#         today = date.today()
#         if today.weekday() in [3, 4]:  # Thursday, Friday
#             return today + timedelta(days=4)
#         elif today.weekday() == 5:  # Saturday
#             return today + timedelta(days=3)
#         return today + timedelta(days=2)

#     def _get_product_price(self, product_type, product_id):
#         """
#         Helper method to get price based on product type
#         Returns: (price, product) tuple
#         """
#         if product_type == 'product':
#             product = Product.objects.get(id=product_id, deleted=False)
#             return product.price, product
#         elif product_type == 'sales_product':
#             sales_product = SalesProduct.objects.get(id=product_id, deleted=False)
#             return sales_product.final_price, sales_product
#         else:
#             raise ValueError(f"Invalid product type: {product_type}")

#     def create_mixed_order(self, request):
#         """
#         Handles order creation with both regular and sales products
#         """
#         try:
#             # Extract personal info
#             personal_info = {
#                 'customer_name': request.data.get('customer_name'),
#                 'customer_email': request.data.get('customer_email'),
#                 'customer_phone': request.data.get('customer_phone'),
#                 'delivery_address': request.data.get('delivery_address'),
#                 'city': request.data.get('city'), 
#                 'payment_method': request.data.get('payment_method'),
#             }
            
#             # Get product selections
#             items = request.data.get('items', [])
            
#             # Validate required fields
#             if not all(personal_info.values()) or not items:
#                 return create_response(
#                     {"error": "Missing required fields"},
#                     "BAD_REQUEST",
#                     400
#                 )
            
#             # Prepare order data
#             order_data = {
#                 **personal_info,
#                 'delivery_date': self._calculate_delivery_date(),
#                 'status': 'pending',
#                 'payment_status': False
#             }
            
#             # Validate order data
#             serialized_data = self.serializer_class(data=order_data)
#             if not serialized_data.is_valid():
#                 return create_response(
#                     {"errors": serialized_data.errors}, 
#                     get_first_error_message(serialized_data.errors, UNSUCCESSFUL),
#                     400
#                 )
            
#             # Process order with transaction
#             with transaction.atomic():
#                 # Save order (note: created_by will be None for public orders)
#                 order = serialized_data.save()
#                 bill = 0
#                 order_items = []
                
#                 # Process each item
#                 for item in items:
#                     product_type = item.get('product_type')
#                     product_id = item.get('product_id')
#                     quantity = item.get('quantity', 1)
                    
#                     try:
#                         # Get price and product based on type
#                         unit_price, product = self._get_product_price(product_type, product_id)
#                         total_price = unit_price * quantity
                        
#                         # Prepare order detail data
#                         order_detail_data = {
#                             'order': order,
#                             'unit_price': unit_price,
#                             'quantity': quantity,
#                             'total_price': total_price
#                         }
                        
#                         # Set the appropriate product field
#                         if product_type == 'product':
#                             order_detail_data['product'] = product
#                         else:
#                             order_detail_data['sales_product'] = product
                        
#                         # Create order detail
#                         OrderDetail.objects.create(**order_detail_data)
                        
#                         bill += total_price
#                         order_items.append({
#                             'product_type': product_type,
#                             'product_id': product.id,
#                             'product_name': product.name,
#                             'quantity': quantity,
#                             'unit_price': float(unit_price),
#                             'total_price': float(total_price),
#                             'is_discounted': getattr(product, 'has_discount', False)
#                         })
                        
#                     except (Product.DoesNotExist, SalesProduct.DoesNotExist):
#                         raise ValueError(f"{product_type.title()} with id {product_id} not found")
                
#                 # Update order total
#                 order.bill = bill
#                 order.save()

#                 # Prepare response
#                 response_data = {
#                     'order_id': order.id,
#                     'customer_info': {
#                         'name': order.customer_name,
#                         'email': order.customer_email,
#                         'phone': order.customer_phone
#                     },
#                     'delivery_info': {
#                         'address': order.delivery_address,
#                         'city': order.city,
#                         'estimated_date': order.delivery_date.strftime('%Y-%m-%d')
#                     },
#                     'order_summary': {
#                         'items': order_items,
#                         'subtotal': float(bill),
#                         'total': float(bill)
#                     },
#                     'payment_method': order.payment_method,
#                     'status': order.status
#                 }

#                 return create_response(response_data, SUCCESSFUL, 200)

#         except ValueError as e:
#             return create_response(
#                 {"error": str(e)},
#                 "BAD_REQUEST",
#                 400
#             )
#         except Exception as e:
#             logger.error(f"Order creation failed: {str(e)}", exc_info=True)
#             return create_response(
#                 {"error": "Failed to create order"},
#                 UNSUCCESSFUL,
#                 500
#             )
    
#     def post(self, request):
#         """Route to appropriate order creation method"""
#         if 'items' in request.data and any(item.get('product_type') for item in request.data.get('items', [])):
#             return self.create_mixed_order(request)
#         else:
#             # Use BaseView for simple order creation
#             return super().post_(request)


# # ============================================================================
# # CONTACT VIEWS
# # ============================================================================

# class ContactView(BaseView):
#     """Admin contact management view"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ContactSerializer
#     filterset_class = ContactFilter
    
#     @permission_required(['read_contact'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['delete_contact'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicContactView(BaseView):
#     """Public contact form submission view"""
#     permission_classes = ()
#     serializer_class = ContactSerializer
#     filterset_class = PublicContactFilter
    
#     def post(self, request):
#         """Submit contact form (uses BaseView but no created_by for public)"""
#         return super().post_(request)
    
#     def get_publiccontact(self, request):
#         """Get public contact submissions (if needed)"""
#         try:
#             instances = self.serializer_class.Meta.model.objects.filter(deleted=False)
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

#             paginated_data, count = paginate_data(data, request)
#             serialized_data = self.serializer_class(paginated_data, many=True).data
            
#             return create_response({
#                 "count": count,
#                 "data": serialized_data,
#             }, SUCCESSFUL, 200)

#         except Exception as e:
#             logger.error(f"Error in get_publiccontact: {str(e)}")
#             return create_response(
#                 {"error": "Failed to fetch contacts"},
#                 UNSUCCESSFUL,
#                 500
#             )


# # ============================================================================
# # REVIEW VIEWS
# # ============================================================================

# class ReviewView(BaseView):
#     """Admin review management view"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ReviewSerializer
#     filterset_class = ReviewFilter

#     def post(self, request):
#         """Create a review"""
#         try:
#             # Check if either product or sales_product is provided
#             product_id = request.data.get('product')
#             sales_product_id = request.data.get('sales_product')

#             if not product_id and not sales_product_id:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Either product or sales_product ID is required'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Validate product exists if provided
#             if product_id:
#                 get_object_or_404(Product, id=product_id, deleted=False)
#             if sales_product_id:
#                 get_object_or_404(SalesProduct, id=sales_product_id, deleted=False)

#             # Set user if authenticated
#             if request.user.is_authenticated:
#                 request.data["user"] = request.user.id
            
#             # Validate and save (uses BaseView pattern)
#             serializer = self.serializer_class(data=request.data, context={'request': request})
#             if serializer.is_valid():
#                 review = serializer.save(created_by=request.user if request.user.is_authenticated else None)
                
#                 return Response({
#                     'status': 'SUCCESS',
#                     'message': 'Review created successfully',
#                     'data': self.serializer_class(review).data
#                 }, status=status.HTTP_201_CREATED)
            
#             return Response({
#                 'status': 'ERROR',
#                 'message': get_first_error_message(serializer.errors, "Validation failed"),
#                 'errors': serializer.errors
#             }, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             logger.error(f"Error creating review: {str(e)}", exc_info=True)
#             return Response({
#                 'status': 'ERROR',
#                 'message': 'Failed to create review',
#                 'error': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def get(self, request):
#         """Get reviews with filters (BaseView pattern)"""
#         try:
#             queryset = Review.objects.filter(deleted=False).order_by('-created_at')
#             filtered_queryset = self.filterset_class(request.GET, queryset=queryset).qs
            
#             # Pagination
#             page = request.GET.get('page', 1)
#             limit = request.GET.get('limit', 10)
            
#             try:
#                 page = int(page)
#                 limit = int(limit)
#                 if page < 1:
#                     page = 1
#                 if limit < 1 or limit > 100:
#                     limit = 10
#             except (ValueError, TypeError):
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Invalid pagination parameters'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             paginator = Paginator(filtered_queryset, limit)
            
#             try:
#                 paginated_data = paginator.page(page)
#             except EmptyPage:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Page not found'
#                 }, status=status.HTTP_404_NOT_FOUND)
            
#             serializer = self.serializer_class(paginated_data, many=True)
            
#             return Response({
#                 'status': 'SUCCESS',
#                 'message': 'Reviews retrieved successfully',
#                 'data': serializer.data,
#                 'meta': {
#                     'total': paginator.count,
#                     'pages': paginator.num_pages,
#                     'current_page': page,
#                     'limit': limit,
#                     'has_next': paginated_data.has_next(),
#                     'has_previous': paginated_data.has_previous()
#                 }
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             logger.error(f"Error retrieving reviews: {str(e)}", exc_info=True)
#             return Response({
#                 'status': 'ERROR',
#                 'message': 'Failed to retrieve reviews'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def patch(self, request):
#         """Update a review (BaseView pattern with ownership check)"""
#         try:
#             if "id" not in request.data:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Review ID not provided'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             instance = Review.objects.filter(id=request.data["id"], deleted=False).first()
#             if not instance:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Review not found'
#                 }, status=status.HTTP_404_NOT_FOUND)

#             # Check ownership
#             if request.user.is_authenticated and instance.user and instance.user != request.user:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'You can only update your own reviews'
#                 }, status=status.HTTP_403_FORBIDDEN)

#             # Don't allow changing product associations
#             data = request.data.copy()
#             data.pop('product', None)
#             data.pop('sales_product', None)
            
#             serializer = self.serializer_class(
#                 instance,
#                 data=data,
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if serializer.is_valid():
#                 updated_review = serializer.save(updated_by=request.user if request.user.is_authenticated else None)
#                 return Response({
#                     'status': 'SUCCESS',
#                     'message': 'Review updated successfully',
#                     'data': self.serializer_class(updated_review).data
#                 }, status=status.HTTP_200_OK)
            
#             return Response({
#                 'status': 'ERROR',
#                 'message': get_first_error_message(serializer.errors, "Validation failed"),
#                 'errors': serializer.errors
#             }, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             logger.error(f"Error updating review: {str(e)}", exc_info=True)
#             return Response({
#                 'status': 'ERROR',
#                 'message': 'Failed to update review'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def delete(self, request):
#         """Delete a review (soft delete, BaseView pattern with ownership check)"""
#         try:
#             review_id = request.query_params.get('id')
#             if not review_id:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Review ID not provided'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             instance = Review.objects.filter(id=review_id, deleted=False).first()
#             if not instance:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Review not found'
#                 }, status=status.HTTP_404_NOT_FOUND)

#             # Check ownership
#             if request.user.is_authenticated and instance.user and instance.user != request.user:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'You can only delete your own reviews'
#                 }, status=status.HTTP_403_FORBIDDEN)

#             # Soft delete (BaseView pattern)
#             instance.deleted = True
#             instance.updated_by = request.user if request.user.is_authenticated else None
#             instance.save()
            
#             return Response({
#                 'status': 'SUCCESS',
#                 'message': 'Review deleted successfully',
#                 'data': {'id': review_id}
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             logger.error(f"Error deleting review: {str(e)}", exc_info=True)
#             return Response({
#                 'status': 'ERROR',
#                 'message': 'Failed to delete review'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PublicReviewView(BaseView):
#     """Public review view - read and create only"""
#     permission_classes = ()
#     serializer_class = PublicReviewSerializer
#     filterset_class = PublicReviewFilter

#     def post(self, request):
#         """Create a public review"""
#         try:
#             product_id = request.data.get('product')
#             sales_product_id = request.data.get('sales_product')

#             if not product_id and not sales_product_id:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Either product or sales_product ID is required'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Validate product exists (BaseView pattern - check deleted)
#             if product_id:
#                 get_object_or_404(Product, id=product_id, deleted=False)
#             if sales_product_id:
#                 get_object_or_404(SalesProduct, id=sales_product_id, deleted=False)

#             # Use ReviewSerializer for creation
#             serializer = ReviewSerializer(data=request.data, context={'request': request})
#             if serializer.is_valid():
#                 review = serializer.save()

#                 return Response({
#                     'status': 'SUCCESS',
#                     'message': 'Review created successfully',
#                     'data': {
#                         'id': review.id,
#                         'name': review.name,
#                         'comment': review.comment,
#                         'rating': review.rating,
#                         'created_at': review.created_at
#                     }
#                 }, status=status.HTTP_201_CREATED)

#             return Response({
#                 'status': 'ERROR',
#                 'message': get_first_error_message(serializer.errors, "Validation failed"),
#                 'errors': serializer.errors
#             }, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             logger.error(f"Error creating public review: {str(e)}", exc_info=True)
#             return Response({
#                 'status': 'ERROR',
#                 'message': 'Failed to create review'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def get_publicreview(self, request):
#         """Get public reviews for a product (BaseView pattern)"""
#         try:
#             # Get product or sales_product ID
#             product_id = request.GET.get('product_id') or request.GET.get('product')
#             sales_product_id = request.GET.get('sales_product_id') or request.GET.get('sales_product')

#             if not product_id and not sales_product_id:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Either product_id or sales_product_id is required',
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Build the query (BaseView pattern - filter deleted)
#             query = Q(deleted=False)
#             if product_id:
#                 query &= Q(product_id=product_id)
#             if sales_product_id:
#                 query &= Q(sales_product_id=sales_product_id)

#             # Get filtered reviews
#             instances = Review.objects.filter(query).order_by('-created_at')

#             if not instances.exists():
#                 return Response({
#                     'status': 'SUCCESS',
#                     'message': 'No reviews found',
#                     'data': []
#                 }, status=status.HTTP_200_OK)

#             # Apply additional filters
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

#             # Paginate
#             paginated_data, count = paginate_data(data, request)
#             serialized_data = self.serializer_class(paginated_data, many=True).data

#             return Response({
#                 'status': 'SUCCESS',
#                 'message': 'Reviews retrieved successfully',
#                 'data': {
#                     'count': count,
#                     'reviews': serialized_data
#                 }
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             logger.error(f"Error retrieving public reviews: {str(e)}", exc_info=True)
#             return Response({
#                 'status': 'ERROR',
#                 'message': 'Failed to retrieve reviews'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ============================================================================
# # SEARCH VIEWS
# # ============================================================================

# class SearchPagination(PageNumberPagination):
#     """Pagination for search results"""
#     page_size = 10
#     page_size_query_param = 'page_size'
#     max_page_size = 100


# class CategorySearchView(BaseView):
#     """Category search view"""
#     permission_classes = ()
#     serializer_class = CategorySerializer
#     filterset_class = PublicCategoryFilter
#     pagination_class = SearchPagination

#     def get_search(self, request):
#         """Search categories (BaseView pattern - filter deleted)"""
#         search_query = request.GET.get('q', '').strip()
    
#         if not search_query:
#             return create_response(
#                 {"message": "Search query is empty"},
#                 "EMPTY_QUERY",
#                 200
#             )
        
#         try:
#             # Search categories (BaseView pattern)
#             categories = Category.objects.filter(
#                 Q(name__icontains=search_query) |
#                 Q(description__icontains=search_query),
#                 deleted=False  # BaseView pattern
#             ).order_by('-created_at').distinct()

#             # Paginate results
#             paginator = self.pagination_class()
#             paginated_categories = paginator.paginate_queryset(categories, request)
            
#             # Serialize results
#             category_data = self.serializer_class(
#                 paginated_categories, 
#                 many=True, 
#                 context={'request': request}
#             ).data
            
#             # Format results
#             results = {
#                 'categories': category_data,
#                 'search_meta': {
#                     'query': search_query,
#                     'category_count': categories.count(),
#                 }
#             }
            
#             return create_response(results, SUCCESSFUL, 200)
            
#         except Exception as e:
#             logger.error(f"Error in category search: {str(e)}", exc_info=True)
#             return create_response(
#                 {"error": "Search failed"},
#                 UNSUCCESSFUL,
#                 500
#             )

#     def get_suggestions(self, request):
#         """Get search suggestions (BaseView pattern - filter deleted)"""
#         query = request.GET.get('q', '').strip()
        
#         if not query:
#             return create_response(
#                 {"message": "Query is empty"},
#                 "EMPTY_QUERY",
#                 200
#             )
            
#         try:
#             # Get category suggestions (BaseView pattern)
#             suggestions = {
#                 'popular_categories': list(
#                     Category.objects.filter(
#                         Q(name__icontains=query),
#                         deleted=False  # BaseView pattern
#                     ).order_by('name')[:5].values('id', 'name')
#                 )
#             }
            
#             return create_response(suggestions, SUCCESSFUL, 200)
            
#         except Exception as e:
#             logger.error(f"Error getting suggestions: {str(e)}", exc_info=True)
#             return create_response(
#                 {"error": "Failed to get suggestions"},
#                 UNSUCCESSFUL,
#                 500
#             )


"""
E-commerce Views - FINAL ULTRA-SIMPLIFIED VERSION
Only custom logic where BaseView methods are insufficient
Everything else uses BaseView directly - NO DUPLICATION
"""

import logging
from datetime import date, timedelta
import traceback

from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from utils.decorator import permission_required
from utils.base_api import BaseView
from utils.helpers import create_response, paginate_data, get_first_error_message
from utils.response_messages import SUCCESSFUL, UNSUCCESSFUL

from .models import (
    Category, Product, ProductImage, ProductTag, Color, ProductVariant,
    Inventory, SalesProduct, Order, OrderDetail, Contact, Review, SalesProductImage
)

from .serializers import (
    ProductSerializer, ColorSerializer, ProductVariantSerializer,
    InventorySerializer, SalesProductSerializer, CategorySerializer,
    ProductTagSerializer, OrderSerializer, ContactSerializer,
    ReviewSerializer, PublicReviewSerializer
)

from .filters import (
    ProductFilter, PublicProductFilter, ProductDropdownFilter,
    ColorFilter, ProductVariantFilter, PublicProductVariantFilter,
    InventoryFilter, SalesProductFilter, PublicSalesProductFilter,
    SalesProductDropdownFilter, CategoryFilter, PublicCategoryFilter,
    CategoryDropdownFilter, ProductTagFilter, OrderFilter,
    OrderSearchFilter, ContactFilter, PublicContactFilter,
    ReviewFilter, PublicReviewFilter
)

logger = logging.getLogger(__name__)


# ============================================================================
# PRODUCT VIEWS - All use BaseView methods
# ============================================================================

class ProductView(BaseView):
    """Admin product management - full BaseView CRUD"""
    permission_classes = (IsAuthenticated,)
    serializer_class = ProductSerializer
    filterset_class = ProductFilter
    
    # In your ProductView class, modify the post method:

    @permission_required(['create_product'])
    def post(self, request):
        try:
            # Attach created_by user
            data = request.data.copy()
            data["created_by"] = request.user.id  # use guid if needed

            # Validate and save product
            serializer = ProductSerializer(data=data)
            if serializer.is_valid():
                product = serializer.save()

                # Handle MULTIPLE image uploads
                images = request.FILES.getlist('images')
                if len(images) > 5:
                    return Response({'error': 'You can upload a maximum of 5 images.'}, status=400)
                
                # Check if at least one image is provided
                if len(images) == 0:
                    return Response({'error': 'At least one image is required.'}, status=400)

                for img in images:
                    ProductImage.objects.create(product=product, images=img)

                response_data = ProductSerializer(product).data
                return Response({'data': response_data}, status=201)
            else:
                error_message = get_first_error_message(serializer.errors, "UNSUCCESSFUL")
                return Response({'error': error_message}, status=400)

        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    
    @permission_required(['read_product'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_product'])
    def patch(self, request):
        try:
            data = request.data.copy()

            # Validate required fields
            if "id" not in data:
                return Response({"data": "ID NOT PROVIDED"}, status=400)

            product = Product.objects.filter(id=data["id"]).first()
            if not product:
                return Response({"data": "NOT FOUND"}, status=404)

            # Add updated_by info
            data["updated_by"] = request.user.guid

            # Update product
            serializer = ProductSerializer(product, data=data, partial=True)
            if not serializer.is_valid():
                error_message = get_first_error_message(serializer.errors, "UNSUCCESSFUL")
                return Response({'data': error_message}, status=400)

            product_instance = serializer.save()

            # Handle deleted images
            deleted_ids = []
            if "deleted_images" in data:
                try:
                    deleted_ids = [int(i.strip()) for i in data["deleted_images"].split(",") if i.strip().isdigit()]
                    ProductImage.objects.filter(id__in=deleted_ids, product=product_instance).delete()
                except Exception as e:
                    print(f"Error deleting images: {str(e)}")

            # Handle uploaded images - THIS IS CORRECT FOR MULTIPLE IMAGES
            uploaded_images = request.FILES.getlist('images')  # This should get all images
            if len(uploaded_images) > 6:
                return Response({'error': 'You can upload a maximum of 5 images.'}, status=400)

            for img in uploaded_images:
                ProductImage.objects.create(product=product_instance, images=img, created_by=request.user)

            response_data = ProductSerializer(product_instance).data
            response_data.update({
                'message': 'Product updated successfully',
                'images_uploaded': len(uploaded_images),
                'images_deleted': len(deleted_ids),
                'total_images': ProductImage.objects.filter(product=product_instance).count()
            })

            return Response({"data": response_data}, status=200)

        except Exception as e:
            print(f"\n!!! ERROR in update_product: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=500)
    
    @permission_required(['delete_product'])
    def delete(self, request):
        return super().delete_(request)


class PublicProductView(BaseView):
    """Public product listing - BaseView handles everything"""
    permission_classes = ()
    serializer_class = ProductSerializer
    filterset_class = PublicProductFilter
    
    def get(self, request):
        return super().get_(request)


class ProductDropdownView(BaseView):
    """Product dropdown - BaseView handles it"""
    permission_classes = (IsAuthenticated,)
    serializer_class = ProductSerializer
    filterset_class = ProductDropdownFilter
    
    def get(self, request):
        return super().get_(request)


# ============================================================================
# COLOR VIEWS
# ============================================================================

class ColorView(BaseView):
    """Color management - full BaseView CRUD"""
    permission_classes = (IsAuthenticated,)
    serializer_class = ColorSerializer
    filterset_class = ColorFilter
    
    @permission_required(['create_color'])
    def post(self, request):
        return super().post_(request)
    
    @permission_required(['read_color'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_color'])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required(['delete_color'])
    def delete(self, request):
        return super().delete_(request)


# ============================================================================
# PRODUCT VARIANT VIEWS
# ============================================================================

class ProductVariantView(BaseView):
    """Product variant management - full BaseView CRUD"""
    permission_classes = (IsAuthenticated,)
    serializer_class = ProductVariantSerializer
    filterset_class = ProductVariantFilter
    
    @permission_required(['create_productvariant'])
    def post(self, request):
        return super().post_(request)
    
    @permission_required(['read_productvariant'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_productvariant'])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required(['delete_productvariant'])
    def delete(self, request):
        return super().delete_(request)


class PublicProductVariantView(BaseView):
    """Public variants - only active (uses BaseView extra_filters)"""
    permission_classes = ()
    serializer_class = ProductVariantSerializer
    filterset_class = PublicProductVariantFilter
    extra_filters = {'is_active': True}  # BaseView supports this!
    
    def get(self, request):
        return super().get_(request)


# ============================================================================
# INVENTORY VIEWS
# ============================================================================

class InventoryView(BaseView):
    """Inventory management - full BaseView CRUD"""
    permission_classes = (IsAuthenticated,)
    serializer_class = InventorySerializer
    filterset_class = InventoryFilter
    
    @permission_required(['create_inventory'])
    def post(self, request):
        return super().post_(request)
    
    @permission_required(['read_inventory'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_inventory'])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required(['delete_inventory'])
    def delete(self, request):
        return super().delete_(request)


# ============================================================================
# SALES PRODUCT VIEWS
# ============================================================================

class SalesProductView(BaseView):
    """Admin sales product management - full BaseView CRUD"""
    permission_classes = (IsAuthenticated,)
    serializer_class = SalesProductSerializer
    filterset_class = SalesProductFilter
    
    @permission_required(['create_sales_product'])
    def post(self, request):
        try:
            # Ensure required fields are present
            if 'original_price' not in request.data:
                return Response(
                    {"error": "original_price field is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Attach created_by user
            data = request.data.copy()
            data["created_by"] = request.user.guid  # use guid if needed

            # Validate and save product
            serializer = SalesProductSerializer(data=data)
            if serializer.is_valid():
                product = serializer.save()

                # Handle image uploads
                images = request.FILES.getlist('images')
                if len(images) > 5:
                    return Response(
                        {'error': 'You can upload a maximum of 5 images.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

                for img in images:
                    # Assuming you have a SalesProductImage model similar to ProductImage
                    SalesProductImage.objects.create(sale_product=product, images=img)

                response_data = SalesProductSerializer(product).data
                return Response(
                    {
                        "success": True,
                        "data": response_data
                    },
                    status=status.HTTP_201_CREATED
                )
            return Response(
                {
                    "error": "Validation failed",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    @permission_required(['read_sales_product'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_sales_product'])
    def patch(self, request):
        try:
            data = request.data.copy()

            # Validate required fields
            if "id" not in data:
                return Response({"data": "ID NOT PROVIDED"}, status=400)

            # Find product instance
            product = SalesProduct.objects.filter(id=data["id"]).first()
            if not product:
                return Response({"data": "NOT FOUND"}, status=404)

            # Add updated_by info
            data["updated_by"] = request.user.guid

            # Update product
            serializer = SalesProductSerializer(product, data=data, partial=True)
            if not serializer.is_valid():
                error_message = get_first_error_message(serializer.errors, "UNSUCCESSFUL")
                return Response({'data': error_message}, status=400)

            product_instance = serializer.save()

            # Handle deleted images - changed 'product' to 'sale_product'
            deleted_ids = []
            if "deleted_images" in data:
                try:
                    deleted_ids = [int(i.strip()) for i in data["deleted_images"].split(",") if i.strip().isdigit()]
                    SalesProductImage.objects.filter(id__in=deleted_ids, sale_product=product_instance).delete()
                except Exception as e:
                    print(f"Error deleting images: {str(e)}")

            # Handle uploaded images - maximum 5 images
            uploaded_images = request.FILES.getlist('images')
            
            # Check total images won't exceed 5 after upload
            existing_images_count = SalesProductImage.objects.filter(sale_product=product_instance).count()
            if existing_images_count - len(deleted_ids) + len(uploaded_images) > 5:
                return Response(
                    {'error': 'Total images cannot exceed 5. Please delete some images first.'}, 
                    status=400
                )

            if len(uploaded_images) > 5:
                return Response({'error': 'You can upload a maximum of 5 images at once.'}, status=400)

            for img in uploaded_images:
                SalesProductImage.objects.create(
                    sale_product=product_instance,  # changed from 'product' to 'sale_product'
                    images=img,
                    created_by=request.user
                )

            response_data = SalesProductSerializer(product_instance).data
            response_data.update({
                'message': 'Sales Product updated successfully',
                'images_uploaded': len(uploaded_images),
                'images_deleted': len(deleted_ids),
                'total_images': SalesProductImage.objects.filter(sale_product=product_instance).count()
            })

            return Response({"data": response_data}, status=200)

        except Exception as e:
            print(f"\n!!! ERROR in update_salesproduct: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=500)
    
    @permission_required(['delete_sales_product'])
    def delete(self, request):
        return super().delete_(request)


class PublicSalesProductView(BaseView):
    """Public sales product listing - BaseView handles it"""
    permission_classes = ()
    serializer_class = SalesProductSerializer
    filterset_class = PublicSalesProductFilter
    
    def get(self, request):
        return super().get_(request)


class SalesProductDropdownView(BaseView):
    """Sales product dropdown - BaseView handles it"""
    permission_classes = (IsAuthenticated,)
    serializer_class = SalesProductSerializer
    filterset_class = SalesProductDropdownFilter
    
    def get(self, request):
        return super().get_(request)


# ============================================================================
# CATEGORY VIEWS
# ============================================================================

class CategoryView(BaseView):
    """Admin category management - full BaseView CRUD"""
    permission_classes = (IsAuthenticated,)
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    
    @permission_required(['create_category'])
    def post(self, request):
        return super().post_(request)
    
    @permission_required(['read_category'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_category'])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required(['delete_category'])
    def delete(self, request):
        return super().delete_(request)


class PublicCategoryView(BaseView):
    """Public category listing - BaseView handles it"""
    permission_classes = ()
    serializer_class = CategorySerializer
    filterset_class = PublicCategoryFilter
    
    def get(self, request):
        return super().get_(request)


class PublicCategoryDetailView(BaseView):
    """
    Public category detail - CUSTOM: Uses URL pk parameter
    This is different from BaseView's ?id=N pattern
    """
    permission_classes = ()
    serializer_class = CategorySerializer
    filterset_class = PublicCategoryFilter
    
    def get(self, request, pk=None):
        """CUSTOM: Handle pk from URL"""
        if pk is not None:
            instance = self.serializer_class.Meta.model.objects.filter(
                pk=pk, deleted=False
            ).first()
            
            if not instance:
                return create_response(
                    {"error": "Category not found"},
                    "NOT_FOUND",
                    404
                )

            serialized_data = self.serializer_class(instance).data
            return create_response(serialized_data, SUCCESSFUL, 200)

        # List view - use BaseView
        return super().get_(request)


class CategoryDropdownView(BaseView):
    """Category dropdown - BaseView handles it"""
    permission_classes = (IsAuthenticated,)
    serializer_class = CategorySerializer
    filterset_class = CategoryDropdownFilter
    
    def get(self, request):
        return super().get_(request)


# ============================================================================
# PRODUCT TAG VIEWS
# ============================================================================

class ProductTagView(BaseView):
    """Product tag management - full BaseView CRUD"""
    permission_classes = (IsAuthenticated,)
    serializer_class = ProductTagSerializer
    filterset_class = ProductTagFilter
    
    def post(self, request):
        return super().post_(request)
    
    def get(self, request):
        return super().get_(request)
    
    def patch(self, request):
        return super().patch_(request)
    
    def delete(self, request):
        return super().delete_(request)


# ============================================================================
# ORDER VIEWS
# ============================================================================

class OrderView(BaseView):
    """Admin order management - full BaseView CRUD"""
    permission_classes = (IsAuthenticated,)
    serializer_class = OrderSerializer
    filterset_class = OrderFilter
    
    @permission_required(['create_order'])
    def post(self, request):
        return super().post_(request)
    
    @permission_required(['read_order'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_order'])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required(['delete_order'])
    def delete(self, request):
        return super().delete_(request)


class OrderSearchView(BaseView):
    """Order search - BaseView handles ?id=N and filters"""
    permission_classes = (IsAuthenticated,)
    serializer_class = OrderSerializer
    filterset_class = OrderSearchFilter
    
    def get(self, request):
        return super().get_(request)


class PublicOrderView(BaseView):
    """
    Public order creation - CUSTOM: Mixed order logic
    """
    permission_classes = ()
    serializer_class = OrderSerializer

    def _calculate_delivery_date(self):
        """Calculate delivery date based on current day"""
        today = date.today()
        if today.weekday() in [3, 4]:
            return today + timedelta(days=4)
        elif today.weekday() == 5:
            return today + timedelta(days=3)
        return today + timedelta(days=2)

    def _get_product_price(self, product_type, product_id):
        """Get price based on product type"""
        if product_type == 'product':
            product = Product.objects.get(id=product_id, deleted=False)
            return product.price, product
        elif product_type == 'sales_product':
            sales_product = SalesProduct.objects.get(id=product_id, deleted=False)
            return sales_product.final_price, sales_product
        else:
            raise ValueError(f"Invalid product type: {product_type}")

    def post(self, request):
        """CUSTOM: Handle mixed orders, simple orders use BaseView"""
        if 'items' in request.data and any(item.get('product_type') for item in request.data.get('items', [])):
            return self._create_mixed_order(request)
        
        # Simple order - use BaseView
        return super().post_(request)
    
    def _create_mixed_order(self, request):
        """Custom order creation logic"""
        try:
            personal_info = {
                'customer_name': request.data.get('customer_name'),
                'customer_email': request.data.get('customer_email'),
                'customer_phone': request.data.get('customer_phone'),
                'delivery_address': request.data.get('delivery_address'),
                'city': request.data.get('city'), 
                'payment_method': request.data.get('payment_method'),
            }
            items = request.data.get('items', [])
            
            if not all(personal_info.values()) or not items:
                return create_response(
                    {"error": "Missing required fields"},
                    "BAD_REQUEST",
                    400
                )
            
            order_data = {
                **personal_info,
                'delivery_date': self._calculate_delivery_date(),
                'status': 'pending',
                'payment_status': False
            }
            
            serialized_data = self.serializer_class(data=order_data)
            if not serialized_data.is_valid():
                return create_response(
                    {"errors": serialized_data.errors}, 
                    get_first_error_message(serialized_data.errors, UNSUCCESSFUL),
                    400
                )
            
            with transaction.atomic():
                order = serialized_data.save()
                bill = 0
                order_items = []
                
                for item in items:
                    product_type = item.get('product_type')
                    product_id = item.get('product_id')
                    quantity = item.get('quantity', 1)
                    
                    try:
                        unit_price, product = self._get_product_price(product_type, product_id)
                        total_price = unit_price * quantity
                        
                        order_detail_data = {
                            'order': order,
                            'unit_price': unit_price,
                            'quantity': quantity,
                            'total_price': total_price
                        }
                        
                        if product_type == 'product':
                            order_detail_data['product'] = product
                        else:
                            order_detail_data['sales_product'] = product
                        
                        OrderDetail.objects.create(**order_detail_data)
                        
                        bill += total_price
                        order_items.append({
                            'product_type': product_type,
                            'product_id': product.id,
                            'product_name': product.name,
                            'quantity': quantity,
                            'unit_price': float(unit_price),
                            'total_price': float(total_price),
                            'is_discounted': getattr(product, 'has_discount', False)
                        })
                        
                    except (Product.DoesNotExist, SalesProduct.DoesNotExist):
                        raise ValueError(f"{product_type.title()} with id {product_id} not found")
                
                order.bill = bill
                order.save()

                response_data = {
                    'order_id': order.id,
                    'customer_info': {
                        'name': order.customer_name,
                        'email': order.customer_email,
                        'phone': order.customer_phone
                    },
                    'delivery_info': {
                        'address': order.delivery_address,
                        'city': order.city,
                        'estimated_date': order.delivery_date.strftime('%Y-%m-%d')
                    },
                    'order_summary': {
                        'items': order_items,
                        'subtotal': float(bill),
                        'total': float(bill)
                    },
                    'payment_method': order.payment_method,
                    'status': order.status
                }

                return create_response(response_data, SUCCESSFUL, 200)

        except ValueError as e:
            return create_response({"error": str(e)}, "BAD_REQUEST", 400)
        except Exception as e:
            logger.error(f"Order creation failed: {str(e)}", exc_info=True)
            return create_response({"error": "Failed to create order"}, UNSUCCESSFUL, 500)


# ============================================================================
# CONTACT VIEWS
# ============================================================================

class ContactView(BaseView):
    """Contact management - read & delete only"""
    permission_classes = (IsAuthenticated,)
    serializer_class = ContactSerializer
    filterset_class = ContactFilter
    
    @permission_required(['read_contact'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['delete_contact'])
    def delete(self, request):
        return super().delete_(request)


class PublicContactView(BaseView):
    """Public contact form - BaseView handles it"""
    permission_classes = ()
    serializer_class = ContactSerializer
    filterset_class = PublicContactFilter
    
    def post(self, request):
        return super().post_(request)
    
    def get(self, request):
        return super().get_(request)  # If needed


# ============================================================================
# REVIEW VIEWS
# ============================================================================

class ReviewView(BaseView):
    """
    Review management - CUSTOM: Ownership checks
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = ReviewSerializer
    filterset_class = ReviewFilter

    def post(self, request):
        """CUSTOM: Product validation"""
        try:
            product_id = request.data.get('product')
            sales_product_id = request.data.get('sales_product')

            if not product_id and not sales_product_id:
                return Response({
                    'status': 'ERROR',
                    'message': 'Either product or sales_product ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            if product_id:
                get_object_or_404(Product, id=product_id, deleted=False)
            if sales_product_id:
                get_object_or_404(SalesProduct, id=sales_product_id, deleted=False)

            if request.user.is_authenticated:
                request.data["user"] = request.user.id
            
            serializer = self.serializer_class(data=request.data, context={'request': request})
            if serializer.is_valid():
                review = serializer.save(created_by=request.user if request.user.is_authenticated else None)
                
                return Response({
                    'status': 'SUCCESS',
                    'message': 'Review created successfully',
                    'data': self.serializer_class(review, context={'request': request}).data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'status': 'ERROR',
                'message': get_first_error_message(serializer.errors, "Validation failed"),
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error creating review: {str(e)}", exc_info=True)
            return Response({
                'status': 'ERROR',
                'message': 'Failed to create review'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        """Use BaseView but with custom response format"""
        return super().get_(request)

    def patch(self, request):
        """CUSTOM: Ownership check"""
        try:
            if "id" not in request.data:
                return Response({
                    'status': 'ERROR',
                    'message': 'Review ID not provided'
                }, status=status.HTTP_400_BAD_REQUEST)

            instance = Review.objects.filter(id=request.data["id"], deleted=False).first()
            if not instance:
                return Response({
                    'status': 'ERROR',
                    'message': 'Review not found'
                }, status=status.HTTP_404_NOT_FOUND)

            if request.user.is_authenticated and instance.user and instance.user != request.user:
                return Response({
                    'status': 'ERROR',
                    'message': 'You can only update your own reviews'
                }, status=status.HTTP_403_FORBIDDEN)

            data = request.data.copy()
            data.pop('product', None)
            data.pop('sales_product', None)
            
            serializer = self.serializer_class(
                instance,
                data=data,
                partial=True,
                context={'request': request}
            )
            
            if serializer.is_valid():
                updated_review = serializer.save(updated_by=request.user if request.user.is_authenticated else None)
                return Response({
                    'status': 'SUCCESS',
                    'message': 'Review updated successfully',
                    'data': self.serializer_class(updated_review, context={'request': request}).data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'status': 'ERROR',
                'message': get_first_error_message(serializer.errors, "Validation failed"),
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error updating review: {str(e)}", exc_info=True)
            return Response({
                'status': 'ERROR',
                'message': 'Failed to update review'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        """CUSTOM: Ownership check"""
        try:
            review_id = request.query_params.get('id')
            if not review_id:
                return Response({
                    'status': 'ERROR',
                    'message': 'Review ID not provided'
                }, status=status.HTTP_400_BAD_REQUEST)

            instance = Review.objects.filter(id=review_id, deleted=False).first()
            if not instance:
                return Response({
                    'status': 'ERROR',
                    'message': 'Review not found'
                }, status=status.HTTP_404_NOT_FOUND)

            if request.user.is_authenticated and instance.user and instance.user != request.user:
                return Response({
                    'status': 'ERROR',
                    'message': 'You can only delete your own reviews'
                }, status=status.HTTP_403_FORBIDDEN)

            instance.deleted = True
            instance.updated_by = request.user if request.user.is_authenticated else None
            instance.save()
            
            return Response({
                'status': 'SUCCESS',
                'message': 'Review deleted successfully',
                'data': {'id': review_id}
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error deleting review: {str(e)}", exc_info=True)
            return Response({
                'status': 'ERROR',
                'message': 'Failed to delete review'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicReviewView(BaseView):
    """
    Public review - CUSTOM: Different query params
    """
    permission_classes = ()
    serializer_class = PublicReviewSerializer
    filterset_class = PublicReviewFilter

    def post(self, request):
        """CUSTOM: Guest review handling"""
        try:
            product_id = request.data.get('product')
            sales_product_id = request.data.get('sales_product')

            if not product_id and not sales_product_id:
                return Response({
                    'status': 'ERROR',
                    'message': 'Either product or sales_product ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            if product_id:
                get_object_or_404(Product, id=product_id, deleted=False)
            if sales_product_id:
                get_object_or_404(SalesProduct, id=sales_product_id, deleted=False)

            serializer = ReviewSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                review = serializer.save()

                return Response({
                    'status': 'SUCCESS',
                    'message': 'Review created successfully',
                    'data': {
                        'id': review.id,
                        'name': review.name,
                        'comment': review.comment,
                        'rating': review.rating,
                        'created_at': review.created_at
                    }
                }, status=status.HTTP_201_CREATED)

            return Response({
                'status': 'ERROR',
                'message': get_first_error_message(serializer.errors, "Validation failed"),
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error creating public review: {str(e)}", exc_info=True)
            return Response({
                'status': 'ERROR',
                'message': 'Failed to create review'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        """CUSTOM: Uses ?product_id= instead of ?id="""
        try:
            product_id = request.GET.get('product_id') or request.GET.get('product')
            sales_product_id = request.GET.get('sales_product_id') or request.GET.get('sales_product')

            if not product_id and not sales_product_id:
                return Response({
                    'status': 'ERROR',
                    'message': 'Either product_id or sales_product_id is required',
                }, status=status.HTTP_400_BAD_REQUEST)

            query = Q(deleted=False)
            if product_id:
                query &= Q(product_id=product_id)
            if sales_product_id:
                query &= Q(sales_product_id=sales_product_id)

            instances = Review.objects.filter(query).order_by('-created_at')

            if not instances.exists():
                return Response({
                    'status': 'SUCCESS',
                    'message': 'No reviews found',
                    'data': []
                }, status=status.HTTP_200_OK)

            filtered_data = self.filterset_class(request.GET, queryset=instances)
            data = filtered_data.qs

            paginated_data, count = paginate_data(data, request)
            serialized_data = self.serializer_class(paginated_data, many=True).data

            return Response({
                'status': 'SUCCESS',
                'message': 'Reviews retrieved successfully',
                'data': {
                    'count': count,
                    'reviews': serialized_data
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error retrieving public reviews: {str(e)}", exc_info=True)
            return Response({
                'status': 'ERROR',
                'message': 'Failed to retrieve reviews'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# SEARCH VIEWS
# ============================================================================

class CategorySearchView(BaseView):
    """
    Category search - CUSTOM: Uses ?q= parameter
    """
    permission_classes = ()
    serializer_class = CategorySerializer
    filterset_class = PublicCategoryFilter

    def get(self, request):
        """CUSTOM: Search with ?q= parameter"""
        search_query = request.GET.get('q', '').strip()
    
        if not search_query:
            return create_response(
                {"message": "Search query is empty"},
                "EMPTY_QUERY",
                200
            )
        
        try:
            categories = Category.objects.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query),
                deleted=False
            ).order_by('-created_at').distinct()

            paginated_data, count = paginate_data(categories, request)
            category_data = self.serializer_class(
                paginated_data, 
                many=True, 
                context={'request': request}
            ).data
            
            results = {
                'categories': category_data,
                'search_meta': {
                    'query': search_query,
                    'category_count': count,
                }
            }
            
            return create_response(results, SUCCESSFUL, 200)
            
        except Exception as e:
            logger.error(f"Error in category search: {str(e)}", exc_info=True)
            return create_response({"error": "Search failed"}, UNSUCCESSFUL, 500)