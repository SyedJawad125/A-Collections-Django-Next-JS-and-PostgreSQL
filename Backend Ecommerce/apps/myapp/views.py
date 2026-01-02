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
from utils.helpers import create_response, get_first_error, paginate_data, get_first_error_message
from utils.response_messages import ID_NOT_PROVIDED, NOT_FOUND, SUCCESSFUL, UNSUCCESSFUL

from .models import (
    Category, Product, ProductImage, ProductTag, Color, ProductVariant,
    Inventory, SalesProduct, Order, OrderDetail, Contact, Review, SalesProductImage
)

from .serializers import (
    ProductSerializer, ColorSerializer, ProductVariantSerializer,
    InventorySerializer, PubliccategorywiseSerializer, SalesProductSerializer, CategorySerializer,
    ProductTagSerializer, OrderSerializer, ContactSerializer,
    ReviewSerializer, PublicReviewSerializer
)

from .filters import (
    ProductFilter, PublicProductFilter, ProductDropdownFilter,
    ColorFilter, ProductVariantFilter, PublicProductVariantFilter,
    InventoryFilter, PubliccategorywiseFilter, SalesProductFilter, PublicSalesProductFilter,
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
            data["updated_by"] = request.user.id

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
            if 'original_price' not in request.data:
                return Response({"error": "original_price field is required"}, status=400)

            data = request.data.copy()
            
            # Validate category if provided
            # category_id = data.get('salesprod_has_category')
            # if category_id:
            #     try:
            #         category = Category.objects.get(id=category_id, deleted=False)
            #         data['salesprod_has_category'] = category.id
            #     except Category.DoesNotExist:
            #         return Response(
            #             {"error": f"Category with ID {category_id} not found or deleted"}, 
            #             status=400
            #         )

            serializer = SalesProductSerializer(data=data)
            if not serializer.is_valid():
                return Response({"error": "Validation failed", "details": serializer.errors}, status=400)

            product = serializer.save(created_by=request.user)

            images = request.FILES.getlist('images')
            if len(images) > 5:
                return Response({'error': 'You can upload a maximum of 5 images.'}, status=400)

            for img in images:
                SalesProductImage.objects.create(
                    sale_product=product,
                    images=img,
                    created_by=request.user
                )

            response_data = SalesProductSerializer(product).data
            return Response({"success": True, "data": response_data}, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
    @permission_required(['read_sales_product'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_sales_product'])
    def patch(self, request):
        try:
            # ID must come from query params (BaseView standard)
            product_id = request.query_params.get('id')
            if not product_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)

            product = SalesProduct.objects.filter(deleted=False, id=product_id).first()
            if not product:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)

            data = request.data.copy()
            
            # Handle category update
            # category_id = data.get('salesprod_has_category')
            # if category_id:
            #     try:
            #         category = Category.objects.get(id=category_id, deleted=False)
            #         data['salesprod_has_category'] = category.id
            #     except Category.DoesNotExist:
            #         return Response(
            #             create_response(f"Category with ID {category_id} not found or deleted"),
            #             status=status.HTTP_400_BAD_REQUEST
            #         )
            # elif 'salesprod_has_category' in data and data['salesprod_has_category'] in [None, 'null', '']:
            #     # Allow removing category by sending null
            #     data['salesprod_has_category'] = None

            serializer = SalesProductSerializer(
                product,
                data=data,
                partial=True,
                context={'request': request, 'id': product.id}
            )

            if not serializer.is_valid():
                return Response(
                    create_response(get_first_error(serializer.errors)),
                    status=status.HTTP_400_BAD_REQUEST
                )

            product_instance = serializer.save(updated_by=request.user)

            # ---------- Handle New Images ----------
            uploaded_images = request.FILES.getlist('images')
            
            # ---------- Handle Deleted Images ----------
            deleted_ids = []
            if request.data.get("deleted_images"):
                deleted_ids = [int(i) for i in request.data["deleted_images"].split(",") if i.strip().isdigit()]
            
            # **FIX: Count existing images BEFORE deletion, then validate**
            existing_count = SalesProductImage.objects.filter(sale_product=product_instance).count()
            final_count = existing_count - len(deleted_ids) + len(uploaded_images)
            
            if final_count > 5:
                return Response(
                    create_response(f"Total images cannot exceed 5. Current: {existing_count}, Deleting: {len(deleted_ids)}, Adding: {len(uploaded_images)}, Result: {final_count}"),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Now perform the actual deletion
            if deleted_ids:
                SalesProductImage.objects.filter(id__in=deleted_ids, sale_product=product_instance).delete()

            # Add new images
            for img in uploaded_images:
                SalesProductImage.objects.create(
                    sale_product=product_instance,
                    images=img,
                    created_by=request.user
                )

            response_data = SalesProductSerializer(product_instance, context={'request': request}).data
            response_data.update({
                'message': 'Sales Product updated successfully',
                'images_uploaded': len(uploaded_images),
                'images_deleted': len(deleted_ids),
                'total_images': SalesProductImage.objects.filter(sale_product=product_instance).count()
            })

            return Response(create_response(SUCCESSFUL, response_data), status=status.HTTP_200_OK)

        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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



import logging

logger = logging.getLogger(__name__)


class PublicOrderView(BaseView):
    """
    Public order creation - CUSTOM: Mixed order logic
    """
    permission_classes = ()
    serializer_class = OrderSerializer

    def _calculate_delivery_date(self):
        """Calculate delivery date based on current day"""
        today = date.today()
        if today.weekday() in [3, 4]:  # Thursday, Friday
            return today + timedelta(days=4)
        elif today.weekday() == 5:  # Saturday
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
        
        # Simple order - use BaseView (FIXED TYPO: was post_)
        return super().post(request)
    
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
            
            # Validate required fields
            if not all(personal_info.values()) or not items:
                return Response(
                    {
                        "error": "Missing required fields",
                        "message": "Please provide all customer information and at least one item"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            order_data = {
                **personal_info,
                'delivery_date': self._calculate_delivery_date(),
                'status': 'pending',
                'payment_status': False
            }
            
            # Validate order data
            serialized_data = self.serializer_class(data=order_data)
            if not serialized_data.is_valid():
                return Response(
                    {
                        "error": "Validation failed",
                        "details": serialized_data.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create order and order details in transaction
            with transaction.atomic():
                order = serialized_data.save()
                bill = 0
                order_items = []
                
                for item in items:
                    product_type = item.get('product_type')
                    product_id = item.get('product_id')
                    quantity = item.get('quantity', 1)
                    
                    # Validate item data
                    if not product_type or not product_id:
                        raise ValueError("Each item must have product_type and product_id")
                    
                    if quantity < 1:
                        raise ValueError(f"Invalid quantity {quantity} for item")
                    
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
                        
                    except Product.DoesNotExist:
                        raise ValueError(f"Product with id {product_id} not found")
                    except SalesProduct.DoesNotExist:
                        raise ValueError(f"Sales product with id {product_id} not found")
                
                # Update order with total bill
                order.bill = bill
                order.save()

                # Prepare response
                response_data = {
                    'success': True,
                    'message': 'Order created successfully',
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
                        'items_count': len(order_items),
                        'subtotal': float(bill),
                        'total': float(bill)
                    },
                    'payment_method': order.payment_method,
                    'payment_status': order.payment_status,
                    'status': order.status
                }

                return Response(response_data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response(
                {
                    "error": "Validation error",
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Order creation failed: {str(e)}", exc_info=True)
            return Response(
                {
                    "error": "Internal server error",
                    "message": "Failed to create order. Please try again later."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
        

class PubliccategorywiseView(BaseView):
    permission_classes = ()
    serializer_class = PubliccategorywiseSerializer
    filterset_class = PubliccategorywiseFilter


    def get(self, request, pk=None):
        try:
            if pk is not None:
                # Fetch single category by ID
                instance = self.serializer_class.Meta.model.objects.filter(pk=pk).first()
                if not instance:
                    return Response({'error': 'Category not found'}, status=404)

                serialized_data = self.serializer_class(instance).data
                return create_response(serialized_data, "SUCCESSFUL", 200)

            # Fetch all categories (paginated)
            instances = self.serializer_class.Meta.model.objects.all()
            filtered_data = self.filterset_class(request.GET, queryset=instances)
            data = filtered_data.qs

            paginated_data, count = paginate_data(data, request)
            serialized_data = self.serializer_class(paginated_data, many=True).data

            response_data = {
                "count": count,
                "data": serialized_data,
            }
            return create_response(response_data, "SUCCESSFUL", 200)

        except Exception as e:
            import traceback
            print("Error in get_publiccategory:", str(e))
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)