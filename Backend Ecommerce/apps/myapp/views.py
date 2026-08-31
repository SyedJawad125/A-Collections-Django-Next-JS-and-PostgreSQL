# """
# E-commerce Views
# All new views follow the same BaseView patterns already used in the project.
# Existing views are untouched — new views for Address, ShippingMethod, Coupon,
# Cart, Wishlist, Payment, and ReturnRequest are added below.
# """

# import logging
# from datetime import date, timedelta
# import traceback

# from django.db import transaction
# from django.db.models import Q
# from django.shortcuts import get_object_or_404
# from django.utils import timezone

# from rest_framework import status
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated

# from apps.users.models import User
# from utils.decorator import permission_required
# from utils.base_api import BaseView
# from utils.helpers import create_response, get_first_error, paginate_data, get_first_error_message
# from utils.response_messages import ID_NOT_PROVIDED, NOT_FOUND, SUCCESSFUL, UNSUCCESSFUL

# from .models import (
#      Category, Product, ProductImage, ProductTag, Color, ProductVariant,
#      Inventory, SalesProduct, SalesProductImage, Order, OrderDetail,
#      Contact, Review,
#      SalesProductColor, SalesProductVariant, SalesInventory,
#      Address, ShippingMethod, Coupon, Cart, CartItem,
#      Wishlist, WishlistItem, Payment, ReturnRequest,
#  )
# from .serializers import (
#      DropDownListProductSerializer, DropDownListSalesProductSerializer,
#      ProductSerializer, ColorSerializer, ProductVariantSerializer,
#      InventorySerializer, PubliccategorywiseSerializer, SalesProductSerializer,
#      CategorySerializer, ProductTagSerializer, OrderSerializer, ContactSerializer,
#      ReviewSerializer, PublicReviewSerializer,
#      SalesProductColorSerializer, SalesProductVariantSerializer, SalesInventorySerializer,
#      AddressSerializer, ShippingMethodSerializer, CouponSerializer,
#      ValidateCouponSerializer, CartSerializer, CartItemSerializer,
#      WishlistSerializer, WishlistItemSerializer, PaymentSerializer,
#      ReturnRequestSerializer,
# )
# from .filters import (
#      DropDownListProductFilter, DropDownListSalesProductFilter,
#      ProductFilter, PublicProductFilter, ProductDropdownFilter,
#      ColorFilter, ProductVariantFilter, PublicProductVariantFilter,
#      InventoryFilter, PubliccategorywiseFilter, SalesProductFilter, PublicSalesProductFilter,
#      SalesProductDropdownFilter, CategoryFilter, PublicCategoryFilter,
#      CategoryDropdownFilter, ProductTagFilter, OrderFilter,
#      OrderSearchFilter, ContactFilter, PublicContactFilter,
#      ReviewFilter, PublicReviewFilter,
#      SalesProductColorFilter, SalesProductVariantFilter, PublicSalesProductVariantFilter,
#      SalesInventoryFilter,
#      AddressFilter, ShippingMethodFilter, CouponFilter,
#      CartFilter, WishlistFilter, PaymentFilter, ReturnRequestFilter,
# )

# logger = logging.getLogger(__name__)


# # ============================================================================
# # PRODUCT VIEWS  (unchanged)
# # ============================================================================

# class ProductView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = ProductSerializer
#     filterset_class    = ProductFilter

#     @permission_required(['create_product'])
#     def post(self, request):
#         try:
#             data = request.data.copy()
#             data["created_by"] = request.user.id
#             serializer = ProductSerializer(data=data)
#             if serializer.is_valid():
#                 product = serializer.save()
#                 images  = request.FILES.getlist('images')
#                 if len(images) == 0:
#                     return Response({'error': 'At least one image is required.'}, status=400)
#                 if len(images) > 5:
#                     return Response({'error': 'Maximum 5 images allowed.'}, status=400)
#                 for img in images:
#                     ProductImage.objects.create(product=product, images=img)
#                 return Response({'data': ProductSerializer(product).data}, status=201)
#             return Response({'error': get_first_error_message(serializer.errors, "UNSUCCESSFUL")}, status=400)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)

#     @permission_required(['read_product'])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required(['update_product'])
#     def patch(self, request):
#         try:
#             data = request.data.copy()
#             if "id" not in data:
#                 return Response({"data": "ID NOT PROVIDED"}, status=400)
#             product = Product.objects.filter(id=data["id"], deleted=False).first()
#             if not product:
#                 return Response({"data": "NOT FOUND"}, status=404)
#             data["updated_by"] = request.user.id
#             serializer = ProductSerializer(product, data=data, partial=True)
#             if not serializer.is_valid():
#                 return Response({'data': get_first_error_message(serializer.errors, "UNSUCCESSFUL")}, status=400)
#             product_instance = serializer.save()
#             deleted_ids = []
#             if "deleted_images" in data:
#                 try:
#                     deleted_ids = [int(i.strip()) for i in data["deleted_images"].split(",") if i.strip().isdigit()]
#                     ProductImage.objects.filter(id__in=deleted_ids, product=product_instance).delete()
#                 except Exception as e:
#                     print(f"Image delete error: {e}")
#             uploaded_images = request.FILES.getlist('images')
#             if len(uploaded_images) > 5:
#                 return Response({'error': 'Maximum 5 images allowed.'}, status=400)
#             for img in uploaded_images:
#                 ProductImage.objects.create(product=product_instance, images=img, created_by=request.user)
#             return Response({"data": ProductSerializer(product_instance).data}, status=200)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)

#     @permission_required(['delete_product'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicProductView(BaseView):
#     permission_classes = ()
#     serializer_class   = ProductSerializer
#     filterset_class    = PublicProductFilter

#     def get(self, request):
#         return super().get_(request)


# class ProductDropdownView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = ProductSerializer
#     filterset_class    = ProductDropdownFilter

#     def get(self, request):
#         return super().get_(request)


# # ============================================================================
# # COLOR VIEWS  (unchanged)
# # ============================================================================

# class ColorView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = ColorSerializer
#     filterset_class    = ColorFilter

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
# # PRODUCT VARIANT VIEWS  (unchanged)
# # ============================================================================

# class ProductVariantView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = ProductVariantSerializer
#     filterset_class    = ProductVariantFilter

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
#     permission_classes = ()
#     serializer_class   = ProductVariantSerializer
#     filterset_class    = PublicProductVariantFilter
#     extra_filters      = {'is_active': True}

#     def get(self, request):
#         return super().get_(request)


# # ============================================================================
# # INVENTORY VIEWS  (unchanged)
# # ============================================================================

# class InventoryView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = InventorySerializer
#     filterset_class    = InventoryFilter

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
# # SALES PRODUCT VIEWS  (unchanged)
# # ============================================================================

# class SalesProductView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = SalesProductSerializer
#     filterset_class    = SalesProductFilter

#     @permission_required(['create_sales_product'])
#     def post(self, request):
#         try:
#             if 'original_price' not in request.data:
#                 return Response({"error": "original_price is required"}, status=400)
#             serializer = SalesProductSerializer(data=request.data.copy())
#             if not serializer.is_valid():
#                 return Response({"error": "Validation failed", "details": serializer.errors}, status=400)
#             product = serializer.save(created_by=request.user)
#             images  = request.FILES.getlist('images')
#             if len(images) > 5:
#                 return Response({'error': 'Maximum 5 images allowed.'}, status=400)
#             for img in images:
#                 SalesProductImage.objects.create(sale_product=product, images=img, created_by=request.user)
#             return Response({"success": True, "data": SalesProductSerializer(product).data}, status=201)
#         except Exception as e:
#             return Response({"error": str(e)}, status=500)

#     @permission_required(['read_sales_product'])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required(['update_sales_product'])
#     def patch(self, request):
#         try:
#             product_id = request.query_params.get('id')
#             if not product_id:
#                 return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
#             product = SalesProduct.objects.filter(deleted=False, id=product_id).first()
#             if not product:
#                 return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
#             serializer = SalesProductSerializer(product, data=request.data.copy(), partial=True,
#                                                 context={'request': request, 'id': product.id})
#             if not serializer.is_valid():
#                 return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)
#             product_instance = serializer.save(updated_by=request.user)
#             uploaded_images  = request.FILES.getlist('images')
#             deleted_ids = [int(i) for i in request.data.get("deleted_images", "").split(",") if i.strip().isdigit()]
#             existing_count = SalesProductImage.objects.filter(sale_product=product_instance, deleted=False).count()
#             final_count    = existing_count - len(deleted_ids) + len(uploaded_images)
#             if final_count > 5:
#                 return Response(create_response("Total images cannot exceed 5"), status=status.HTTP_400_BAD_REQUEST)
#             if deleted_ids:
#                 SalesProductImage.objects.filter(id__in=deleted_ids, sale_product=product_instance).delete()
#             for img in uploaded_images:
#                 SalesProductImage.objects.create(sale_product=product_instance, images=img, created_by=request.user)
#             return Response(create_response(SUCCESSFUL, SalesProductSerializer(product_instance).data), status=200)
#         except Exception as e:
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     @permission_required(['delete_sales_product'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicSalesProductView(BaseView):
#     permission_classes = ()
#     serializer_class   = SalesProductSerializer
#     filterset_class    = PublicSalesProductFilter

#     def get(self, request):
#         return super().get_(request)


# class SalesProductDropdownView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = SalesProductSerializer
#     filterset_class    = SalesProductDropdownFilter

#     def get(self, request):
#         return super().get_(request)


# # ============================================================================
# # CATEGORY VIEWS  (unchanged)
# # ============================================================================

# class CategoryView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = CategorySerializer
#     filterset_class    = CategoryFilter

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
#     permission_classes = ()
#     serializer_class   = CategorySerializer
#     filterset_class    = PublicCategoryFilter

#     def get(self, request):
#         return super().get_(request)


# class PublicCategoryDetailView(BaseView):
#     permission_classes = ()
#     serializer_class   = CategorySerializer
#     filterset_class    = PublicCategoryFilter

#     def get(self, request, pk=None):
#         if pk is not None:
#             instance = self.serializer_class.Meta.model.objects.filter(pk=pk, deleted=False).first()
#             if not instance:
#                 return Response({'error': 'Category not found'}, status=404)
#             return Response(create_response(self.serializer_class(instance).data, SUCCESSFUL, 200))
#         return super().get_(request)


# class CategoryDropdownView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = CategorySerializer
#     filterset_class    = CategoryDropdownFilter

#     def get(self, request):
#         return super().get_(request)


# class CategorySearchView(BaseView):
#     permission_classes = ()
#     serializer_class   = CategorySerializer
#     filterset_class    = PublicCategoryFilter

#     def get(self, request):
#         search_query = request.GET.get('q', '').strip()
#         if not search_query:
#             return Response(create_response({"message": "Search query is empty"}, "EMPTY_QUERY", 200))
#         try:
#             categories   = Category.objects.filter(
#                 Q(name__icontains=search_query) | Q(description__icontains=search_query), deleted=False
#             ).order_by('-created_at').distinct()
#             paginated, count = paginate_data(categories, request)
#             return Response(create_response({'categories': self.serializer_class(paginated, many=True).data,
#                                              'search_meta': {'query': search_query, 'count': count}}, SUCCESSFUL, 200))
#         except Exception as e:
#             logger.error(f"Category search error: {e}", exc_info=True)
#             return Response(create_response({"error": "Search failed"}, UNSUCCESSFUL, 500))


# class PubliccategorywiseView(BaseView):
#     permission_classes = ()
#     serializer_class   = PubliccategorywiseSerializer
#     filterset_class    = PubliccategorywiseFilter

#     def get(self, request, pk=None):
#         try:
#             if pk is not None:
#                 instance = self.serializer_class.Meta.model.objects.filter(pk=pk).first()
#                 if not instance:
#                     return Response({'error': 'Category not found'}, status=404)
#                 return Response(create_response(self.serializer_class(instance).data, "SUCCESSFUL", 200))
#             instances    = self.serializer_class.Meta.model.objects.all()
#             filtered     = self.filterset_class(request.GET, queryset=instances).qs
#             paginated, count = paginate_data(filtered, request)
#             return Response(create_response({"count": count, "data": self.serializer_class(paginated, many=True).data},
#                                             "SUCCESSFUL", 200))
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)


# # ============================================================================
# # PRODUCT TAG VIEWS  (unchanged)
# # ============================================================================

# class ProductTagView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = ProductTagSerializer
#     filterset_class    = ProductTagFilter

#     def post(self, request):   return super().post_(request)
#     def get(self, request):    return super().get_(request)
#     def patch(self, request):  return super().patch_(request)
#     def delete(self, request): return super().delete_(request)


# # ============================================================================
# # DROPDOWN VIEWS  (unchanged)
# # ============================================================================

# class DropDownListProductViews(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = DropDownListProductSerializer
#     filterset_class    = DropDownListProductFilter

#     def get(self, request):
#         try:
#             qs = self.serializer_class.Meta.model.objects.all()
#             filtered, count = paginate_data(self.filterset_class(request.GET, queryset=qs).qs, request)
#             return Response(create_response({"count": count, "data": self.serializer_class(filtered, many=True).data},
#                                             "SUCCESSFUL", 200))
#         except Exception as e:
#             return Response({'error': str(e)}, 500)


# class DropDownListSalesProductView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = DropDownListSalesProductSerializer
#     filterset_class    = DropDownListSalesProductFilter

#     def get(self, request):
#         try:
#             qs = self.serializer_class.Meta.model.objects.all()
#             filtered, count = paginate_data(self.filterset_class(request.GET, queryset=qs).qs, request)
#             return Response(create_response({"count": count, "data": self.serializer_class(filtered, many=True).data},
#                                             "SUCCESSFUL", 200))
#         except Exception as e:
#             return Response({'error': str(e)}, 500)


# # ============================================================================
# # ORDER VIEWS  (unchanged — full logic preserved)
# # ============================================================================

# class OrderView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = OrderSerializer
#     filterset_class    = OrderFilter

#     def _calculate_delivery_date(self):
#         today = date.today()
#         if today.weekday() in [3, 4]: return today + timedelta(days=4)
#         if today.weekday() == 5:      return today + timedelta(days=3)
#         return today + timedelta(days=2)

#     def _get_product_price(self, product_type, product_id):
#         if product_type == 'product':
#             p = Product.objects.get(id=product_id, deleted=False)
#             return p.price, p
#         elif product_type == 'sales_product':
#             p = SalesProduct.objects.get(id=product_id, deleted=False)
#             return p.final_price, p
#         raise ValueError(f"Invalid product type: {product_type}")

#     @permission_required(['create_order'])
#     def post(self, request):
#         if 'items' in request.data and any(i.get('product_type') for i in request.data.get('items', [])):
#             return self._create_mixed_order(request)
#         return super().post_(request)

#     def _create_mixed_order(self, request):
#         try:
#             personal_info = {
#                 'customer_name':  request.data.get('customer_name'),
#                 'customer_email': request.data.get('customer_email'),
#                 'customer_phone': request.data.get('customer_phone'),
#                 'delivery_address': request.data.get('delivery_address'),
#                 'city':           request.data.get('city'),
#                 'payment_method': request.data.get('payment_method'),
#             }
#             customer_id    = request.data.get('customer')
#             rider_id       = request.data.get('rider')
#             delivery_date  = request.data.get('delivery_date')
#             items          = request.data.get('items', [])
#             if not all(personal_info.values()) or not items:
#                 return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
#             order_data = {**personal_info,
#                           'delivery_date':  delivery_date or self._calculate_delivery_date(),
#                           'status':         request.data.get('status', 'pending'),
#                           'payment_status': request.data.get('payment_status', False)}
#             if customer_id:
#                 try:    order_data['customer'] = User.objects.get(id=customer_id, deleted=False).id
#                 except: return Response({"error": f"Customer {customer_id} not found"}, status=400)
#             if rider_id:
#                 try:    order_data['rider'] = User.objects.get(id=rider_id, deleted=False).id
#                 except: return Response({"error": f"Rider {rider_id} not found"}, status=400)
#             ser = self.serializer_class(data=order_data)
#             if not ser.is_valid():
#                 return Response({"error": "Validation failed", "details": ser.errors}, status=400)
#             with transaction.atomic():
#                 order = ser.save()
#                 bill  = 0
#                 for item in items:
#                     product_type = item.get('product_type')
#                     product_id   = item.get('product_id')
#                     quantity     = item.get('quantity', 1)
#                     if not product_type or not product_id:
#                         raise ValueError("Each item must have product_type and product_id")
#                     unit_price, product = self._get_product_price(product_type, product_id)
#                     total_price = unit_price * quantity
#                     detail_data = {'order': order, 'unit_price': unit_price,
#                                    'quantity': quantity, 'total_price': total_price}
#                     if product_type == 'product':     detail_data['product'] = product
#                     else:                              detail_data['sales_product'] = product
#                     OrderDetail.objects.create(**detail_data)
#                     bill += total_price
#                 order.bill = bill
#                 order.save()
#             return Response({'success': True, 'order_id': order.id,
#                              'bill': float(bill), 'status': order.status}, status=201)
#         except ValueError as e:
#             return Response({"error": str(e)}, status=400)
#         except Exception as e:
#             logger.error(f"Order creation failed: {e}", exc_info=True)
#             return Response({"error": "Failed to create order"}, status=500)

#     @permission_required(['read_order'])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required(['update_order'])
#     def patch(self, request):
#         order_id = request.query_params.get('id') or request.data.get('id')
#         if not order_id:
#             return Response({"error": "Order ID required"}, status=400)
#         try:
#             order = Order.objects.get(id=order_id, deleted=False)
#         except Order.DoesNotExist:
#             return Response({"error": f"Order {order_id} not found"}, status=404)
#         if 'items' in request.data:
#             return self._update_order_items(request, order)
#         return super().patch_(request)

#     def _update_order_items(self, request, order):
#         try:
#             with transaction.atomic():
#                 update_fields = {k: request.data[k] for k in
#                                  ['customer_name', 'customer_email', 'customer_phone',
#                                   'delivery_address', 'city', 'payment_method',
#                                   'delivery_date', 'status', 'payment_status']
#                                  if k in request.data}
#                 for k, v in update_fields.items():
#                     setattr(order, k, v)
#                 items = request.data.get('items', [])
#                 if items:
#                     OrderDetail.objects.filter(order=order).update(deleted=True)
#                     bill = 0
#                     for item in items:
#                         product_type = item.get('product_type')
#                         product_id   = item.get('product_id')
#                         quantity     = item.get('quantity', 1)
#                         unit_price, product = self._get_product_price(product_type, product_id)
#                         total_price = unit_price * quantity
#                         detail      = {'order': order, 'unit_price': unit_price,
#                                        'quantity': quantity, 'total_price': total_price}
#                         if product_type == 'product': detail['product'] = product
#                         else:                          detail['sales_product'] = product
#                         OrderDetail.objects.create(**detail)
#                         bill += total_price
#                     order.bill = bill
#                 order.save()
#             return Response({'success': True, 'order_id': order.id,
#                              'bill': float(order.bill or 0)}, status=200)
#         except Exception as e:
#             return Response({"error": str(e)}, status=500)

#     @permission_required(['delete_order'])
#     def delete(self, request):
#         return super().delete_(request)


# class OrderSearchView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = OrderSerializer
#     filterset_class    = OrderSearchFilter

#     def get(self, request):
#         return super().get_(request)


# class PublicOrderView(BaseView):
#     permission_classes = ()
#     serializer_class   = OrderSerializer

#     def _calculate_delivery_date(self):
#         today = date.today()
#         if today.weekday() in [3, 4]: return today + timedelta(days=4)
#         if today.weekday() == 5:      return today + timedelta(days=3)
#         return today + timedelta(days=2)

#     def _get_product_price(self, product_type, product_id):
#         if product_type == 'product':
#             p = Product.objects.get(id=product_id, deleted=False)
#             return p.price, p
#         p = SalesProduct.objects.get(id=product_id, deleted=False)
#         return p.final_price, p

#     def post(self, request):
#         if 'items' in request.data and any(i.get('product_type') for i in request.data.get('items', [])):
#             return self._create_mixed_order(request)
#         return super().post_(request)

#     def _create_mixed_order(self, request):
#         try:
#             personal_info = {
#                 'customer_name':    request.data.get('customer_name'),
#                 'customer_email':   request.data.get('customer_email'),
#                 'customer_phone':   request.data.get('customer_phone'),
#                 'delivery_address': request.data.get('delivery_address'),
#                 'city':             request.data.get('city'),
#                 'payment_method':   request.data.get('payment_method'),
#             }
#             items = request.data.get('items', [])
#             if not all(personal_info.values()) or not items:
#                 return Response({"error": "Missing required fields"}, status=400)
#             ser = self.serializer_class(data={**personal_info,
#                                               'delivery_date': self._calculate_delivery_date(),
#                                               'status': 'pending', 'payment_status': False})
#             if not ser.is_valid():
#                 return Response({"error": "Validation failed", "details": ser.errors}, status=400)
#             with transaction.atomic():
#                 order = ser.save()
#                 bill  = 0
#                 for item in items:
#                     unit_price, product = self._get_product_price(item.get('product_type'), item.get('product_id'))
#                     qty         = item.get('quantity', 1)
#                     total_price = unit_price * qty
#                     detail      = {'order': order, 'unit_price': unit_price, 'quantity': qty, 'total_price': total_price}
#                     if item.get('product_type') == 'product': detail['product'] = product
#                     else:                                       detail['sales_product'] = product
#                     OrderDetail.objects.create(**detail)
#                     bill += total_price
#                 order.bill = bill
#                 order.save()
#             return Response({'success': True, 'order_id': order.id, 'bill': float(bill)}, status=201)
#         except Exception as e:
#             logger.error(f"Public order failed: {e}", exc_info=True)
#             return Response({"error": str(e)}, status=500)


# # ============================================================================
# # CONTACT VIEWS  (unchanged)
# # ============================================================================

# class ContactView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = ContactSerializer
#     filterset_class    = ContactFilter

#     @permission_required(['read_contact'])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required(['delete_contact'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicContactView(BaseView):
#     permission_classes = ()
#     serializer_class   = ContactSerializer
#     filterset_class    = PublicContactFilter

#     def post(self, request):
#         return super().post_(request)

#     def get(self, request):
#         return super().get_(request)


# # ============================================================================
# # REVIEW VIEWS  (unchanged)
# # ============================================================================

# class ReviewView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = ReviewSerializer
#     filterset_class    = ReviewFilter

#     @permission_required(['create_reviews'])
#     def post(self, request):
#         try:
#             if not request.data.get('product') and not request.data.get('sales_product'):
#                 return Response({'status': 'ERROR', 'message': 'Either product or sales_product ID is required'}, status=400)
#             if request.user.is_authenticated:
#                 request.data["user"] = request.user.id
#             serializer = self.serializer_class(data=request.data, context={'request': request})
#             if serializer.is_valid():
#                 review = serializer.save(created_by=request.user if request.user.is_authenticated else None)
#                 return Response({'status': 'SUCCESS', 'message': 'Review created',
#                                  'data': self.serializer_class(review, context={'request': request}).data}, status=201)
#             return Response({'status': 'ERROR', 'message': get_first_error_message(serializer.errors, "Validation failed"),
#                              'errors': serializer.errors}, status=400)
#         except Exception as e:
#             return Response({'status': 'ERROR', 'message': str(e)}, status=500)

#     @permission_required(['read_reviews'])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required(['update_reviews'])
#     def patch(self, request):
#         try:
#             review_id = request.query_params.get('id')
#             if not review_id:
#                 return Response({'status': 'ERROR', 'message': 'Review ID required'}, status=400)
#             instance = Review.objects.filter(id=review_id, deleted=False).first()
#             if not instance:
#                 return Response({'status': 'ERROR', 'message': 'Review not found'}, status=404)
#             if request.user.is_authenticated and instance.user and instance.user != request.user:
#                 return Response({'status': 'ERROR', 'message': 'You can only update your own reviews'}, status=403)
#             data = request.data.copy()
#             data.pop('product', None)
#             data.pop('sales_product', None)
#             serializer = self.serializer_class(instance, data=data, partial=True, context={'request': request})
#             if serializer.is_valid():
#                 updated = serializer.save(updated_by=request.user if request.user.is_authenticated else None)
#                 return Response({'status': 'SUCCESS', 'data': self.serializer_class(updated, context={'request': request}).data}, status=200)
#             return Response({'status': 'ERROR', 'errors': serializer.errors}, status=400)
#         except Exception as e:
#             return Response({'status': 'ERROR', 'message': str(e)}, status=500)

#     @permission_required(['delete_reviews'])
#     def delete(self, request):
#         try:
#             review_id = request.query_params.get('id')
#             if not review_id:
#                 return Response({'status': 'ERROR', 'message': 'Review ID required'}, status=400)
#             instance = Review.objects.filter(id=review_id, deleted=False).first()
#             if not instance:
#                 return Response({'status': 'ERROR', 'message': 'Review not found'}, status=404)
#             if request.user.is_authenticated and instance.user and instance.user != request.user:
#                 return Response({'status': 'ERROR', 'message': 'You can only delete your own reviews'}, status=403)
#             instance.deleted    = True
#             instance.updated_by = request.user if request.user.is_authenticated else None
#             instance.save()
#             return Response({'status': 'SUCCESS', 'message': 'Review deleted', 'data': {'id': review_id}}, status=200)
#         except Exception as e:
#             return Response({'status': 'ERROR', 'message': str(e)}, status=500)


# class PublicReviewView(BaseView):
#     permission_classes = ()
#     serializer_class   = PublicReviewSerializer
#     filterset_class    = PublicReviewFilter

#     def post(self, request):
#         try:
#             if not request.data.get('product') and not request.data.get('sales_product'):
#                 return Response({'status': 'ERROR', 'message': 'Either product or sales_product ID is required'}, status=400)
#             serializer = ReviewSerializer(data=request.data, context={'request': request})
#             if serializer.is_valid():
#                 review = serializer.save()
#                 return Response({'status': 'SUCCESS', 'data': {
#                     'id': review.id, 'name': review.name, 'comment': review.comment,
#                     'rating': review.rating, 'created_at': review.created_at}}, status=201)
#             return Response({'status': 'ERROR', 'errors': serializer.errors}, status=400)
#         except Exception as e:
#             return Response({'status': 'ERROR', 'message': str(e)}, status=500)

#     def get(self, request):
#         try:
#             product_id       = request.GET.get('product_id') or request.GET.get('product')
#             sales_product_id = request.GET.get('sales_product_id') or request.GET.get('sales_product')
#             if not product_id and not sales_product_id:
#                 return Response({'status': 'ERROR', 'message': 'Either product_id or sales_product_id is required'}, status=400)
#             q = Q(deleted=False)
#             if product_id:       q &= Q(product_id=product_id)
#             if sales_product_id: q &= Q(sales_product_id=sales_product_id)
#             qs = Review.objects.filter(q).order_by('-created_at')
#             filtered         = self.filterset_class(request.GET, queryset=qs).qs
#             paginated, count = paginate_data(filtered, request)
#             return Response({'status': 'SUCCESS', 'data': {'count': count,
#                               'reviews': self.serializer_class(paginated, many=True).data}}, status=200)
#         except Exception as e:
#             return Response({'status': 'ERROR', 'message': str(e)}, status=500)


# # ============================================================================
# # ADDRESS  ── NEW
# # ============================================================================

# class AddressView(BaseView):
#     """
#     Customer manages their own saved addresses.
#     GET    → all addresses for the logged-in user
#     POST   → create new address
#     PATCH  → update address (?id=N)
#     DELETE → soft-delete address (?id=N)
#     """
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = AddressSerializer
#     filterset_class    = AddressFilter

#     def get(self, request):
#         try:
#             if request.query_params.get('id'):
#                 instance = Address.objects.filter(
#                     id=request.query_params.get('id'), user=request.user, deleted=False
#                 ).first()
#                 if not instance:
#                     return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
#                 return Response(create_response(SUCCESSFUL, AddressSerializer(instance).data), status=200)
#             qs = Address.objects.filter(user=request.user, deleted=False).order_by('-is_default', '-created_at')
#             if self.filterset_class:
#                 qs = self.filterset_class(request.GET, queryset=qs).qs
#             paginated, count = paginate_data(qs, request)
#             return Response(create_response(SUCCESSFUL, AddressSerializer(paginated, many=True).data, count), status=200)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)

#     def post(self, request):
#         try:
#             serializer = AddressSerializer(data=request.data, context={'request': request})
#             if serializer.is_valid():
#                 serializer.save(created_by=request.user)
#                 return Response(create_response(SUCCESSFUL, serializer.data), status=201)
#             return Response(create_response(get_first_error(serializer.errors)), status=400)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)

#     def patch(self, request):
#         try:
#             address_id = request.query_params.get('id')
#             if not address_id:
#                 return Response(create_response(ID_NOT_PROVIDED), status=400)
#             instance = Address.objects.filter(id=address_id, user=request.user, deleted=False).first()
#             if not instance:
#                 return Response(create_response(NOT_FOUND), status=404)
#             serializer = AddressSerializer(instance, data=request.data, partial=True, context={'request': request})
#             if serializer.is_valid():
#                 serializer.save(updated_by=request.user)
#                 return Response(create_response(SUCCESSFUL, serializer.data), status=200)
#             return Response(create_response(get_first_error(serializer.errors)), status=400)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)

#     def delete(self, request):
#         try:
#             address_id = request.query_params.get('id')
#             if not address_id:
#                 return Response(create_response(ID_NOT_PROVIDED), status=400)
#             instance = Address.objects.filter(id=address_id, user=request.user, deleted=False).first()
#             if not instance:
#                 return Response(create_response(NOT_FOUND), status=404)
#             instance.deleted    = True
#             instance.updated_by = request.user
#             instance.save()
#             return Response(create_response(SUCCESSFUL, AddressSerializer(instance).data), status=200)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)


# # ============================================================================
# # SHIPPING METHOD  ── NEW
# # ============================================================================

# class ShippingMethodView(BaseView):
#     """Admin CRUD for shipping methods."""
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = ShippingMethodSerializer
#     filterset_class    = ShippingMethodFilter

#     @permission_required(['create_shipping'])
#     def post(self, request):
#         return super().post_(request)

#     @permission_required(['read_shipping'])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required(['update_shipping'])
#     def patch(self, request):
#         return super().patch_(request)

#     @permission_required(['delete_shipping'])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicShippingMethodView(BaseView):
#     """Public listing of active shipping options for checkout page."""
#     permission_classes = ()
#     serializer_class   = ShippingMethodSerializer
#     filterset_class    = ShippingMethodFilter
#     extra_filters      = {'is_active': True}

#     def get(self, request):
#         return super().get_(request)


# # ============================================================================
# # COUPON  ── NEW
# # ============================================================================

# class CouponView(BaseView):
#     """Admin CRUD for coupons."""
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = CouponSerializer
#     filterset_class    = CouponFilter

#     @permission_required(['create_coupon'])
#     def post(self, request):
#         return super().post_(request)

#     @permission_required(['read_coupon'])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required(['update_coupon'])
#     def patch(self, request):
#         return super().patch_(request)

#     @permission_required(['delete_coupon'])
#     def delete(self, request):
#         return super().delete_(request)


# class ValidateCouponView(BaseView):
#     """
#     Customer validates a coupon code at checkout.
#     POST /v1/public/coupon/validate/
#     Body: { "code": "SAVE10", "order_amount": "2500.00" }
#     """
#     permission_classes = ()

#     def post(self, request):
#         try:
#             serializer = ValidateCouponSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(create_response(get_first_error(serializer.errors)), status=400)

#             code         = serializer.validated_data['code']
#             order_amount = serializer.validated_data['order_amount']

#             coupon = Coupon.objects.filter(code__iexact=code, deleted=False, is_active=True).first()
#             if not coupon:
#                 return Response(create_response("Invalid or inactive coupon code"), status=400)

#             now = timezone.now()
#             if now < coupon.valid_from or now > coupon.valid_to:
#                 return Response(create_response("Coupon is not valid at this time"), status=400)

#             if coupon.is_exhausted:
#                 return Response(create_response("Coupon usage limit has been reached"), status=400)

#             if order_amount < coupon.min_order_amount:
#                 return Response(
#                     create_response(f"Minimum order amount for this coupon is Rs.{coupon.min_order_amount}"),
#                     status=400
#                 )

#             discount     = coupon.calculate_discount(order_amount)
#             final_amount = order_amount - discount
#             return Response(create_response(SUCCESSFUL, {
#                 "coupon_code":     coupon.code,
#                 "discount_type":   coupon.discount_type,
#                 "discount_value":  str(coupon.discount_value),
#                 "discount_amount": str(discount),
#                 "final_amount":    str(final_amount),
#             }), status=200)

#         except Exception as e:
#             return Response(create_response(str(e)), status=500)


# # ============================================================================
# # CART  ── NEW
# # ============================================================================

# class CartView(BaseView):
#     """
#     GET    → returns current user's cart with all items
#     DELETE → clears all items from cart
#     """
#     permission_classes = (IsAuthenticated,)

#     def get(self, request):
#         try:
#             cart, _ = Cart.objects.get_or_create(user=request.user)
#             return Response(create_response(SUCCESSFUL, CartSerializer(cart).data), status=200)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)

#     def delete(self, request):
#         """Clear entire cart."""
#         try:
#             cart = Cart.objects.filter(user=request.user).first()
#             if cart:
#                 cart.items.filter(deleted=False).update(deleted=True)
#             return Response(create_response(SUCCESSFUL), status=200)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)


# class CartItemView(BaseView):
#     """
#     POST   → add item to cart (increments quantity if same item exists)
#     PATCH  → update item quantity (?id=N)
#     DELETE → remove item from cart (?id=N)
#     """
#     permission_classes = (IsAuthenticated,)

#     def post(self, request):
#         try:
#             cart, _ = Cart.objects.get_or_create(user=request.user)
#             data    = request.data.copy()

#             product_variant_id = data.get('product_variant')
#             sales_product_id   = data.get('sales_product')

#             # Increment quantity if same item already in cart
#             existing = cart.items.filter(
#                 product_variant=product_variant_id,
#                 sales_product=sales_product_id,
#                 deleted=False
#             ).first()
#             if existing:
#                 existing.quantity += int(data.get('quantity', 1))
#                 existing.save()
#                 return Response(create_response(SUCCESSFUL, CartItemSerializer(existing).data), status=200)

#             data['cart'] = cart.id
#             serializer   = CartItemSerializer(data=data)
#             if serializer.is_valid():
#                 item = serializer.save(created_by=request.user)
#                 return Response(create_response(SUCCESSFUL, CartItemSerializer(item).data), status=201)
#             return Response(create_response(get_first_error(serializer.errors)), status=400)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)

#     def patch(self, request):
#         try:
#             item_id = request.query_params.get('id')
#             if not item_id:
#                 return Response(create_response(ID_NOT_PROVIDED), status=400)
#             cart = Cart.objects.filter(user=request.user).first()
#             if not cart:
#                 return Response(create_response(NOT_FOUND), status=404)
#             item = cart.items.filter(id=item_id, deleted=False).first()
#             if not item:
#                 return Response(create_response(NOT_FOUND), status=404)
#             new_qty = request.data.get('quantity')
#             if new_qty is not None:
#                 if int(new_qty) <= 0:
#                     item.deleted = True
#                     item.save()
#                     return Response(create_response(SUCCESSFUL), status=200)
#                 item.quantity    = int(new_qty)
#                 item.updated_by  = request.user
#                 item.save()
#             return Response(create_response(SUCCESSFUL, CartItemSerializer(item).data), status=200)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)

#     def delete(self, request):
#         try:
#             item_id = request.query_params.get('id')
#             if not item_id:
#                 return Response(create_response(ID_NOT_PROVIDED), status=400)
#             cart = Cart.objects.filter(user=request.user).first()
#             if not cart:
#                 return Response(create_response(NOT_FOUND), status=404)
#             item = cart.items.filter(id=item_id, deleted=False).first()
#             if not item:
#                 return Response(create_response(NOT_FOUND), status=404)
#             item.deleted    = True
#             item.updated_by = request.user
#             item.save()
#             return Response(create_response(SUCCESSFUL), status=200)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)


# # ============================================================================
# # WISHLIST  ── NEW
# # ============================================================================

# class WishlistView(BaseView):
#     """GET → returns current user's wishlist with all items."""
#     permission_classes = (IsAuthenticated,)

#     def get(self, request):
#         try:
#             wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
#             return Response(create_response(SUCCESSFUL, WishlistSerializer(wishlist).data), status=200)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)


# class WishlistItemView(BaseView):
#     """
#     POST   → add item to wishlist (rejects duplicate)
#     DELETE → remove item from wishlist (?id=N)
#     """
#     permission_classes = (IsAuthenticated,)

#     def post(self, request):
#         try:
#             wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
#             product_id       = request.data.get('product')
#             sales_product_id = request.data.get('sales_product')

#             # Prevent duplicates
#             if wishlist.items.filter(
#                 product=product_id,
#                 sales_product=sales_product_id,
#                 deleted=False
#             ).exists():
#                 return Response(create_response("Item already in wishlist"), status=400)

#             data             = request.data.copy()
#             data['wishlist'] = wishlist.id
#             serializer       = WishlistItemSerializer(data=data)
#             if serializer.is_valid():
#                 item = serializer.save(created_by=request.user)
#                 return Response(create_response(SUCCESSFUL, WishlistItemSerializer(item).data), status=201)
#             return Response(create_response(get_first_error(serializer.errors)), status=400)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)

#     def delete(self, request):
#         try:
#             item_id = request.query_params.get('id')
#             if not item_id:
#                 return Response(create_response(ID_NOT_PROVIDED), status=400)
#             wishlist = Wishlist.objects.filter(user=request.user).first()
#             if not wishlist:
#                 return Response(create_response(NOT_FOUND), status=404)
#             item = wishlist.items.filter(id=item_id, deleted=False).first()
#             if not item:
#                 return Response(create_response(NOT_FOUND), status=404)
#             item.deleted    = True
#             item.updated_by = request.user
#             item.save()
#             return Response(create_response(SUCCESSFUL), status=200)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)


# # ============================================================================
# # PAYMENT  ── NEW
# # ============================================================================

# class PaymentView(BaseView):
#     """
#     Admin views and updates payment records.
#     GET   → list/retrieve payments
#     PATCH → update payment status (?id=N)
#     """
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = PaymentSerializer
#     filterset_class    = PaymentFilter

#     @permission_required(['read_payment'])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required(['update_payment'])
#     def patch(self, request):
#         return super().patch_(request)


# # ============================================================================
# # RETURN REQUEST  ── NEW
# # ============================================================================

# class ReturnRequestView(BaseView):
#     """
#     POST  → customer submits a return request
#     GET   → admin lists all return requests (with filters)
#     PATCH → admin approves / rejects (?id=N)
#     """
#     permission_classes = (IsAuthenticated,)
#     serializer_class   = ReturnRequestSerializer
#     filterset_class    = ReturnRequestFilter

#     def post(self, request):
#         """Any authenticated customer can submit a return request."""
#         try:
#             serializer = ReturnRequestSerializer(data=request.data)
#             if serializer.is_valid():
#                 instance = serializer.save(created_by=request.user)
#                 return Response(create_response(SUCCESSFUL, ReturnRequestSerializer(instance).data), status=201)
#             return Response(create_response(get_first_error(serializer.errors)), status=400)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)

#     @permission_required(['read_return'])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required(['update_return'])
#     def patch(self, request):
#         """Admin reviews (approves / rejects) a return request."""
#         try:
#             return_id = request.query_params.get('id')
#             if not return_id:
#                 return Response(create_response(ID_NOT_PROVIDED), status=400)
#             instance = ReturnRequest.objects.filter(id=return_id, deleted=False).first()
#             if not instance:
#                 return Response(create_response(NOT_FOUND), status=404)
#             data = request.data.copy()
#             # Admin marks themselves as reviewer
#             data['reviewed_by'] = request.user.id
#             serializer = ReturnRequestSerializer(instance, data=data, partial=True)
#             if serializer.is_valid():
#                 updated = serializer.save(updated_by=request.user)
#                 return Response(create_response(SUCCESSFUL, ReturnRequestSerializer(updated).data), status=200)
#             return Response(create_response(get_first_error(serializer.errors)), status=400)
#         except Exception as e:
#             return Response(create_response(str(e)), status=500)







"""
E-commerce Views
All new views follow the same BaseView patterns already used in the project.
Existing views are untouched — new views for Address, ShippingMethod, Coupon,
Cart, Wishlist, Payment, and ReturnRequest are added below.

FIXES applied in this pass (search "FIX:"):
1. ReturnRequestView.post() — SECURITY: previously any authenticated user
   could submit a return request for ANY order by just supplying someone
   else's order id. Now the order must belong to request.user (or the user
   must be staff), otherwise it's rejected with a 403.
2. CartItemView.post() — the "increment existing item" fast path bypassed
   the serializer entirely, so it never checked stock/active status. Now it
   checks stock_quantity before incrementing, matching the validation that
   already happens on the "create new item" path via CartItemSerializer.
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
    ReviewSerializer, PublicReviewSerializer, SalesProductColorSerializer,
    SalesProductVariantSerializer, SalesInventorySerializer,
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
    OrderSearchFilter, ContactFilter, PublicContactFilter, SalesInventoryFilter,
    ReviewFilter, PublicReviewFilter, SalesProductColorFilter, SalesProductVariantFilter,
    AddressFilter, ShippingMethodFilter, CouponFilter, PublicSalesProductVariantFilter,
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


# ============================================================================
# SALES PRODUCT COLOR VIEWS
# ============================================================================

class SalesProductColorView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = SalesProductColorSerializer
    filterset_class    = SalesProductColorFilter

    @permission_required(['create_sales_productcolor'])
    def post(self, request):
        return super().post_(request)

    @permission_required(['read_sales_productcolor'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_sales_productcolor'])
    def patch(self, request):
        return super().patch_(request)

    @permission_required(['delete_sales_productcolor'])
    def delete(self, request):
        return super().delete_(request)


# ============================================================================
# SALES PRODUCT VARIANT VIEWS
# ============================================================================

class SalesProductVariantView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = SalesProductVariantSerializer
    filterset_class    = SalesProductVariantFilter

    @permission_required(['create_sales_productvariant'])
    def post(self, request):
        return super().post_(request)

    @permission_required(['read_sales_productvariant'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_sales_productvariant'])
    def patch(self, request):
        return super().patch_(request)

    @permission_required(['delete_sales_productvariant'])
    def delete(self, request):
        return super().delete_(request)


class PublicSalesProductVariantView(BaseView):
    permission_classes = ()
    serializer_class   = SalesProductVariantSerializer
    filterset_class    = PublicSalesProductVariantFilter
    extra_filters      = {'is_active': True}

    def get(self, request):
        return super().get_(request)


# ============================================================================
# SALES INVENTORY VIEWS
# ============================================================================

class SalesInventoryView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = SalesInventorySerializer
    filterset_class    = SalesInventoryFilter

    @permission_required(['create_sales_inventory'])
    def post(self, request):
        return super().post_(request)

    @permission_required(['read_sales_inventory'])
    def get(self, request):
        return super().get_(request)

    @permission_required(['update_sales_inventory'])
    def patch(self, request):
        return super().patch_(request)

    @permission_required(['delete_sales_inventory'])
    def delete(self, request):
        return super().delete_(request)


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
# ADDRESS
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
# SHIPPING METHOD
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
# COUPON
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
# CART
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
                added_qty  = int(data.get('quantity', 1))
                new_total  = existing.quantity + added_qty

                # FIX: this fast path used to skip validation entirely and
                # just increment the quantity, so it could push a cart item
                # past available stock. Now it checks stock the same way
                # CartItemSerializer.validate() does for brand-new items.
                if existing.product_variant:
                    variant = existing.product_variant
                    if variant.deleted or not variant.is_active:
                        return Response(create_response("This product variant is no longer available"), status=400)
                    if new_total > variant.stock_quantity:
                        return Response(
                            create_response(f"Only {variant.stock_quantity} unit(s) available in stock"),
                            status=400
                        )

                existing.quantity = new_total
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
                new_qty = int(new_qty)
                if new_qty <= 0:
                    item.deleted = True
                    item.save()
                    return Response(create_response(SUCCESSFUL), status=200)
                # FIX: quantity updates via PATCH also skipped the stock check.
                if item.product_variant and new_qty > item.product_variant.stock_quantity:
                    return Response(
                        create_response(f"Only {item.product_variant.stock_quantity} unit(s) available in stock"),
                        status=400
                    )
                item.quantity    = new_qty
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
# WISHLIST
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
# PAYMENT
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
# RETURN REQUEST
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
        """Authenticated customers can submit a return request — for THEIR OWN orders only."""
        try:
            order_id = request.data.get('order')
            if not order_id:
                return Response(create_response("order is required"), status=400)

            order = Order.objects.filter(id=order_id, deleted=False).first()
            if not order:
                return Response(create_response(NOT_FOUND), status=404)

            # FIX — SECURITY: previously any authenticated user could submit a
            # return request for ANY order by supplying its id, because there
            # was no check that the order actually belonged to them. Now we
            # require the order to belong to the requesting user unless
            # they're staff (staff/admin may file returns on a customer's
            # behalf, e.g. over the phone).
            if order.customer_id != request.user.id and not request.user.is_staff:
                return Response(create_response("You can only request returns for your own orders"), status=403)

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
            data['reviewed_by'] = request.user.id
            serializer = ReturnRequestSerializer(instance, data=data, partial=True)
            if serializer.is_valid():
                updated = serializer.save(updated_by=request.user)
                return Response(create_response(SUCCESSFUL, ReturnRequestSerializer(updated).data), status=200)
            return Response(create_response(get_first_error(serializer.errors)), status=400)
        except Exception as e:
            return Response(create_response(str(e)), status=500)