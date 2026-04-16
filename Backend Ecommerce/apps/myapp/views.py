# """
# E-commerce Views - FINAL ULTRA-SIMPLIFIED VERSION
# Only custom logic where BaseView methods are insufficient
# Everything else uses BaseView directly - NO DUPLICATION
# """

# import logging
# from datetime import date, timedelta
# import traceback

# from django.db import transaction
# from django.db.models import Q
# from django.shortcuts import get_object_or_404

# from rest_framework import status
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated

# from apps.users.models import User
# from utils.decorator import permission_required
# from utils.base_api import BaseView
# from utils.helpers import create_response, get_first_error, paginate_data, get_first_error_message
# from utils.response_messages import ID_NOT_PROVIDED, NOT_FOUND, SUCCESSFUL, UNSUCCESSFUL

# from .models import (
#     Category, Product, ProductImage, ProductTag, Color, ProductVariant,
#     Inventory, SalesProduct, Order, OrderDetail, Contact, Review, SalesProductImage
# )

# from .serializers import (
#     DropDownListProductSerializer, DropDownListSalesProductSerializer, ProductSerializer, ColorSerializer, ProductVariantSerializer,
#     InventorySerializer, PubliccategorywiseSerializer, SalesProductSerializer, CategorySerializer,
#     ProductTagSerializer, OrderSerializer, ContactSerializer,
#     ReviewSerializer, PublicReviewSerializer
# )

# from .filters import (
#     DropDownListProductFilter, DropDownListSalesProductFilter, ProductFilter, PublicProductFilter, ProductDropdownFilter,
#     ColorFilter, ProductVariantFilter, PublicProductVariantFilter,
#     InventoryFilter, PubliccategorywiseFilter, SalesProductFilter, PublicSalesProductFilter,
#     SalesProductDropdownFilter, CategoryFilter, PublicCategoryFilter,
#     CategoryDropdownFilter, ProductTagFilter, OrderFilter,
#     OrderSearchFilter, ContactFilter, PublicContactFilter,
#     ReviewFilter, PublicReviewFilter
# )

# logger = logging.getLogger(__name__)


# # ============================================================================
# # PRODUCT VIEWS - All use BaseView methods
# # ============================================================================

# class ProductView(BaseView):
#     """Admin product management - full BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ProductSerializer
#     filterset_class = ProductFilter
    
#     # In your ProductView class, modify the post method:

#     @permission_required(['create_product'])
#     def post(self, request):
#         try:
#             # Attach created_by user
#             data = request.data.copy()
#             data["created_by"] = request.user.id  # use guid if needed

#             # Validate and save product
#             serializer = ProductSerializer(data=data)
#             if serializer.is_valid():
#                 product = serializer.save()

#                 # Handle MULTIPLE image uploads
#                 images = request.FILES.getlist('images')
#                 if len(images) > 5:
#                     return Response({'error': 'You can upload a maximum of 5 images.'}, status=400)
                
#                 # Check if at least one image is provided
#                 if len(images) == 0:
#                     return Response({'error': 'At least one image is required.'}, status=400)

#                 for img in images:
#                     ProductImage.objects.create(product=product, images=img)

#                 response_data = ProductSerializer(product).data
#                 return Response({'data': response_data}, status=201)
#             else:
#                 error_message = get_first_error_message(serializer.errors, "UNSUCCESSFUL")
#                 return Response({'error': error_message}, status=400)

#         except Exception as e:
#             return Response({'error': str(e)}, status=500)
    
    
#     @permission_required(['read_product'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['update_product'])
#     def patch(self, request):
#         try:
#             data = request.data.copy()

#             # Validate required fields
#             if "id" not in data:
#                 return Response({"data": "ID NOT PROVIDED"}, status=400)

#             product = Product.objects.filter(id=data["id"]).first()
#             if not product:
#                 return Response({"data": "NOT FOUND"}, status=404)

#             # Add updated_by info
#             data["updated_by"] = request.user.id

#             # Update product
#             serializer = ProductSerializer(product, data=data, partial=True)
#             if not serializer.is_valid():
#                 error_message = get_first_error_message(serializer.errors, "UNSUCCESSFUL")
#                 return Response({'data': error_message}, status=400)

#             product_instance = serializer.save()

#             # Handle deleted images
#             deleted_ids = []
#             if "deleted_images" in data:
#                 try:
#                     deleted_ids = [int(i.strip()) for i in data["deleted_images"].split(",") if i.strip().isdigit()]
#                     ProductImage.objects.filter(id__in=deleted_ids, product=product_instance).delete()
#                 except Exception as e:
#                     print(f"Error deleting images: {str(e)}")

#             # Handle uploaded images - THIS IS CORRECT FOR MULTIPLE IMAGES
#             uploaded_images = request.FILES.getlist('images')  # This should get all images
#             if len(uploaded_images) > 6:
#                 return Response({'error': 'You can upload a maximum of 5 images.'}, status=400)

#             for img in uploaded_images:
#                 ProductImage.objects.create(product=product_instance, images=img, created_by=request.user)

#             response_data = ProductSerializer(product_instance).data
#             response_data.update({
#                 'message': 'Product updated successfully',
#                 'images_uploaded': len(uploaded_images),
#                 'images_deleted': len(deleted_ids),
#                 'total_images': ProductImage.objects.filter(product=product_instance).count()
#             })

#             return Response({"data": response_data}, status=200)

#         except Exception as e:
#             print(f"\n!!! ERROR in update_product: {str(e)}")
#             print(traceback.format_exc())
#             return Response({'error': str(e)}, status=500)
    
#     @permission_required(['delete_product'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicProductView(BaseView):
#     """Public product listing - BaseView handles everything"""
#     permission_classes = ()
#     serializer_class = ProductSerializer
#     filterset_class = PublicProductFilter
    
#     def get(self, request):
#         return super().get_(request)


# class ProductDropdownView(BaseView):
#     """Product dropdown - BaseView handles it"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ProductSerializer
#     filterset_class = ProductDropdownFilter
    
#     def get(self, request):
#         return super().get_(request)


# # ============================================================================
# # COLOR VIEWS
# # ============================================================================

# class ColorView(BaseView):
#     """Color management - full BaseView CRUD"""
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
#     """Product variant management - full BaseView CRUD"""
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
#     """Public variants - only active (uses BaseView extra_filters)"""
#     permission_classes = ()
#     serializer_class = ProductVariantSerializer
#     filterset_class = PublicProductVariantFilter
#     extra_filters = {'is_active': True}  # BaseView supports this!
    
#     def get(self, request):
#         return super().get_(request)


# # ============================================================================
# # INVENTORY VIEWS
# # ============================================================================

# class InventoryView(BaseView):
#     """Inventory management - full BaseView CRUD"""
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
#     """Admin sales product management - full BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = SalesProductSerializer
#     filterset_class = SalesProductFilter
    
#     @permission_required(['create_sales_product'])
#     def post(self, request):
#         try:
#             if 'original_price' not in request.data:
#                 return Response({"error": "original_price field is required"}, status=400)

#             data = request.data.copy()
            
#             # Validate category if provided
#             # category_id = data.get('salesprod_has_category')
#             # if category_id:
#             #     try:
#             #         category = Category.objects.get(id=category_id, deleted=False)
#             #         data['salesprod_has_category'] = category.id
#             #     except Category.DoesNotExist:
#             #         return Response(
#             #             {"error": f"Category with ID {category_id} not found or deleted"}, 
#             #             status=400
#             #         )

#             serializer = SalesProductSerializer(data=data)
#             if not serializer.is_valid():
#                 return Response({"error": "Validation failed", "details": serializer.errors}, status=400)

#             product = serializer.save(created_by=request.user)

#             images = request.FILES.getlist('images')
#             if len(images) > 5:
#                 return Response({'error': 'You can upload a maximum of 5 images.'}, status=400)

#             for img in images:
#                 SalesProductImage.objects.create(
#                     sale_product=product,
#                     images=img,
#                     created_by=request.user
#                 )

#             response_data = SalesProductSerializer(product).data
#             return Response({"success": True, "data": response_data}, status=201)

#         except Exception as e:
#             return Response({"error": str(e)}, status=500)
    
#     @permission_required(['read_sales_product'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['update_sales_product'])
#     def patch(self, request):
#         try:
#             # ID must come from query params (BaseView standard)
#             product_id = request.query_params.get('id')
#             if not product_id:
#                 return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)

#             product = SalesProduct.objects.filter(deleted=False, id=product_id).first()
#             if not product:
#                 return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)

#             data = request.data.copy()
            
#             # Handle category update
#             # category_id = data.get('salesprod_has_category')
#             # if category_id:
#             #     try:
#             #         category = Category.objects.get(id=category_id, deleted=False)
#             #         data['salesprod_has_category'] = category.id
#             #     except Category.DoesNotExist:
#             #         return Response(
#             #             create_response(f"Category with ID {category_id} not found or deleted"),
#             #             status=status.HTTP_400_BAD_REQUEST
#             #         )
#             # elif 'salesprod_has_category' in data and data['salesprod_has_category'] in [None, 'null', '']:
#             #     # Allow removing category by sending null
#             #     data['salesprod_has_category'] = None

#             serializer = SalesProductSerializer(
#                 product,
#                 data=data,
#                 partial=True,
#                 context={'request': request, 'id': product.id}
#             )

#             if not serializer.is_valid():
#                 return Response(
#                     create_response(get_first_error(serializer.errors)),
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             product_instance = serializer.save(updated_by=request.user)

#             # ---------- Handle New Images ----------
#             uploaded_images = request.FILES.getlist('images')
            
#             # ---------- Handle Deleted Images ----------
#             deleted_ids = []
#             if request.data.get("deleted_images"):
#                 deleted_ids = [int(i) for i in request.data["deleted_images"].split(",") if i.strip().isdigit()]
            
#             # **FIX: Count existing images BEFORE deletion, then validate**
#             existing_count = SalesProductImage.objects.filter(sale_product=product_instance).count()
#             final_count = existing_count - len(deleted_ids) + len(uploaded_images)
            
#             if final_count > 5:
#                 return Response(
#                     create_response(f"Total images cannot exceed 5. Current: {existing_count}, Deleting: {len(deleted_ids)}, Adding: {len(uploaded_images)}, Result: {final_count}"),
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Now perform the actual deletion
#             if deleted_ids:
#                 SalesProductImage.objects.filter(id__in=deleted_ids, sale_product=product_instance).delete()

#             # Add new images
#             for img in uploaded_images:
#                 SalesProductImage.objects.create(
#                     sale_product=product_instance,
#                     images=img,
#                     created_by=request.user
#                 )

#             response_data = SalesProductSerializer(product_instance, context={'request': request}).data
#             response_data.update({
#                 'message': 'Sales Product updated successfully',
#                 'images_uploaded': len(uploaded_images),
#                 'images_deleted': len(deleted_ids),
#                 'total_images': SalesProductImage.objects.filter(sale_product=product_instance).count()
#             })

#             return Response(create_response(SUCCESSFUL, response_data), status=status.HTTP_200_OK)

#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @permission_required(['delete_sales_product'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicSalesProductView(BaseView):
#     """Public sales product listing - BaseView handles it"""
#     permission_classes = ()
#     serializer_class = SalesProductSerializer
#     filterset_class = PublicSalesProductFilter
    
#     def get(self, request):
#         return super().get_(request)


# class SalesProductDropdownView(BaseView):
#     """Sales product dropdown - BaseView handles it"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = SalesProductSerializer
#     filterset_class = SalesProductDropdownFilter
    
#     def get(self, request):
#         return super().get_(request)


# # ============================================================================
# # CATEGORY VIEWS
# # ============================================================================

# class CategoryView(BaseView):
#     """Admin category management - full BaseView CRUD"""
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
#     """Public category listing - BaseView handles it"""
#     permission_classes = ()
#     serializer_class = CategorySerializer
#     filterset_class = PublicCategoryFilter
    
#     def get(self, request):
#         return super().get_(request)


# class PublicCategoryDetailView(BaseView):
#     """
#     Public category detail - CUSTOM: Uses URL pk parameter
#     This is different from BaseView's ?id=N pattern
#     """
#     permission_classes = ()
#     serializer_class = CategorySerializer
#     filterset_class = PublicCategoryFilter
    
#     def get(self, request, pk=None):
#         """CUSTOM: Handle pk from URL"""
#         if pk is not None:
#             instance = self.serializer_class.Meta.model.objects.filter(
#                 pk=pk, deleted=False
#             ).first()
            
#             if not instance:
#                 return create_response(
#                     {"error": "Category not found"},
#                     "NOT_FOUND",
#                     404
#                 )

#             serialized_data = self.serializer_class(instance).data
#             return create_response(serialized_data, SUCCESSFUL, 200)

#         # List view - use BaseView
#         return super().get_(request)


# class CategoryDropdownView(BaseView):
#     """Category dropdown - BaseView handles it"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = CategorySerializer
#     filterset_class = CategoryDropdownFilter
    
#     def get(self, request):
#         return super().get_(request)


# # ============================================================================
# # PRODUCT TAG VIEWS
# # ============================================================================

# class ProductTagView(BaseView):
#     """Product tag management - full BaseView CRUD"""
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

# # class OrderView(BaseView):
# #     """Admin order management - full BaseView CRUD"""
# #     permission_classes = (IsAuthenticated,)
# #     serializer_class = OrderSerializer
# #     filterset_class = OrderFilter
    
# #     @permission_required(['create_order'])
# #     def post(self, request):
# #         return super().post_(request)
    
# #     @permission_required(['read_order'])
# #     def get(self, request):
# #         return super().get_(request)
    
# #     @permission_required(['update_order'])
# #     def patch(self, request):
# #         return super().patch_(request)
    
# #     @permission_required(['delete_order'])
# #     def delete(self, request):
# #         return super().delete_(request)



# import logging
# from django.db import transaction

# logger = logging.getLogger(__name__)


# class OrderView(BaseView):
#     """Admin order management - full BaseView CRUD"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = OrderSerializer
#     filterset_class = OrderFilter
    
#     def _calculate_delivery_date(self):
#         """Calculate delivery date based on current day"""
#         today = date.today()
#         if today.weekday() in [3, 4]:  # Thursday, Friday
#             return today + timedelta(days=4)
#         elif today.weekday() == 5:  # Saturday
#             return today + timedelta(days=3)
#         return today + timedelta(days=2)

#     def _get_product_price(self, product_type, product_id):
#         """Get price based on product type"""
#         if product_type == 'product':
#             product = Product.objects.get(id=product_id, deleted=False)
#             return product.price, product
#         elif product_type == 'sales_product':
#             sales_product = SalesProduct.objects.get(id=product_id, deleted=False)
#             return sales_product.final_price, sales_product
#         else:
#             raise ValueError(f"Invalid product type: {product_type}")
    
#     @permission_required(['create_order'])
#     def post(self, request):
#         """
#         Create order - Admin version with mixed order support
#         Supports both simple orders and orders with mixed product types
#         """
#         # Check if this is a mixed order (has items with product_type)
#         if 'items' in request.data and any(item.get('product_type') for item in request.data.get('items', [])):
#             return self._create_mixed_order(request)
        
#         # Simple order - use BaseView
#         return super().post_(request)
    
#     def _create_mixed_order(self, request):
#         """
#         Create order with mixed product types (products and sales_products)
#         Admin can optionally assign customer and rider
#         """
#         try:
#             # Extract order information
#             personal_info = {
#                 'customer_name': request.data.get('customer_name'),
#                 'customer_email': request.data.get('customer_email'),
#                 'customer_phone': request.data.get('customer_phone'),
#                 'delivery_address': request.data.get('delivery_address'),
#                 'city': request.data.get('city'),
#                 'payment_method': request.data.get('payment_method'),
#             }
            
#             # Optional fields for admin
#             customer_id = request.data.get('customer')  # Optional: Link to customer account
#             rider_id = request.data.get('rider')  # Optional: Assign rider
#             delivery_date = request.data.get('delivery_date')  # Optional: Custom delivery date
#             order_status = request.data.get('status', 'pending')  # Optional: Custom status
#             payment_status = request.data.get('payment_status', False)  # Optional: Payment status
            
#             items = request.data.get('items', [])
            
#             # Validate required fields
#             if not all(personal_info.values()) or not items:
#                 return Response(
#                     {
#                         "error": "Missing required fields",
#                         "message": "Please provide all customer information and at least one item"
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Prepare order data
#             order_data = {
#                 **personal_info,
#                 'delivery_date': delivery_date if delivery_date else self._calculate_delivery_date(),
#                 'status': order_status,
#                 'payment_status': payment_status
#             }
            
#             # Add optional customer and rider if provided
#             if customer_id:
#                 try:
#                     customer = User.objects.get(id=customer_id, deleted=False)
#                     order_data['customer'] = customer.id
#                 except User.DoesNotExist:
#                     return Response(
#                         {
#                             "error": "Invalid customer",
#                             "message": f"Customer with id {customer_id} not found"
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             if rider_id:
#                 try:
#                     rider = User.objects.get(id=rider_id, deleted=False)
#                     order_data['rider'] = rider.id
#                 except User.DoesNotExist:
#                     return Response(
#                         {
#                             "error": "Invalid rider",
#                             "message": f"Rider with id {rider_id} not found"
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             # Validate order data
#             serialized_data = self.serializer_class(data=order_data)
#             if not serialized_data.is_valid():
#                 return Response(
#                     {
#                         "error": "Validation failed",
#                         "details": serialized_data.errors
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Create order and order details in transaction
#             with transaction.atomic():
#                 order = serialized_data.save()
#                 bill = 0
#                 order_items = []
                
#                 for item in items:
#                     product_type = item.get('product_type')
#                     product_id = item.get('product_id')
#                     quantity = item.get('quantity', 1)
                    
#                     # Validate item data
#                     if not product_type or not product_id:
#                         raise ValueError("Each item must have product_type and product_id")
                    
#                     if quantity < 1:
#                         raise ValueError(f"Invalid quantity {quantity} for item")
                    
#                     try:
#                         unit_price, product = self._get_product_price(product_type, product_id)
#                         total_price = unit_price * quantity
                        
#                         order_detail_data = {
#                             'order': order,
#                             'unit_price': unit_price,
#                             'quantity': quantity,
#                             'total_price': total_price
#                         }
                        
#                         if product_type == 'product':
#                             order_detail_data['product'] = product
#                         else:
#                             order_detail_data['sales_product'] = product
                        
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
                        
#                     except Product.DoesNotExist:
#                         raise ValueError(f"Product with id {product_id} not found")
#                     except SalesProduct.DoesNotExist:
#                         raise ValueError(f"Sales product with id {product_id} not found")
                
#                 # Update order with total bill
#                 order.bill = bill
#                 order.save()

#                 # Prepare response
#                 response_data = {
#                     'success': True,
#                     'message': 'Order created successfully',
#                     'order_id': order.id,
#                     'customer_info': {
#                         'id': order.customer.id if order.customer else None,
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
#                         'items_count': len(order_items),
#                         'subtotal': float(bill),
#                         'total': float(bill)
#                     },
#                     'payment_method': order.payment_method,
#                     'payment_status': order.payment_status,
#                     'status': order.status,
#                     'rider': {
#                         'id': order.rider.id if order.rider else None,
#                         'name': order.rider.get_full_name() if order.rider else None
#                     }
#                 }

#                 return Response(response_data, status=status.HTTP_201_CREATED)

#         except ValueError as e:
#             return Response(
#                 {
#                     "error": "Validation error",
#                     "message": str(e)
#                 },
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"Order creation failed: {str(e)}", exc_info=True)
#             return Response(
#                 {
#                     "error": "Internal server error",
#                     "message": "Failed to create order. Please try again later."
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     @permission_required(['read_order'])
#     def get(self, request):
#         return super().get_(request)
    
#     @permission_required(['update_order'])
#     def patch(self, request):
#         """
#         Update order - Admin version with mixed order support
#         Can update order info, items, customer, rider, status, etc.
#         """
#         order_id = request.query_params.get('id') or request.data.get('id')
        
#         if not order_id:
#             return Response(
#                 {
#                     "error": "Missing order ID",
#                     "message": "Please provide order ID to update"
#                 },
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             order = Order.objects.get(id=order_id, deleted=False)
#         except Order.DoesNotExist:
#             return Response(
#                 {
#                     "error": "Order not found",
#                     "message": f"Order with id {order_id} does not exist"
#                 },
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         # Check if this is an item update (has items array)
#         if 'items' in request.data:
#             return self._update_order_with_items(request, order)
        
#         # Simple field update - use BaseView
#         return super().patch_(request)
    
#     def _update_order_with_items(self, request, order):
#         """
#         Update order including order items
#         Recalculates bill based on new items
#         """
#         try:
#             update_data = {}
            
#             # Update customer information if provided
#             if 'customer_name' in request.data:
#                 update_data['customer_name'] = request.data['customer_name']
#             if 'customer_email' in request.data:
#                 update_data['customer_email'] = request.data['customer_email']
#             if 'customer_phone' in request.data:
#                 update_data['customer_phone'] = request.data['customer_phone']
#             if 'delivery_address' in request.data:
#                 update_data['delivery_address'] = request.data['delivery_address']
#             if 'city' in request.data:
#                 update_data['city'] = request.data['city']
#             if 'payment_method' in request.data:
#                 update_data['payment_method'] = request.data['payment_method']
#             if 'delivery_date' in request.data:
#                 update_data['delivery_date'] = request.data['delivery_date']
#             if 'status' in request.data:
#                 update_data['status'] = request.data['status']
#             if 'payment_status' in request.data:
#                 update_data['payment_status'] = request.data['payment_status']
            
#             # Handle customer assignment
#             if 'customer' in request.data:
#                 customer_id = request.data['customer']
#                 if customer_id:
#                     try:
#                         customer = User.objects.get(id=customer_id, deleted=False)
#                         update_data['customer'] = customer.id
#                     except User.DoesNotExist:
#                         return Response(
#                             {
#                                 "error": "Invalid customer",
#                                 "message": f"Customer with id {customer_id} not found"
#                             },
#                             status=status.HTTP_400_BAD_REQUEST
#                         )
#                 else:
#                     update_data['customer'] = None
            
#             # Handle rider assignment
#             if 'rider' in request.data:
#                 rider_id = request.data['rider']
#                 if rider_id:
#                     try:
#                         rider = User.objects.get(id=rider_id, deleted=False)
#                         update_data['rider'] = rider.id
#                     except User.DoesNotExist:
#                         return Response(
#                             {
#                                 "error": "Invalid rider",
#                                 "message": f"Rider with id {rider_id} not found"
#                             },
#                             status=status.HTTP_400_BAD_REQUEST
#                         )
#                 else:
#                     update_data['rider'] = None
            
#             # Validate update data
#             if update_data:
#                 serialized_data = self.serializer_class(order, data=update_data, partial=True)
#                 if not serialized_data.is_valid():
#                     return Response(
#                         {
#                             "error": "Validation failed",
#                             "details": serialized_data.errors
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             items = request.data.get('items', [])
            
#             # Update order and items in transaction
#             with transaction.atomic():
#                 # Update order fields
#                 if update_data:
#                     for key, value in update_data.items():
#                         setattr(order, key, value)
                
#                 # If items are provided, update order items
#                 if items:
#                     # Delete existing order details
#                     OrderDetail.objects.filter(order=order).update(deleted=True)
                    
#                     bill = 0
#                     order_items = []
                    
#                     for item in items:
#                         product_type = item.get('product_type')
#                         product_id = item.get('product_id')
#                         quantity = item.get('quantity', 1)
                        
#                         # Validate item data
#                         if not product_type or not product_id:
#                             raise ValueError("Each item must have product_type and product_id")
                        
#                         if quantity < 1:
#                             raise ValueError(f"Invalid quantity {quantity} for item")
                        
#                         try:
#                             unit_price, product = self._get_product_price(product_type, product_id)
#                             total_price = unit_price * quantity
                            
#                             order_detail_data = {
#                                 'order': order,
#                                 'unit_price': unit_price,
#                                 'quantity': quantity,
#                                 'total_price': total_price
#                             }
                            
#                             if product_type == 'product':
#                                 order_detail_data['product'] = product
#                             else:
#                                 order_detail_data['sales_product'] = product
                            
#                             OrderDetail.objects.create(**order_detail_data)
                            
#                             bill += total_price
#                             order_items.append({
#                                 'product_type': product_type,
#                                 'product_id': product.id,
#                                 'product_name': product.name,
#                                 'quantity': quantity,
#                                 'unit_price': float(unit_price),
#                                 'total_price': float(total_price),
#                                 'is_discounted': getattr(product, 'has_discount', False)
#                             })
                            
#                         except Product.DoesNotExist:
#                             raise ValueError(f"Product with id {product_id} not found")
#                         except SalesProduct.DoesNotExist:
#                             raise ValueError(f"Sales product with id {product_id} not found")
                    
#                     # Update order bill
#                     order.bill = bill
                
#                 order.save()
                
#                 # Prepare response
#                 response_data = {
#                     'success': True,
#                     'message': 'Order updated successfully',
#                     'order_id': order.id,
#                     'customer_info': {
#                         'id': order.customer.id if order.customer else None,
#                         'name': order.customer_name,
#                         'email': order.customer_email,
#                         'phone': order.customer_phone
#                     },
#                     'delivery_info': {
#                         'address': order.delivery_address,
#                         'city': order.city,
#                         'estimated_date': order.delivery_date.strftime('%Y-%m-%d')
#                     },
#                     'payment_method': order.payment_method,
#                     'payment_status': order.payment_status,
#                     'status': order.status,
#                     'rider': {
#                         'id': order.rider.id if order.rider else None,
#                         'name': order.rider.get_full_name() if order.rider else None
#                     },
#                     'bill': float(order.bill) if order.bill else 0
#                 }
                
#                 if items:
#                     response_data['order_summary'] = {
#                         'items': order_items,
#                         'items_count': len(order_items),
#                         'total': float(order.bill) if order.bill else 0
#                     }
                
#                 return Response(response_data, status=status.HTTP_200_OK)
        
#         except ValueError as e:
#             return Response(
#                 {
#                     "error": "Validation error",
#                     "message": str(e)
#                 },
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"Order update failed: {str(e)}", exc_info=True)
#             return Response(
#                 {
#                     "error": "Internal server error",
#                     "message": "Failed to update order. Please try again later."
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     @permission_required(['delete_order'])
#     def delete(self, request):
#         return super().delete_(request)
    
# class OrderSearchView(BaseView):
#     """Order search - BaseView handles ?id=N and filters"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = OrderSerializer
#     filterset_class = OrderSearchFilter
    
#     def get(self, request):
#         return super().get_(request)



# import logging

# logger = logging.getLogger(__name__)


# class PublicOrderView(BaseView):
#     """
#     Public order creation - CUSTOM: Mixed order logic
#     """
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
#         """Get price based on product type"""
#         if product_type == 'product':
#             product = Product.objects.get(id=product_id, deleted=False)
#             return product.price, product
#         elif product_type == 'sales_product':
#             sales_product = SalesProduct.objects.get(id=product_id, deleted=False)
#             return sales_product.final_price, sales_product
#         else:
#             raise ValueError(f"Invalid product type: {product_type}")

#     def post(self, request):
#         """CUSTOM: Handle mixed orders, simple orders use BaseView"""
#         if 'items' in request.data and any(item.get('product_type') for item in request.data.get('items', [])):
#             return self._create_mixed_order(request)
        
#         # Simple order - use BaseView (FIXED TYPO: was post_)
#         return super().post(request)
    
#     def _create_mixed_order(self, request):
#         """Custom order creation logic"""
#         try:
#             personal_info = {
#                 'customer_name': request.data.get('customer_name'),
#                 'customer_email': request.data.get('customer_email'),
#                 'customer_phone': request.data.get('customer_phone'),
#                 'delivery_address': request.data.get('delivery_address'),
#                 'city': request.data.get('city'), 
#                 'payment_method': request.data.get('payment_method'),
#             }
#             items = request.data.get('items', [])
            
#             # Validate required fields
#             if not all(personal_info.values()) or not items:
#                 return Response(
#                     {
#                         "error": "Missing required fields",
#                         "message": "Please provide all customer information and at least one item"
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             order_data = {
#                 **personal_info,
#                 'delivery_date': self._calculate_delivery_date(),
#                 'status': 'pending',
#                 'payment_status': False
#             }
            
#             # Validate order data
#             serialized_data = self.serializer_class(data=order_data)
#             if not serialized_data.is_valid():
#                 return Response(
#                     {
#                         "error": "Validation failed",
#                         "details": serialized_data.errors
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Create order and order details in transaction
#             with transaction.atomic():
#                 order = serialized_data.save()
#                 bill = 0
#                 order_items = []
                
#                 for item in items:
#                     product_type = item.get('product_type')
#                     product_id = item.get('product_id')
#                     quantity = item.get('quantity', 1)
                    
#                     # Validate item data
#                     if not product_type or not product_id:
#                         raise ValueError("Each item must have product_type and product_id")
                    
#                     if quantity < 1:
#                         raise ValueError(f"Invalid quantity {quantity} for item")
                    
#                     try:
#                         unit_price, product = self._get_product_price(product_type, product_id)
#                         total_price = unit_price * quantity
                        
#                         order_detail_data = {
#                             'order': order,
#                             'unit_price': unit_price,
#                             'quantity': quantity,
#                             'total_price': total_price
#                         }
                        
#                         if product_type == 'product':
#                             order_detail_data['product'] = product
#                         else:
#                             order_detail_data['sales_product'] = product
                        
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
                        
#                     except Product.DoesNotExist:
#                         raise ValueError(f"Product with id {product_id} not found")
#                     except SalesProduct.DoesNotExist:
#                         raise ValueError(f"Sales product with id {product_id} not found")
                
#                 # Update order with total bill
#                 order.bill = bill
#                 order.save()

#                 # Prepare response
#                 response_data = {
#                     'success': True,
#                     'message': 'Order created successfully',
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
#                         'items_count': len(order_items),
#                         'subtotal': float(bill),
#                         'total': float(bill)
#                     },
#                     'payment_method': order.payment_method,
#                     'payment_status': order.payment_status,
#                     'status': order.status
#                 }

#                 return Response(response_data, status=status.HTTP_201_CREATED)

#         except ValueError as e:
#             return Response(
#                 {
#                     "error": "Validation error",
#                     "message": str(e)
#                 },
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"Order creation failed: {str(e)}", exc_info=True)
#             return Response(
#                 {
#                     "error": "Internal server error",
#                     "message": "Failed to create order. Please try again later."
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# # ============================================================================
# # CONTACT VIEWS
# # ============================================================================

# class ContactView(BaseView):
#     """Contact management - read & delete only"""
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
#     """Public contact form - BaseView handles it"""
#     permission_classes = ()
#     serializer_class = ContactSerializer
#     filterset_class = PublicContactFilter
    
#     def post(self, request):
#         return super().post_(request)
    
#     def get(self, request):
#         return super().get_(request)  # If needed


# # ============================================================================
# # REVIEW VIEWS
# # ============================================================================

# class ReviewView(BaseView):
#     """
#     Review management - CUSTOM: Ownership checks
#     """
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ReviewSerializer
#     filterset_class = ReviewFilter

#     @permission_required(['create_reviews'])
#     def post(self, request):
#         """CUSTOM: Product validation"""
#         try:
#             product_id = request.data.get('product')
#             sales_product_id = request.data.get('sales_product')

#             if not product_id and not sales_product_id:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Either product or sales_product ID is required'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             if product_id:
#                 get_object_or_404(Product, id=product_id, deleted=False)
#             if sales_product_id:
#                 get_object_or_404(SalesProduct, id=sales_product_id, deleted=False)

#             if request.user.is_authenticated:
#                 request.data["user"] = request.user.id
            
#             serializer = self.serializer_class(data=request.data, context={'request': request})
#             if serializer.is_valid():
#                 review = serializer.save(created_by=request.user if request.user.is_authenticated else None)
                
#                 return Response({
#                     'status': 'SUCCESS',
#                     'message': 'Review created successfully',
#                     'data': self.serializer_class(review, context={'request': request}).data
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
#                 'message': 'Failed to create review'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
#     @permission_required(['read_reviews'])
#     def get(self, request):
#         """Use BaseView but with custom response format"""
#         return super().get_(request)
    
#     @permission_required(['update_reviews'])
#     def patch(self, request):
#         """CUSTOM: Ownership check"""
#         try:
#             # Get ID from query parameters
#             review_id = request.query_params.get('id')
            
#             if not review_id:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Review ID not provided in query parameters'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             instance = Review.objects.filter(id=review_id, deleted=False).first()
#             # ... rest of your code remains the same ...
#             if not instance:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Review not found'
#                 }, status=status.HTTP_404_NOT_FOUND)

#             if request.user.is_authenticated and instance.user and instance.user != request.user:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'You can only update your own reviews'
#                 }, status=status.HTTP_403_FORBIDDEN)

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
#                     'data': self.serializer_class(updated_review, context={'request': request}).data
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
        
#     @permission_required(['delete_reviews'])
#     def delete(self, request):
#         """CUSTOM: Ownership check"""
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

#             if request.user.is_authenticated and instance.user and instance.user != request.user:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'You can only delete your own reviews'
#                 }, status=status.HTTP_403_FORBIDDEN)

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
#     """
#     Public review - CUSTOM: Different query params
#     """
#     permission_classes = ()
#     serializer_class = PublicReviewSerializer
#     filterset_class = PublicReviewFilter

#     def post(self, request):
#         """CUSTOM: Guest review handling"""
#         try:
#             product_id = request.data.get('product')
#             sales_product_id = request.data.get('sales_product')

#             if not product_id and not sales_product_id:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Either product or sales_product ID is required'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             if product_id:
#                 get_object_or_404(Product, id=product_id, deleted=False)
#             if sales_product_id:
#                 get_object_or_404(SalesProduct, id=sales_product_id, deleted=False)

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

#     def get(self, request):
#         """CUSTOM: Uses ?product_id= instead of ?id="""
#         try:
#             product_id = request.GET.get('product_id') or request.GET.get('product')
#             sales_product_id = request.GET.get('sales_product_id') or request.GET.get('sales_product')

#             if not product_id and not sales_product_id:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Either product_id or sales_product_id is required',
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             query = Q(deleted=False)
#             if product_id:
#                 query &= Q(product_id=product_id)
#             if sales_product_id:
#                 query &= Q(sales_product_id=sales_product_id)

#             instances = Review.objects.filter(query).order_by('-created_at')

#             if not instances.exists():
#                 return Response({
#                     'status': 'SUCCESS',
#                     'message': 'No reviews found',
#                     'data': []
#                 }, status=status.HTTP_200_OK)

#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

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

#     def get_publicreview_by_id(self, request):
#         try:
#             # Get product or sales_product ID from query params
#             product_id = request.GET.get('product_id') or request.GET.get('product')
#             sales_product_id = request.GET.get('sales_product_id') or request.GET.get('sales_product')
#             review_id = request.GET.get('review_id')

#             # Validate at least one ID is provided
#             if not product_id and not sales_product_id and not review_id:
#                 return Response({
#                     'status': 'ERROR',
#                     'message': 'Either product_id, sales_product_id, or review_id is required',
#                     'data': None
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Build the base queryset
#             queryset = self.serializer_class.Meta.model.objects.all()

#             # Apply specific filters based on provided IDs
#             if review_id:
#                 queryset = queryset.filter(id=review_id)
#             else:
#                 query = Q()
#                 if product_id:
#                     query |= Q(product_id=product_id)
#                 if sales_product_id:
#                     query |= Q(sales_product_id=sales_product_id)
#                 queryset = queryset.filter(query)

#             if not queryset.exists():
#                 return Response({
#                     'status': 'SUCCESS',
#                     'message': 'No reviews found',
#                     'data': []
#                 }, status=status.HTTP_200_OK)

#             # Apply additional filters if filterset_class is defined
#             if hasattr(self, 'filterset_class') and self.filterset_class:
#                 queryset = self.filterset_class(request.GET, queryset=queryset).qs

#             # Paginate the results
#             paginated_data, count = paginate_data(queryset, request)

#             # Serialize the data
#             serializer = self.serializer_class(paginated_data, many=True)

#             # Format the response
#             response_data = {
#                 'status': 'SUCCESS',
#                 'message': 'Reviews retrieved successfully',
#                 'data': {
#                     'count': count,
#                     'reviews': serializer.data
#                 }
#             }

#             return Response(response_data, status=status.HTTP_200_OK)

#         except Exception as e:
#             import traceback
#             traceback.print_exc()
#             return Response({
#                 'status': 'ERROR',
#                 'message': 'Internal server error',
#                 'error': str(e),
#                 'data': None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# # ============================================================================
# # SEARCH VIEWS
# # ============================================================================

# class CategorySearchView(BaseView):
#     """
#     Category search - CUSTOM: Uses ?q= parameter
#     """
#     permission_classes = ()
#     serializer_class = CategorySerializer
#     filterset_class = PublicCategoryFilter

#     def get(self, request):
#         """CUSTOM: Search with ?q= parameter"""
#         search_query = request.GET.get('q', '').strip()
    
#         if not search_query:
#             return create_response(
#                 {"message": "Search query is empty"},
#                 "EMPTY_QUERY",
#                 200
#             )
        
#         try:
#             categories = Category.objects.filter(
#                 Q(name__icontains=search_query) |
#                 Q(description__icontains=search_query),
#                 deleted=False
#             ).order_by('-created_at').distinct()

#             paginated_data, count = paginate_data(categories, request)
#             category_data = self.serializer_class(
#                 paginated_data, 
#                 many=True, 
#                 context={'request': request}
#             ).data
            
#             results = {
#                 'categories': category_data,
#                 'search_meta': {
#                     'query': search_query,
#                     'category_count': count,
#                 }
#             }
            
#             return create_response(results, SUCCESSFUL, 200)
            
#         except Exception as e:
#             logger.error(f"Error in category search: {str(e)}", exc_info=True)
#             return create_response({"error": "Search failed"}, UNSUCCESSFUL, 500)
        

# class PubliccategorywiseView(BaseView):
#     permission_classes = ()
#     serializer_class = PubliccategorywiseSerializer
#     filterset_class = PubliccategorywiseFilter


#     def get(self, request, pk=None):
#         try:
#             if pk is not None:
#                 # Fetch single category by ID
#                 instance = self.serializer_class.Meta.model.objects.filter(pk=pk).first()
#                 if not instance:
#                     return Response({'error': 'Category not found'}, status=404)

#                 serialized_data = self.serializer_class(instance).data
#                 return create_response(serialized_data, "SUCCESSFUL", 200)

#             # Fetch all categories (paginated)
#             instances = self.serializer_class.Meta.model.objects.all()
#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

#             paginated_data, count = paginate_data(data, request)
#             serialized_data = self.serializer_class(paginated_data, many=True).data

#             response_data = {
#                 "count": count,
#                 "data": serialized_data,
#             }
#             return create_response(response_data, "SUCCESSFUL", 200)

#         except Exception as e:
#             import traceback
#             print("Error in get_publiccategory:", str(e))
#             traceback.print_exc()
#             return Response({'error': str(e)}, status=500)


    
# class DropDownListProductViews(BaseView):
#     """Contact management - read & delete only"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = DropDownListProductSerializer
#     filterset_class = DropDownListProductFilter
    
#     def get(self, request):
#         try:

#             instances = self.serializer_class.Meta.model.objects.all()

#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

#             paginated_data, count = paginate_data(data, request)

#             serialized_data = self.serializer_class(paginated_data, many=True).data
#             response_data = {
#                 "count": count,
#                 "data": serialized_data,
#             }
#             return create_response(response_data, "SUCCESSFUL", 200)
#         except Exception as e:
#             return Response({'error': str(e)}, 500)

    
# class DropDownListSalesProductView(BaseView):
#     """Contact management - read & delete only"""
#     permission_classes = (IsAuthenticated,)
#     serializer_class = DropDownListSalesProductSerializer
#     filterset_class = DropDownListSalesProductFilter
    
#     def get(self, request):
#         try:

#             instances = self.serializer_class.Meta.model.objects.all()

#             filtered_data = self.filterset_class(request.GET, queryset=instances)
#             data = filtered_data.qs

#             paginated_data, count = paginate_data(data, request)

#             serialized_data = self.serializer_class(paginated_data, many=True).data
#             response_data = {
#                 "count": count,
#                 "data": serialized_data,
#             }
#             return create_response(response_data, "SUCCESSFUL", 200)
#         except Exception as e:
#             return Response({'error': str(e)}, 500)







"""
E-commerce Views
All new views follow the same BaseView patterns already used in the project.
Existing views are untouched — new views for Address, ShippingMethod, Coupon,
Cart, Wishlist, Payment, and ReturnRequest are added below.
"""

import logging
from datetime import date, timedelta
import traceback

from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.users.models import User
from utils.decorator import permission_required
from utils.base_api import BaseView
from utils.helpers import create_response, get_first_error, paginate_data, get_first_error_message
from utils.response_messages import ID_NOT_PROVIDED, NOT_FOUND, SUCCESSFUL, UNSUCCESSFUL

from .models import (
    Category, Product, ProductImage, ProductTag, Color, ProductVariant,
    Inventory, SalesProduct, SalesProductImage, Order, OrderDetail,
    Contact, Review,
    Address, ShippingMethod, Coupon, Cart, CartItem,
    Wishlist, WishlistItem, Payment, ReturnRequest,
)
from .serializers import (
    DropDownListProductSerializer, DropDownListSalesProductSerializer,
    ProductSerializer, ColorSerializer, ProductVariantSerializer,
    InventorySerializer, PubliccategorywiseSerializer, SalesProductSerializer,
    CategorySerializer, ProductTagSerializer, OrderSerializer, ContactSerializer,
    ReviewSerializer, PublicReviewSerializer,
    AddressSerializer, ShippingMethodSerializer, CouponSerializer,
    ValidateCouponSerializer, CartSerializer, CartItemSerializer,
    WishlistSerializer, WishlistItemSerializer, PaymentSerializer,
    ReturnRequestSerializer,
)
from .filters import (
    DropDownListProductFilter, DropDownListSalesProductFilter,
    ProductFilter, PublicProductFilter, ProductDropdownFilter,
    ColorFilter, ProductVariantFilter, PublicProductVariantFilter,
    InventoryFilter, PubliccategorywiseFilter, SalesProductFilter, PublicSalesProductFilter,
    SalesProductDropdownFilter, CategoryFilter, PublicCategoryFilter,
    CategoryDropdownFilter, ProductTagFilter, OrderFilter,
    OrderSearchFilter, ContactFilter, PublicContactFilter,
    ReviewFilter, PublicReviewFilter,
    AddressFilter, ShippingMethodFilter, CouponFilter,
    CartFilter, WishlistFilter, PaymentFilter, ReturnRequestFilter,
)

logger = logging.getLogger(__name__)


# ============================================================================
# PRODUCT VIEWS  (unchanged)
# ============================================================================

class ProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ProductSerializer
    filterset_class    = ProductFilter

    @permission_required(['create_product'])
    def post(self, request):
        try:
            data = request.data.copy()
            data["created_by"] = request.user.id
            serializer = ProductSerializer(data=data)
            if serializer.is_valid():
                product = serializer.save()
                images  = request.FILES.getlist('images')
                if len(images) == 0:
                    return Response({'error': 'At least one image is required.'}, status=400)
                if len(images) > 5:
                    return Response({'error': 'Maximum 5 images allowed.'}, status=400)
                for img in images:
                    ProductImage.objects.create(product=product, images=img)
                return Response({'data': ProductSerializer(product).data}, status=201)
            return Response({'error': get_first_error_message(serializer.errors, "UNSUCCESSFUL")}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @permission_required(['read_product'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_product'])
    def patch(self, request):
        try:
            data = request.data.copy()
            if "id" not in data:
                return Response({"data": "ID NOT PROVIDED"}, status=400)
            product = Product.objects.filter(id=data["id"], deleted=False).first()
            if not product:
                return Response({"data": "NOT FOUND"}, status=404)
            data["updated_by"] = request.user.id
            serializer = ProductSerializer(product, data=data, partial=True)
            if not serializer.is_valid():
                return Response({'data': get_first_error_message(serializer.errors, "UNSUCCESSFUL")}, status=400)
            product_instance = serializer.save()
            deleted_ids = []
            if "deleted_images" in data:
                try:
                    deleted_ids = [int(i.strip()) for i in data["deleted_images"].split(",") if i.strip().isdigit()]
                    ProductImage.objects.filter(id__in=deleted_ids, product=product_instance).delete()
                except Exception as e:
                    print(f"Image delete error: {e}")
            uploaded_images = request.FILES.getlist('images')
            if len(uploaded_images) > 5:
                return Response({'error': 'Maximum 5 images allowed.'}, status=400)
            for img in uploaded_images:
                ProductImage.objects.create(product=product_instance, images=img, created_by=request.user)
            return Response({"data": ProductSerializer(product_instance).data}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @permission_required(['delete_product'])
    def delete(self, request):
        return super().delete_(request)


class PublicProductView(BaseView):
    permission_classes = ()
    serializer_class   = ProductSerializer
    filterset_class    = PublicProductFilter

    def get(self, request):
        return super().get_(request)


class ProductDropdownView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ProductSerializer
    filterset_class    = ProductDropdownFilter

    def get(self, request):
        return super().get_(request)


# ============================================================================
# COLOR VIEWS  (unchanged)
# ============================================================================

class ColorView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ColorSerializer
    filterset_class    = ColorFilter

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
# PRODUCT VARIANT VIEWS  (unchanged)
# ============================================================================

class ProductVariantView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ProductVariantSerializer
    filterset_class    = ProductVariantFilter

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
    permission_classes = ()
    serializer_class   = ProductVariantSerializer
    filterset_class    = PublicProductVariantFilter
    extra_filters      = {'is_active': True}

    def get(self, request):
        return super().get_(request)


# ============================================================================
# INVENTORY VIEWS  (unchanged)
# ============================================================================

class InventoryView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = InventorySerializer
    filterset_class    = InventoryFilter

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
# SALES PRODUCT VIEWS  (unchanged)
# ============================================================================

class SalesProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = SalesProductSerializer
    filterset_class    = SalesProductFilter

    @permission_required(['create_sales_product'])
    def post(self, request):
        try:
            if 'original_price' not in request.data:
                return Response({"error": "original_price is required"}, status=400)
            serializer = SalesProductSerializer(data=request.data.copy())
            if not serializer.is_valid():
                return Response({"error": "Validation failed", "details": serializer.errors}, status=400)
            product = serializer.save(created_by=request.user)
            images  = request.FILES.getlist('images')
            if len(images) > 5:
                return Response({'error': 'Maximum 5 images allowed.'}, status=400)
            for img in images:
                SalesProductImage.objects.create(sale_product=product, images=img, created_by=request.user)
            return Response({"success": True, "data": SalesProductSerializer(product).data}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @permission_required(['read_sales_product'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_sales_product'])
    def patch(self, request):
        try:
            product_id = request.query_params.get('id')
            if not product_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
            product = SalesProduct.objects.filter(deleted=False, id=product_id).first()
            if not product:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            serializer = SalesProductSerializer(product, data=request.data.copy(), partial=True,
                                                context={'request': request, 'id': product.id})
            if not serializer.is_valid():
                return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)
            product_instance = serializer.save(updated_by=request.user)
            uploaded_images  = request.FILES.getlist('images')
            deleted_ids = [int(i) for i in request.data.get("deleted_images", "").split(",") if i.strip().isdigit()]
            existing_count = SalesProductImage.objects.filter(sale_product=product_instance, deleted=False).count()
            final_count    = existing_count - len(deleted_ids) + len(uploaded_images)
            if final_count > 5:
                return Response(create_response("Total images cannot exceed 5"), status=status.HTTP_400_BAD_REQUEST)
            if deleted_ids:
                SalesProductImage.objects.filter(id__in=deleted_ids, sale_product=product_instance).delete()
            for img in uploaded_images:
                SalesProductImage.objects.create(sale_product=product_instance, images=img, created_by=request.user)
            return Response(create_response(SUCCESSFUL, SalesProductSerializer(product_instance).data), status=200)
        except Exception as e:
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @permission_required(['delete_sales_product'])
    def delete(self, request):
        return super().delete_(request)


class PublicSalesProductView(BaseView):
    permission_classes = ()
    serializer_class   = SalesProductSerializer
    filterset_class    = PublicSalesProductFilter

    def get(self, request):
        return super().get_(request)


class SalesProductDropdownView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = SalesProductSerializer
    filterset_class    = SalesProductDropdownFilter

    def get(self, request):
        return super().get_(request)


# ============================================================================
# CATEGORY VIEWS  (unchanged)
# ============================================================================

class CategoryView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = CategorySerializer
    filterset_class    = CategoryFilter

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
    permission_classes = ()
    serializer_class   = CategorySerializer
    filterset_class    = PublicCategoryFilter

    def get(self, request):
        return super().get_(request)


class PublicCategoryDetailView(BaseView):
    permission_classes = ()
    serializer_class   = CategorySerializer
    filterset_class    = PublicCategoryFilter

    def get(self, request, pk=None):
        if pk is not None:
            instance = self.serializer_class.Meta.model.objects.filter(pk=pk, deleted=False).first()
            if not instance:
                return Response({'error': 'Category not found'}, status=404)
            return Response(create_response(self.serializer_class(instance).data, SUCCESSFUL, 200))
        return super().get_(request)


class CategoryDropdownView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = CategorySerializer
    filterset_class    = CategoryDropdownFilter

    def get(self, request):
        return super().get_(request)


class CategorySearchView(BaseView):
    permission_classes = ()
    serializer_class   = CategorySerializer
    filterset_class    = PublicCategoryFilter

    def get(self, request):
        search_query = request.GET.get('q', '').strip()
        if not search_query:
            return Response(create_response({"message": "Search query is empty"}, "EMPTY_QUERY", 200))
        try:
            categories   = Category.objects.filter(
                Q(name__icontains=search_query) | Q(description__icontains=search_query), deleted=False
            ).order_by('-created_at').distinct()
            paginated, count = paginate_data(categories, request)
            return Response(create_response({'categories': self.serializer_class(paginated, many=True).data,
                                             'search_meta': {'query': search_query, 'count': count}}, SUCCESSFUL, 200))
        except Exception as e:
            logger.error(f"Category search error: {e}", exc_info=True)
            return Response(create_response({"error": "Search failed"}, UNSUCCESSFUL, 500))


class PubliccategorywiseView(BaseView):
    permission_classes = ()
    serializer_class   = PubliccategorywiseSerializer
    filterset_class    = PubliccategorywiseFilter

    def get(self, request, pk=None):
        try:
            if pk is not None:
                instance = self.serializer_class.Meta.model.objects.filter(pk=pk).first()
                if not instance:
                    return Response({'error': 'Category not found'}, status=404)
                return Response(create_response(self.serializer_class(instance).data, "SUCCESSFUL", 200))
            instances    = self.serializer_class.Meta.model.objects.all()
            filtered     = self.filterset_class(request.GET, queryset=instances).qs
            paginated, count = paginate_data(filtered, request)
            return Response(create_response({"count": count, "data": self.serializer_class(paginated, many=True).data},
                                            "SUCCESSFUL", 200))
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# ============================================================================
# PRODUCT TAG VIEWS  (unchanged)
# ============================================================================

class ProductTagView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ProductTagSerializer
    filterset_class    = ProductTagFilter

    def post(self, request):   return super().post_(request)
    def get(self, request):    return super().get_(request)
    def patch(self, request):  return super().patch_(request)
    def delete(self, request): return super().delete_(request)


# ============================================================================
# DROPDOWN VIEWS  (unchanged)
# ============================================================================

class DropDownListProductViews(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = DropDownListProductSerializer
    filterset_class    = DropDownListProductFilter

    def get(self, request):
        try:
            qs = self.serializer_class.Meta.model.objects.all()
            filtered, count = paginate_data(self.filterset_class(request.GET, queryset=qs).qs, request)
            return Response(create_response({"count": count, "data": self.serializer_class(filtered, many=True).data},
                                            "SUCCESSFUL", 200))
        except Exception as e:
            return Response({'error': str(e)}, 500)


class DropDownListSalesProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = DropDownListSalesProductSerializer
    filterset_class    = DropDownListSalesProductFilter

    def get(self, request):
        try:
            qs = self.serializer_class.Meta.model.objects.all()
            filtered, count = paginate_data(self.filterset_class(request.GET, queryset=qs).qs, request)
            return Response(create_response({"count": count, "data": self.serializer_class(filtered, many=True).data},
                                            "SUCCESSFUL", 200))
        except Exception as e:
            return Response({'error': str(e)}, 500)


# ============================================================================
# ORDER VIEWS  (unchanged — full logic preserved)
# ============================================================================

class OrderView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = OrderSerializer
    filterset_class    = OrderFilter

    def _calculate_delivery_date(self):
        today = date.today()
        if today.weekday() in [3, 4]: return today + timedelta(days=4)
        if today.weekday() == 5:      return today + timedelta(days=3)
        return today + timedelta(days=2)

    def _get_product_price(self, product_type, product_id):
        if product_type == 'product':
            p = Product.objects.get(id=product_id, deleted=False)
            return p.price, p
        elif product_type == 'sales_product':
            p = SalesProduct.objects.get(id=product_id, deleted=False)
            return p.final_price, p
        raise ValueError(f"Invalid product type: {product_type}")

    @permission_required(['create_order'])
    def post(self, request):
        if 'items' in request.data and any(i.get('product_type') for i in request.data.get('items', [])):
            return self._create_mixed_order(request)
        return super().post_(request)

    def _create_mixed_order(self, request):
        try:
            personal_info = {
                'customer_name':  request.data.get('customer_name'),
                'customer_email': request.data.get('customer_email'),
                'customer_phone': request.data.get('customer_phone'),
                'delivery_address': request.data.get('delivery_address'),
                'city':           request.data.get('city'),
                'payment_method': request.data.get('payment_method'),
            }
            customer_id    = request.data.get('customer')
            rider_id       = request.data.get('rider')
            delivery_date  = request.data.get('delivery_date')
            items          = request.data.get('items', [])
            if not all(personal_info.values()) or not items:
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            order_data = {**personal_info,
                          'delivery_date':  delivery_date or self._calculate_delivery_date(),
                          'status':         request.data.get('status', 'pending'),
                          'payment_status': request.data.get('payment_status', False)}
            if customer_id:
                try:    order_data['customer'] = User.objects.get(id=customer_id, deleted=False).id
                except: return Response({"error": f"Customer {customer_id} not found"}, status=400)
            if rider_id:
                try:    order_data['rider'] = User.objects.get(id=rider_id, deleted=False).id
                except: return Response({"error": f"Rider {rider_id} not found"}, status=400)
            ser = self.serializer_class(data=order_data)
            if not ser.is_valid():
                return Response({"error": "Validation failed", "details": ser.errors}, status=400)
            with transaction.atomic():
                order = ser.save()
                bill  = 0
                for item in items:
                    product_type = item.get('product_type')
                    product_id   = item.get('product_id')
                    quantity     = item.get('quantity', 1)
                    if not product_type or not product_id:
                        raise ValueError("Each item must have product_type and product_id")
                    unit_price, product = self._get_product_price(product_type, product_id)
                    total_price = unit_price * quantity
                    detail_data = {'order': order, 'unit_price': unit_price,
                                   'quantity': quantity, 'total_price': total_price}
                    if product_type == 'product':     detail_data['product'] = product
                    else:                              detail_data['sales_product'] = product
                    OrderDetail.objects.create(**detail_data)
                    bill += total_price
                order.bill = bill
                order.save()
            return Response({'success': True, 'order_id': order.id,
                             'bill': float(bill), 'status': order.status}, status=201)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Order creation failed: {e}", exc_info=True)
            return Response({"error": "Failed to create order"}, status=500)

    @permission_required(['read_order'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_order'])
    def patch(self, request):
        order_id = request.query_params.get('id') or request.data.get('id')
        if not order_id:
            return Response({"error": "Order ID required"}, status=400)
        try:
            order = Order.objects.get(id=order_id, deleted=False)
        except Order.DoesNotExist:
            return Response({"error": f"Order {order_id} not found"}, status=404)
        if 'items' in request.data:
            return self._update_order_items(request, order)
        return super().patch_(request)

    def _update_order_items(self, request, order):
        try:
            with transaction.atomic():
                update_fields = {k: request.data[k] for k in
                                 ['customer_name', 'customer_email', 'customer_phone',
                                  'delivery_address', 'city', 'payment_method',
                                  'delivery_date', 'status', 'payment_status']
                                 if k in request.data}
                for k, v in update_fields.items():
                    setattr(order, k, v)
                items = request.data.get('items', [])
                if items:
                    OrderDetail.objects.filter(order=order).update(deleted=True)
                    bill = 0
                    for item in items:
                        product_type = item.get('product_type')
                        product_id   = item.get('product_id')
                        quantity     = item.get('quantity', 1)
                        unit_price, product = self._get_product_price(product_type, product_id)
                        total_price = unit_price * quantity
                        detail      = {'order': order, 'unit_price': unit_price,
                                       'quantity': quantity, 'total_price': total_price}
                        if product_type == 'product': detail['product'] = product
                        else:                          detail['sales_product'] = product
                        OrderDetail.objects.create(**detail)
                        bill += total_price
                    order.bill = bill
                order.save()
            return Response({'success': True, 'order_id': order.id,
                             'bill': float(order.bill or 0)}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @permission_required(['delete_order'])
    def delete(self, request):
        return super().delete_(request)


class OrderSearchView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = OrderSerializer
    filterset_class    = OrderSearchFilter

    def get(self, request):
        return super().get_(request)


class PublicOrderView(BaseView):
    permission_classes = ()
    serializer_class   = OrderSerializer

    def _calculate_delivery_date(self):
        today = date.today()
        if today.weekday() in [3, 4]: return today + timedelta(days=4)
        if today.weekday() == 5:      return today + timedelta(days=3)
        return today + timedelta(days=2)

    def _get_product_price(self, product_type, product_id):
        if product_type == 'product':
            p = Product.objects.get(id=product_id, deleted=False)
            return p.price, p
        p = SalesProduct.objects.get(id=product_id, deleted=False)
        return p.final_price, p

    def post(self, request):
        if 'items' in request.data and any(i.get('product_type') for i in request.data.get('items', [])):
            return self._create_mixed_order(request)
        return super().post_(request)

    def _create_mixed_order(self, request):
        try:
            personal_info = {
                'customer_name':    request.data.get('customer_name'),
                'customer_email':   request.data.get('customer_email'),
                'customer_phone':   request.data.get('customer_phone'),
                'delivery_address': request.data.get('delivery_address'),
                'city':             request.data.get('city'),
                'payment_method':   request.data.get('payment_method'),
            }
            items = request.data.get('items', [])
            if not all(personal_info.values()) or not items:
                return Response({"error": "Missing required fields"}, status=400)
            ser = self.serializer_class(data={**personal_info,
                                              'delivery_date': self._calculate_delivery_date(),
                                              'status': 'pending', 'payment_status': False})
            if not ser.is_valid():
                return Response({"error": "Validation failed", "details": ser.errors}, status=400)
            with transaction.atomic():
                order = ser.save()
                bill  = 0
                for item in items:
                    unit_price, product = self._get_product_price(item.get('product_type'), item.get('product_id'))
                    qty         = item.get('quantity', 1)
                    total_price = unit_price * qty
                    detail      = {'order': order, 'unit_price': unit_price, 'quantity': qty, 'total_price': total_price}
                    if item.get('product_type') == 'product': detail['product'] = product
                    else:                                       detail['sales_product'] = product
                    OrderDetail.objects.create(**detail)
                    bill += total_price
                order.bill = bill
                order.save()
            return Response({'success': True, 'order_id': order.id, 'bill': float(bill)}, status=201)
        except Exception as e:
            logger.error(f"Public order failed: {e}", exc_info=True)
            return Response({"error": str(e)}, status=500)


# ============================================================================
# CONTACT VIEWS  (unchanged)
# ============================================================================

class ContactView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ContactSerializer
    filterset_class    = ContactFilter

    @permission_required(['read_contact'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['delete_contact'])
    def delete(self, request):
        return super().delete_(request)


class PublicContactView(BaseView):
    permission_classes = ()
    serializer_class   = ContactSerializer
    filterset_class    = PublicContactFilter

    def post(self, request):
        return super().post_(request)

    def get(self, request):
        return super().get_(request)


# ============================================================================
# REVIEW VIEWS  (unchanged)
# ============================================================================

class ReviewView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ReviewSerializer
    filterset_class    = ReviewFilter

    @permission_required(['create_reviews'])
    def post(self, request):
        try:
            if not request.data.get('product') and not request.data.get('sales_product'):
                return Response({'status': 'ERROR', 'message': 'Either product or sales_product ID is required'}, status=400)
            if request.user.is_authenticated:
                request.data["user"] = request.user.id
            serializer = self.serializer_class(data=request.data, context={'request': request})
            if serializer.is_valid():
                review = serializer.save(created_by=request.user if request.user.is_authenticated else None)
                return Response({'status': 'SUCCESS', 'message': 'Review created',
                                 'data': self.serializer_class(review, context={'request': request}).data}, status=201)
            return Response({'status': 'ERROR', 'message': get_first_error_message(serializer.errors, "Validation failed"),
                             'errors': serializer.errors}, status=400)
        except Exception as e:
            return Response({'status': 'ERROR', 'message': str(e)}, status=500)

    @permission_required(['read_reviews'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_reviews'])
    def patch(self, request):
        try:
            review_id = request.query_params.get('id')
            if not review_id:
                return Response({'status': 'ERROR', 'message': 'Review ID required'}, status=400)
            instance = Review.objects.filter(id=review_id, deleted=False).first()
            if not instance:
                return Response({'status': 'ERROR', 'message': 'Review not found'}, status=404)
            if request.user.is_authenticated and instance.user and instance.user != request.user:
                return Response({'status': 'ERROR', 'message': 'You can only update your own reviews'}, status=403)
            data = request.data.copy()
            data.pop('product', None)
            data.pop('sales_product', None)
            serializer = self.serializer_class(instance, data=data, partial=True, context={'request': request})
            if serializer.is_valid():
                updated = serializer.save(updated_by=request.user if request.user.is_authenticated else None)
                return Response({'status': 'SUCCESS', 'data': self.serializer_class(updated, context={'request': request}).data}, status=200)
            return Response({'status': 'ERROR', 'errors': serializer.errors}, status=400)
        except Exception as e:
            return Response({'status': 'ERROR', 'message': str(e)}, status=500)

    @permission_required(['delete_reviews'])
    def delete(self, request):
        try:
            review_id = request.query_params.get('id')
            if not review_id:
                return Response({'status': 'ERROR', 'message': 'Review ID required'}, status=400)
            instance = Review.objects.filter(id=review_id, deleted=False).first()
            if not instance:
                return Response({'status': 'ERROR', 'message': 'Review not found'}, status=404)
            if request.user.is_authenticated and instance.user and instance.user != request.user:
                return Response({'status': 'ERROR', 'message': 'You can only delete your own reviews'}, status=403)
            instance.deleted    = True
            instance.updated_by = request.user if request.user.is_authenticated else None
            instance.save()
            return Response({'status': 'SUCCESS', 'message': 'Review deleted', 'data': {'id': review_id}}, status=200)
        except Exception as e:
            return Response({'status': 'ERROR', 'message': str(e)}, status=500)


class PublicReviewView(BaseView):
    permission_classes = ()
    serializer_class   = PublicReviewSerializer
    filterset_class    = PublicReviewFilter

    def post(self, request):
        try:
            if not request.data.get('product') and not request.data.get('sales_product'):
                return Response({'status': 'ERROR', 'message': 'Either product or sales_product ID is required'}, status=400)
            serializer = ReviewSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                review = serializer.save()
                return Response({'status': 'SUCCESS', 'data': {
                    'id': review.id, 'name': review.name, 'comment': review.comment,
                    'rating': review.rating, 'created_at': review.created_at}}, status=201)
            return Response({'status': 'ERROR', 'errors': serializer.errors}, status=400)
        except Exception as e:
            return Response({'status': 'ERROR', 'message': str(e)}, status=500)

    def get(self, request):
        try:
            product_id       = request.GET.get('product_id') or request.GET.get('product')
            sales_product_id = request.GET.get('sales_product_id') or request.GET.get('sales_product')
            if not product_id and not sales_product_id:
                return Response({'status': 'ERROR', 'message': 'Either product_id or sales_product_id is required'}, status=400)
            q = Q(deleted=False)
            if product_id:       q &= Q(product_id=product_id)
            if sales_product_id: q &= Q(sales_product_id=sales_product_id)
            qs = Review.objects.filter(q).order_by('-created_at')
            filtered         = self.filterset_class(request.GET, queryset=qs).qs
            paginated, count = paginate_data(filtered, request)
            return Response({'status': 'SUCCESS', 'data': {'count': count,
                              'reviews': self.serializer_class(paginated, many=True).data}}, status=200)
        except Exception as e:
            return Response({'status': 'ERROR', 'message': str(e)}, status=500)


# ============================================================================
# ADDRESS  ── NEW
# ============================================================================

class AddressView(BaseView):
    """
    Customer manages their own saved addresses.
    GET    → all addresses for the logged-in user
    POST   → create new address
    PATCH  → update address (?id=N)
    DELETE → soft-delete address (?id=N)
    """
    permission_classes = (IsAuthenticated,)
    serializer_class   = AddressSerializer
    filterset_class    = AddressFilter

    def get(self, request):
        try:
            if request.query_params.get('id'):
                instance = Address.objects.filter(
                    id=request.query_params.get('id'), user=request.user, deleted=False
                ).first()
                if not instance:
                    return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
                return Response(create_response(SUCCESSFUL, AddressSerializer(instance).data), status=200)
            qs = Address.objects.filter(user=request.user, deleted=False).order_by('-is_default', '-created_at')
            if self.filterset_class:
                qs = self.filterset_class(request.GET, queryset=qs).qs
            paginated, count = paginate_data(qs, request)
            return Response(create_response(SUCCESSFUL, AddressSerializer(paginated, many=True).data, count), status=200)
        except Exception as e:
            return Response(create_response(str(e)), status=500)

    def post(self, request):
        try:
            serializer = AddressSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(created_by=request.user)
                return Response(create_response(SUCCESSFUL, serializer.data), status=201)
            return Response(create_response(get_first_error(serializer.errors)), status=400)
        except Exception as e:
            return Response(create_response(str(e)), status=500)

    def patch(self, request):
        try:
            address_id = request.query_params.get('id')
            if not address_id:
                return Response(create_response(ID_NOT_PROVIDED), status=400)
            instance = Address.objects.filter(id=address_id, user=request.user, deleted=False).first()
            if not instance:
                return Response(create_response(NOT_FOUND), status=404)
            serializer = AddressSerializer(instance, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save(updated_by=request.user)
                return Response(create_response(SUCCESSFUL, serializer.data), status=200)
            return Response(create_response(get_first_error(serializer.errors)), status=400)
        except Exception as e:
            return Response(create_response(str(e)), status=500)

    def delete(self, request):
        try:
            address_id = request.query_params.get('id')
            if not address_id:
                return Response(create_response(ID_NOT_PROVIDED), status=400)
            instance = Address.objects.filter(id=address_id, user=request.user, deleted=False).first()
            if not instance:
                return Response(create_response(NOT_FOUND), status=404)
            instance.deleted    = True
            instance.updated_by = request.user
            instance.save()
            return Response(create_response(SUCCESSFUL, AddressSerializer(instance).data), status=200)
        except Exception as e:
            return Response(create_response(str(e)), status=500)


# ============================================================================
# SHIPPING METHOD  ── NEW
# ============================================================================

class ShippingMethodView(BaseView):
    """Admin CRUD for shipping methods."""
    permission_classes = (IsAuthenticated,)
    serializer_class   = ShippingMethodSerializer
    filterset_class    = ShippingMethodFilter

    @permission_required(['create_shipping'])
    def post(self, request):
        return super().post_(request)

    @permission_required(['read_shipping'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_shipping'])
    def patch(self, request):
        return super().patch_(request)

    @permission_required(['delete_shipping'])
    def delete(self, request):
        return super().delete_(request)


class PublicShippingMethodView(BaseView):
    """Public listing of active shipping options for checkout page."""
    permission_classes = ()
    serializer_class   = ShippingMethodSerializer
    filterset_class    = ShippingMethodFilter
    extra_filters      = {'is_active': True}

    def get(self, request):
        return super().get_(request)


# ============================================================================
# COUPON  ── NEW
# ============================================================================

class CouponView(BaseView):
    """Admin CRUD for coupons."""
    permission_classes = (IsAuthenticated,)
    serializer_class   = CouponSerializer
    filterset_class    = CouponFilter

    @permission_required(['create_coupon'])
    def post(self, request):
        return super().post_(request)

    @permission_required(['read_coupon'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_coupon'])
    def patch(self, request):
        return super().patch_(request)

    @permission_required(['delete_coupon'])
    def delete(self, request):
        return super().delete_(request)


class ValidateCouponView(BaseView):
    """
    Customer validates a coupon code at checkout.
    POST /v1/public/coupon/validate/
    Body: { "code": "SAVE10", "order_amount": "2500.00" }
    """
    permission_classes = ()

    def post(self, request):
        try:
            serializer = ValidateCouponSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(create_response(get_first_error(serializer.errors)), status=400)

            code         = serializer.validated_data['code']
            order_amount = serializer.validated_data['order_amount']

            coupon = Coupon.objects.filter(code__iexact=code, deleted=False, is_active=True).first()
            if not coupon:
                return Response(create_response("Invalid or inactive coupon code"), status=400)

            now = timezone.now()
            if now < coupon.valid_from or now > coupon.valid_to:
                return Response(create_response("Coupon is not valid at this time"), status=400)

            if coupon.is_exhausted:
                return Response(create_response("Coupon usage limit has been reached"), status=400)

            if order_amount < coupon.min_order_amount:
                return Response(
                    create_response(f"Minimum order amount for this coupon is Rs.{coupon.min_order_amount}"),
                    status=400
                )

            discount     = coupon.calculate_discount(order_amount)
            final_amount = order_amount - discount
            return Response(create_response(SUCCESSFUL, {
                "coupon_code":     coupon.code,
                "discount_type":   coupon.discount_type,
                "discount_value":  str(coupon.discount_value),
                "discount_amount": str(discount),
                "final_amount":    str(final_amount),
            }), status=200)

        except Exception as e:
            return Response(create_response(str(e)), status=500)


# ============================================================================
# CART  ── NEW
# ============================================================================

class CartView(BaseView):
    """
    GET    → returns current user's cart with all items
    DELETE → clears all items from cart
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            return Response(create_response(SUCCESSFUL, CartSerializer(cart).data), status=200)
        except Exception as e:
            return Response(create_response(str(e)), status=500)

    def delete(self, request):
        """Clear entire cart."""
        try:
            cart = Cart.objects.filter(user=request.user).first()
            if cart:
                cart.items.filter(deleted=False).update(deleted=True)
            return Response(create_response(SUCCESSFUL), status=200)
        except Exception as e:
            return Response(create_response(str(e)), status=500)


class CartItemView(BaseView):
    """
    POST   → add item to cart (increments quantity if same item exists)
    PATCH  → update item quantity (?id=N)
    DELETE → remove item from cart (?id=N)
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            data    = request.data.copy()

            product_variant_id = data.get('product_variant')
            sales_product_id   = data.get('sales_product')

            # Increment quantity if same item already in cart
            existing = cart.items.filter(
                product_variant=product_variant_id,
                sales_product=sales_product_id,
                deleted=False
            ).first()
            if existing:
                existing.quantity += int(data.get('quantity', 1))
                existing.save()
                return Response(create_response(SUCCESSFUL, CartItemSerializer(existing).data), status=200)

            data['cart'] = cart.id
            serializer   = CartItemSerializer(data=data)
            if serializer.is_valid():
                item = serializer.save(created_by=request.user)
                return Response(create_response(SUCCESSFUL, CartItemSerializer(item).data), status=201)
            return Response(create_response(get_first_error(serializer.errors)), status=400)
        except Exception as e:
            return Response(create_response(str(e)), status=500)

    def patch(self, request):
        try:
            item_id = request.query_params.get('id')
            if not item_id:
                return Response(create_response(ID_NOT_PROVIDED), status=400)
            cart = Cart.objects.filter(user=request.user).first()
            if not cart:
                return Response(create_response(NOT_FOUND), status=404)
            item = cart.items.filter(id=item_id, deleted=False).first()
            if not item:
                return Response(create_response(NOT_FOUND), status=404)
            new_qty = request.data.get('quantity')
            if new_qty is not None:
                if int(new_qty) <= 0:
                    item.deleted = True
                    item.save()
                    return Response(create_response(SUCCESSFUL), status=200)
                item.quantity    = int(new_qty)
                item.updated_by  = request.user
                item.save()
            return Response(create_response(SUCCESSFUL, CartItemSerializer(item).data), status=200)
        except Exception as e:
            return Response(create_response(str(e)), status=500)

    def delete(self, request):
        try:
            item_id = request.query_params.get('id')
            if not item_id:
                return Response(create_response(ID_NOT_PROVIDED), status=400)
            cart = Cart.objects.filter(user=request.user).first()
            if not cart:
                return Response(create_response(NOT_FOUND), status=404)
            item = cart.items.filter(id=item_id, deleted=False).first()
            if not item:
                return Response(create_response(NOT_FOUND), status=404)
            item.deleted    = True
            item.updated_by = request.user
            item.save()
            return Response(create_response(SUCCESSFUL), status=200)
        except Exception as e:
            return Response(create_response(str(e)), status=500)


# ============================================================================
# WISHLIST  ── NEW
# ============================================================================

class WishlistView(BaseView):
    """GET → returns current user's wishlist with all items."""
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
            return Response(create_response(SUCCESSFUL, WishlistSerializer(wishlist).data), status=200)
        except Exception as e:
            return Response(create_response(str(e)), status=500)


class WishlistItemView(BaseView):
    """
    POST   → add item to wishlist (rejects duplicate)
    DELETE → remove item from wishlist (?id=N)
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
            product_id       = request.data.get('product')
            sales_product_id = request.data.get('sales_product')

            # Prevent duplicates
            if wishlist.items.filter(
                product=product_id,
                sales_product=sales_product_id,
                deleted=False
            ).exists():
                return Response(create_response("Item already in wishlist"), status=400)

            data             = request.data.copy()
            data['wishlist'] = wishlist.id
            serializer       = WishlistItemSerializer(data=data)
            if serializer.is_valid():
                item = serializer.save(created_by=request.user)
                return Response(create_response(SUCCESSFUL, WishlistItemSerializer(item).data), status=201)
            return Response(create_response(get_first_error(serializer.errors)), status=400)
        except Exception as e:
            return Response(create_response(str(e)), status=500)

    def delete(self, request):
        try:
            item_id = request.query_params.get('id')
            if not item_id:
                return Response(create_response(ID_NOT_PROVIDED), status=400)
            wishlist = Wishlist.objects.filter(user=request.user).first()
            if not wishlist:
                return Response(create_response(NOT_FOUND), status=404)
            item = wishlist.items.filter(id=item_id, deleted=False).first()
            if not item:
                return Response(create_response(NOT_FOUND), status=404)
            item.deleted    = True
            item.updated_by = request.user
            item.save()
            return Response(create_response(SUCCESSFUL), status=200)
        except Exception as e:
            return Response(create_response(str(e)), status=500)


# ============================================================================
# PAYMENT  ── NEW
# ============================================================================

class PaymentView(BaseView):
    """
    Admin views and updates payment records.
    GET   → list/retrieve payments
    PATCH → update payment status (?id=N)
    """
    permission_classes = (IsAuthenticated,)
    serializer_class   = PaymentSerializer
    filterset_class    = PaymentFilter

    @permission_required(['read_payment'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_payment'])
    def patch(self, request):
        return super().patch_(request)


# ============================================================================
# RETURN REQUEST  ── NEW
# ============================================================================

class ReturnRequestView(BaseView):
    """
    POST  → customer submits a return request
    GET   → admin lists all return requests (with filters)
    PATCH → admin approves / rejects (?id=N)
    """
    permission_classes = (IsAuthenticated,)
    serializer_class   = ReturnRequestSerializer
    filterset_class    = ReturnRequestFilter

    def post(self, request):
        """Any authenticated customer can submit a return request."""
        try:
            serializer = ReturnRequestSerializer(data=request.data)
            if serializer.is_valid():
                instance = serializer.save(created_by=request.user)
                return Response(create_response(SUCCESSFUL, ReturnRequestSerializer(instance).data), status=201)
            return Response(create_response(get_first_error(serializer.errors)), status=400)
        except Exception as e:
            return Response(create_response(str(e)), status=500)

    @permission_required(['read_return'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_return'])
    def patch(self, request):
        """Admin reviews (approves / rejects) a return request."""
        try:
            return_id = request.query_params.get('id')
            if not return_id:
                return Response(create_response(ID_NOT_PROVIDED), status=400)
            instance = ReturnRequest.objects.filter(id=return_id, deleted=False).first()
            if not instance:
                return Response(create_response(NOT_FOUND), status=404)
            data = request.data.copy()
            # Admin marks themselves as reviewer
            data['reviewed_by'] = request.user.id
            serializer = ReturnRequestSerializer(instance, data=data, partial=True)
            if serializer.is_valid():
                updated = serializer.save(updated_by=request.user)
                return Response(create_response(SUCCESSFUL, ReturnRequestSerializer(updated).data), status=200)
            return Response(create_response(get_first_error(serializer.errors)), status=400)
        except Exception as e:
            return Response(create_response(str(e)), status=500)