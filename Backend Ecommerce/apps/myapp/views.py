from fastapi import Response
from rest_framework import status
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from apps.myapp.models import Category
from utils.decorator import permission_required
from utils.base_api import BaseView
from utils.helpers import create_response, paginate_data
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from venv import logger
from .serializers import (
    ProductSerializer, ColorSerializer, ProductVariantSerializer, InventorySerializer,
    SalesProductSerializer, CategorySerializer, ProductTagSerializer, OrderSerializer,
    ContactSerializer, EmployeeSerializer, ReviewSerializer, PublicReviewSerializer
)
from .filters import (
    ProductFilter, ColorFilter, ProductVariantFilter, InventoryFilter, PublicCategoryFilter,
    SalesProductFilter, CategoryFilter, ProductTagFilter, OrderFilter,
    ContactFilter, ReviewFilter
)


# Product related views
class ProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ProductSerializer
    filterset_class = ProductFilter
    
    @permission_required(['create_product'])
    def post(self, request):
        return super().post_(request)
    
    @permission_required(['read_product'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_product'])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required(['delete_product'])
    def delete(self, request):
        return super().delete_(request)

class PublicProductView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = ProductSerializer
    filterset_class = ProductFilter
    
    def get_publicproduct(self, request):
        try:
            # Get all instances
            instances = self.serializer_class.Meta.model.objects.all()
            
            # Apply filters
            filtered_data = self.filterset_class(request.GET, queryset=instances)
            data = filtered_data.qs
            
            # Get pagination parameters from request
            page = request.GET.get('page', 1)
            limit = request.GET.get('limit', 24)  # Default limit 16 items per page
            offset = request.GET.get('offset', 0)  # Default offset 0
            
            try:
                page = int(page)
                limit = int(limit)
                offset = int(offset)
            except ValueError:
                return create_response(
                    {"error": "Invalid pagination parameters. Page, limit and offset must be integers."},
                    "BAD_REQUEST",
                    400
                )
            
            # Apply offset and limit
            if offset > 0:
                data = data[offset:]
            
            paginator = Paginator(data, limit)
            
            try:
                paginated_data = paginator.page(page)
            except EmptyPage:
                return create_response(
                    {"error": "Page not found"},
                    "NOT_FOUND",
                    404
                )
            
            serialized_data = self.serializer_class(paginated_data, many=True).data
            
            response_data = {
                "count": paginator.count,
                "total_pages": paginator.num_pages,
                "current_page": page,
                "limit": limit,
                "offset": offset,
                "next": paginated_data.has_next(),
                "previous": paginated_data.has_previous(),
                "data": serialized_data,
            }
            
            return create_response(response_data, "SUCCESSFUL", 200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
class SliderProductView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = ProductSerializer
    filterset_class = ProductFilter
    
    def get_sliderproduct(self, request):
        try:

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
            return Response({'error': str(e)}, 500)

class DropDownListProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ProductSerializer
    filterset_class = ProductFilter
    
    def get_dropdownlistproduct(self, request):
        try:

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
            return Response({'error': str(e)}, 500)

# Color View
class ColorView(BaseView):
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

# Product Variant View
class ProductVariantView(BaseView):
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

# Inventory View
class InventoryView(BaseView):
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

# Sales Product View
class SalesProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = SalesProductSerializer
    filterset_class = SalesProductFilter
    
    @permission_required(['create_sales_product'])
    def post(self, request):
        return super().post_(request)
    
    @permission_required(['read_sales_product'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_sales_product'])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required(['delete_sales_product'])
    def delete(self, request):
        return super().delete_(request)

class PublicSalesProductView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = SalesProductSerializer
    filterset_class = SalesProductFilter
    
    def get_publicsalesproduct(self, request):
        try:
            # Get all instances and apply filters
            instances = self.serializer_class.Meta.model.objects.all()
            filtered_data = self.filterset_class(request.GET, queryset=instances)
            queryset = filtered_data.qs

            # Get and validate pagination parameters
            page = request.GET.get('page', 1)
            limit = request.GET.get('limit', 12)
            offset = request.GET.get('offset', 0)

            try:
                page = int(page)
                limit = int(limit)
                offset = int(offset)
                
                # Validate parameter ranges
                if page < 1:
                    page = 1
                if limit < 1:
                    limit = 12
                if limit > 100:  # Prevent excessive server load
                    limit = 100
                if offset < 0:
                    offset = 0
                    
            except (ValueError, TypeError):
                return create_response(
                    {"error": "Invalid pagination parameters. Page, limit and offset must be valid integers."},
                    "BAD_REQUEST",
                    400
                )

            # Get total count before applying offset
            total_count = queryset.count()
            
            # Apply offset if specified
            if offset > 0:
                # Ensure offset doesn't exceed total count
                if offset >= total_count:
                    return create_response(
                        {
                            "count": 0,
                            "total_count": total_count,
                            "total_pages": 0,
                            "current_page": 1,
                            "limit": limit,
                            "offset": offset,
                            "next": False,
                            "previous": False,
                            "data": [],
                            "message": "Offset exceeds total number of records"
                        },
                        "SUCCESSFUL",
                        200
                    )
                queryset = queryset[offset:]

            # Get count after offset for pagination calculation
            remaining_count = queryset.count()
            
            # Create paginator
            paginator = Paginator(queryset, limit)

            try:
                paginated_data = paginator.page(page)
            except PageNotAnInteger:
                # If page is not an integer, deliver first page
                paginated_data = paginator.page(1)
                page = 1
            except EmptyPage:
                # If page is out of range, deliver last page or return empty if no pages
                if paginator.num_pages > 0:
                    paginated_data = paginator.page(paginator.num_pages)
                    page = paginator.num_pages
                else:
                    return create_response(
                        {
                            "count": 0,
                            "total_count": total_count,
                            "total_pages": 0,
                            "current_page": 1,
                            "limit": limit,
                            "offset": offset,
                            "next": False,
                            "previous": False,
                            "data": [],
                            "message": "No data available"
                        },
                        "SUCCESSFUL",
                        200
                    )

            # Serialize the paginated data
            serialized_data = self.serializer_class(paginated_data, many=True).data

            # Calculate actual start and end indices for display
            start_index = ((page - 1) * limit) + 1 + offset
            end_index = min(page * limit + offset, total_count)

            # Prepare comprehensive response data
            response_data = {
                "count": remaining_count,  # Count after offset
                "total_count": total_count,  # Original total count
                "total_pages": paginator.num_pages,
                "current_page": page,
                "limit": limit,
                "offset": offset,
                "next": paginated_data.has_next(),
                "previous": paginated_data.has_previous(),
                "start_index": start_index,
                "end_index": end_index,
                "data": serialized_data,
                "pagination_info": {
                    "has_data": len(serialized_data) > 0,
                    "items_in_current_page": len(serialized_data),
                    "is_first_page": page == 1,
                    "is_last_page": page == paginator.num_pages,
                }
            }

            return create_response(response_data, "SUCCESSFUL", 200)

        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error in get_publicsalesproduct: {str(e)}", exc_info=True)
            
            return create_response(
                {
                    "error": "An error occurred while fetching products",
                    "details": str(e) if hasattr(settings, 'DEBUG') and settings.DEBUG else None
                },
                "INTERNAL_SERVER_ERROR",
                500
            )

class DropDownListSalesProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = SalesProductSerializer
    filterset_class = SalesProductFilter
    
    def get_dropdownlistsalesproduct(self, request):
        try:

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
            return Response({'error': str(e)}, 500)

# Category View
class CategoryView(BaseView):
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

# Product Tag View
class ProductTagView(BaseView):
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

class PublicCategoryView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    
    def get_publiccategory(self, request):
        try:
            # Get all instances
            instances = self.serializer_class.Meta.model.objects.all()
            
            # Apply filters
            filtered_data = self.filterset_class(request.GET, queryset=instances)
            data = filtered_data.qs
            
            # Get pagination parameters from request
            page = request.GET.get('page', 1)
            limit = request.GET.get('limit', 24)  # Default limit 16 items per page
            offset = request.GET.get('offset', 0)  # Default offset 0
            
            try:
                page = int(page)
                limit = int(limit)
                offset = int(offset)
            except ValueError:
                return create_response(
                    {"error": "Invalid pagination parameters. Page, limit and offset must be integers."},
                    "BAD_REQUEST",
                    400
                )
            
            # Apply offset and limit
            if offset > 0:
                data = data[offset:]
            
            paginator = Paginator(data, limit)
            
            try:
                paginated_data = paginator.page(page)
            except EmptyPage:
                return create_response(
                    {"error": "Page not found"},
                    "NOT_FOUND",
                    404
                )
            
            serialized_data = self.serializer_class(paginated_data, many=True).data
            
            response_data = {
                "count": paginator.count,
                "total_pages": paginator.num_pages,
                "current_page": page,
                "limit": limit,
                "offset": offset,
                "next": paginated_data.has_next(),
                "previous": paginated_data.has_previous(),
                "data": serialized_data,
            }
            
            return create_response(response_data, "SUCCESSFUL", 200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)

class PublicCategoryWiseView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    
    def get_publiccategorywise(self, request, pk=None):
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

class DropDownListCategoryView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    
    def get_dropdownlistcategory(self, request):
        try:

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
            return Response({'error': str(e)}, 500)

class SliderCategoryView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    
    def get_slidercategory(self, request):
        try:

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
            return Response({'error': str(e)}, 500)

# Order View
class OrderView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = OrderSerializer
    filterset_class = OrderFilter
    
    @permission_required(['create_order'])
    def post(self, request):
        if 'cart_items' in request.data:
            return self.controller.checkout(request)
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

class TextBoxOrderView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = OrderSerializer
    filterset_class = OrderFilter
    
    def get_textboxorder(self, request):
        try:
            order_id = request.query_params.get('id')

            # If ID is provided, return a single order
            if order_id:
                instance = self.serializer_class.Meta.model.objects.filter(id=order_id).first()
                if not instance:
                    return Response({'error': 'Order not found'}, status=404)
                
                serialized_data = self.serializer_class(instance).data
                return create_response(serialized_data, "SUCCESSFUL", 200)

            # Else return paginated list
            instances = self.serializer_class.Meta.model.objects.all()
            filtered_data = self.filterset_class(request.query_params, queryset=instances)
            data = filtered_data.qs

            paginated_data, count = paginate_data(data, request)
            serialized_data = self.serializer_class(paginated_data, many=True).data

            return create_response({
                "count": count,
                "data": serialized_data,
            }, "SUCCESSFUL", 200)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

class PublicOrderView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
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
        """
        Helper method to get price based on product type
        Returns: (price, product) tuple
        """
        if product_type == 'product':
            product = Product.objects.get(id=product_id)
            return product.price, product
        elif product_type == 'sales_product':
            sales_product = SalesProduct.objects.get(id=product_id)
            return sales_product.final_price, sales_product
        else:
            raise ValueError(f"Invalid product type: {product_type}")

    def create_mixed_order(self, request):
        """
        Handles order creation with both regular and sales products
        - Takes user personal info
        - Takes list of items with product_type (product/sales_product), product_id, and quantity
        - Calculates prices from respective tables
        - Returns order summary with calculated totals
        """
        try:
            # Extract data from request
            personal_info = {
                'customer_name': request.data.get('customer_name'),
                'customer_email': request.data.get('customer_email'),
                'customer_phone': request.data.get('customer_phone'),
                'delivery_address': request.data.get('delivery_address'),
                'city': request.data.get('city'), 
                'payment_method': request.data.get('payment_method'),
            }
            
            # Get product selections (list of {product_type, product_id, quantity})
            items = request.data.get('items', [])
            
            # Validate required fields
            if not all(personal_info.values()) or not items:
                return create_response(
                    {},
                    "Missing required fields (personal info or items)",
                    400
                )
            
            # Prepare order data
            order_data = {
                **personal_info,
                'delivery_date': self._calculate_delivery_date(),
                'status': 'pending',
                'payment_status': False
            }
            
            # Validate order data
            serialized_data = self.serializer_class(data=order_data)
            if not serialized_data.is_valid():
                return create_response(
                    {}, 
                    get_first_error_message(serialized_data.errors, UNSUCCESSFUL),
                    400
                )
            
            # Process order with transaction
            with transaction.atomic():
                order = serialized_data.save()
                bill = 0
                order_items = []
                
                # Process each item
                for item in items:
                    product_type = item.get('product_type')
                    product_id = item.get('product_id')
                    quantity = item.get('quantity', 1)
                    
                    try:
                        # Get price and product based on type
                        unit_price, product = self._get_product_price(product_type, product_id)
                        total_price = unit_price * quantity
                        
                        # Prepare order detail data based on product type
                        order_detail_data = {
                            'order': order,
                            'unit_price': unit_price,
                            'quantity': quantity,
                            'total_price': total_price
                        }
                        
                        # Set the appropriate product field based on type
                        if product_type == 'product':
                            order_detail_data['product'] = product
                        else:
                            order_detail_data['sales_product'] = product
                        
                        # Create order detail with all fields at once
                        order_detail = OrderDetail.objects.create(**order_detail_data)
                        
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
                        return create_response(
                            {},
                            f"{product_type.replace('_', ' ').title()} with id {product_id} not found",
                            404
                        )
                    except Exception as e:
                        return create_response(
                            {},
                            f"Error processing {product_type} {product_id}: {str(e)}",
                            400
                        )
                
                # Update order total
                order.bill = bill
                order.save()

                # Prepare detailed response
                response_data = {
                    'order_id': order.id,
                    'customer_info': {
                        'name': order.customer_name,
                        'email': order.customer_email,
                        'phone': order.customer_phone
                    },
                    'delivery_info': {
                        'address': order.delivery_address,
                        'city': order.city if hasattr(order, 'city') else None,
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

        except Exception as e:
            import traceback
            logger.error(f"Order creation failed: {str(e)}\n{traceback.format_exc()}")
            return create_response(
                {'error': str(e)},
                UNSUCCESSFUL,
                500
            )
    
    def post(self, request):
        if 'cart_items' in request.data:
            return self.controller.checkout(request)
        elif 'items' in request.data and any(item.get('product_type') for item in request.data.get('items', [])):
            return self.controller.create_mixed_order(request)
        else:
            return self.controller.create_order_with_products(request)

# Contact View
class ContactView(BaseView):
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
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = ContactSerializer
    
    def post(self, request):
        return super().post_(request)
    
    def get_publiccontact(self, request):
        try:

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
            return Response({'error': str(e)}, 500)


class ReviewController:
    serializer_class = ReviewSerializer
    filterset_class = ReviewFilter

    def create(self, request):
        try:
            # Make request data mutable if needed
            if hasattr(request.data, '_mutable'):
                request.data._mutable = True
            
            # Check if either product or sales_product is provided
            product_id = request.data.get('product')
            sales_product_id = request.data.get('sales_product')

            if not product_id and not sales_product_id:
                return Response({
                    'status': 'ERROR',
                    'message': 'Either product or sales_product ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate product exists if provided
            if product_id:
                product = get_object_or_404(Product, id=product_id)
            if sales_product_id:
                sales_product = get_object_or_404(SalesProduct, id=sales_product_id)

            # Set created_by if user is authenticated
            if request.user.is_authenticated:
                request.data["user"] = request.user.guid
            
            # Validate and save
            serializer = self.serializer_class(data=request.data, context={'request': request})
            if serializer.is_valid():
                review = serializer.save()
                
                # Return enriched response data
                response_data = self.serializer_class(review).data
                
                # Enhance the response with product/sales_product details
                enhanced_data = {
                    **response_data,
                    'product': {
                        'id': review.product.id if review.product else None,
                        'name': review.product.name if review.product else None
                    } if review.product else None,
                    'sales_product': {
                        'id': review.sales_product.id if review.sales_product else None,
                        'name': review.sales_product.name if review.sales_product else None,
                        'discount_percent': review.sales_product.discount_percent if review.sales_product else None
                    } if review.sales_product else None
                }
                
                return Response({
                    'status': 'SUCCESS',
                    'message': 'Review created successfully',
                    'data': enhanced_data
                }, status=status.HTTP_201_CREATED)
            
            # Handle validation errors
            error_message = get_first_error_message(serializer.errors, "UNSUCCESSFUL")
            return Response({
                'status': 'ERROR',
                'message': error_message,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'status': 'ERROR',
                'message': 'Failed to create review',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_review(self, request):
        try:
            # Get filtered queryset
            queryset = Review.objects.all()
            filtered_queryset = self.filterset_class(request.GET, queryset=queryset).qs
            
            # Apply ordering (newest first by default)
            filtered_queryset = filtered_queryset.order_by('-created_at')
            
            # Pagination
            page = request.GET.get('page', 1)
            limit = request.GET.get('limit', 10)
            offset = request.GET.get('offset', 0)
            
            try:
                page = int(page)
                limit = int(limit)
                offset = int(offset)
            except ValueError:
                return Response({
                    'status': 'ERROR',
                    'message': 'Invalid pagination parameters'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Apply offset and limit
            if offset > 0:
                filtered_queryset = filtered_queryset[offset:]
            
            paginator = Paginator(filtered_queryset, limit)
            
            try:
                paginated_data = paginator.page(page)
            except EmptyPage:
                return Response({
                    'status': 'ERROR',
                    'message': 'Page not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Serialize data with enriched product/sales product info
            serializer = self.serializer_class(paginated_data, many=True)
            
            return Response({
                'status': 'SUCCESS',
                'message': 'Reviews retrieved successfully',
                'data': serializer.data,
                'meta': {
                    'total': paginator.count,
                    'pages': paginator.num_pages,
                    'current_page': page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': paginated_data.has_next(),
                    'has_previous': paginated_data.has_previous()
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'status': 'ERROR',
                'message': 'Failed to retrieve reviews',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def update_review(self, request):
        try:
            # Validate required ID field
            if "id" not in request.data:
                return Response({
                    'status': 'ERROR',
                    'message': 'Review ID not provided'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Find the review instance
            instance = Review.objects.filter(id=request.data["id"]).first()
            if not instance:
                return Response({
                    'status': 'ERROR',
                    'message': 'Review not found'
                }, status=status.HTTP_404_NOT_FOUND)

            # Check ownership (user can only update their own reviews)
            if request.user.is_authenticated and instance.user != request.user:
                return Response({
                    'status': 'ERROR',
                    'message': 'You can only update your own reviews'
                }, status=status.HTTP_403_FORBIDDEN)

            # Create a copy of the data to avoid modifying the original request
            data = request.data.copy()
            
            # Explicitly remove product/sales_product fields
            data.pop('product', None)
            data.pop('sales_product', None)
            
            # Update the review
            serializer = self.serializer_class(
                instance,
                data=data,
                partial=True,
                context={'request': request}
            )
            
            if serializer.is_valid():
                updated_review = serializer.save()
                
                # Return enriched response
                response_data = self.serializer_class(updated_review).data
                return Response({
                    'status': 'SUCCESS',
                    'message': 'Review updated successfully',
                    'data': response_data
                }, status=status.HTTP_200_OK)
            
            # Handle validation errors
            error_message = get_first_error_message(serializer.errors, "Validation failed")
            return Response({
                'status': 'ERROR',
                'message': error_message,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'status': 'ERROR',
                'message': 'Failed to update review',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete_review(self, request):
        try:
            # Validate required ID parameter
            review_id = request.query_params.get('id')
            if not review_id:
                return Response({
                    'status': 'ERROR',
                    'message': 'Review ID not provided'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Find the review instance
            instance = Review.objects.filter(id=review_id).first()
            if not instance:
                return Response({
                    'status': 'ERROR',
                    'message': 'Review not found'
                }, status=status.HTTP_404_NOT_FOUND)

            # Check ownership (user can only delete their own reviews)
            if request.user.is_authenticated and instance.user != request.user:
                return Response({
                    'status': 'ERROR',
                    'message': 'You can only delete your own reviews'
                }, status=status.HTTP_403_FORBIDDEN)

            # Delete the review
            instance.delete()
            
            return Response({
                'status': 'SUCCESS',
                'message': 'Review deleted successfully',
                'data': {'id': review_id}
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'status': 'ERROR',
                'message': 'Failed to delete review',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PublicReviewController:
    serializer_class = PublicReviewSerializer
    filterset_class = PublicReviewFilter

    def create(self, request):
        try:
            # Check if either product or sales_product is provided
            product_id = request.data.get('product')
            sales_product_id = request.data.get('sales_product')

            if not product_id and not sales_product_id:
                return Response({
                    'status': 'ERROR',
                    'message': 'Either product or sales_product ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate product exists if provided
            if product_id:
                product = get_object_or_404(Product, id=product_id)
            if sales_product_id:
                sales_product = get_object_or_404(SalesProduct, id=sales_product_id)

            # Validate and save
            serializer = ReviewSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                review = serializer.save()

                # Return success response
                return Response({
                    'status': 'SUCCESS',
                    'message': 'Review created successfully',
                    'data': {
                        'id': review.id,
                        'name': review.name,
                        'comment': review.comment,
                        'rating': review.rating,
                        'product': {
                            'id': review.product.id if review.product else None,
                            'name': review.product.name if review.product else None
                        } if review.product else None,
                        'sales_product': {
                            'id': review.sales_product.id if review.sales_product else None,
                            'name': review.sales_product.name if review.sales_product else None,
                            'discount_percent': review.sales_product.discount_percent if review.sales_product else None
                        } if review.sales_product else None
                    }
                }, status=status.HTTP_201_CREATED)

            # Handle validation errors
            error_message = get_first_error_message(serializer.errors, "UNSUCCESSFUL")
            return Response({
                'status': 'ERROR',
                'message': error_message,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'status': 'ERROR',
                'message': 'Failed to create review',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # mydata = Member.objects.filter(firstname__endswith='s').values()

    def get_publicreview(self, request):
        try:
            # Get product or sales_product ID from query params
            product_id = request.GET.get('product_id') or request.GET.get('product')
            sales_product_id = request.GET.get('sales_product_id') or request.GET.get('sales_product')

            # Validate at least one ID is provided
            if not product_id and not sales_product_id:
                return Response({
                    'status': 'ERROR',
                    'message': 'Either product_id or sales_product_id is required',
                    'data': None
                }, status=status.HTTP_400_BAD_REQUEST)

            # Build the query based on provided ID
            query = Q()
            if product_id:
                query |= Q(product_id=product_id)
            if sales_product_id:
                query |= Q(sales_product_id=sales_product_id)

            # Get filtered reviews
            instances = self.serializer_class.Meta.model.objects.filter(query)

            if not instances.exists():
                return Response({
                    'status': 'SUCCESS',
                    'message': 'No reviews found',
                    'data': []
                }, status=status.HTTP_200_OK)

            # Apply additional filters if needed
            filtered_data = self.filterset_class(request.GET, queryset=instances)
            data = filtered_data.qs

            # Paginate and serialize
            paginated_data, count = paginate_data(data, request)
            serialized_data = self.serializer_class(paginated_data, many=True).data

            # Format response
            response_data = {
                'status': 'SUCCESS',
                'message': 'Reviews retrieved successfully',
                'data': {
                    'count': count,
                    'reviews': serialized_data
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'status': 'ERROR',
                'message': 'Failed to retrieve reviews',
                'error': str(e),
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_publicreview_by_id(self, request):
        try:
            # Get product or sales_product ID from query params
            product_id = request.GET.get('product_id') or request.GET.get('product')
            sales_product_id = request.GET.get('sales_product_id') or request.GET.get('sales_product')
            review_id = request.GET.get('review_id')

            # Validate at least one ID is provided
            if not product_id and not sales_product_id and not review_id:
                return Response({
                    'status': 'ERROR',
                    'message': 'Either product_id, sales_product_id, or review_id is required',
                    'data': None
                }, status=status.HTTP_400_BAD_REQUEST)

            # Build the base queryset
            queryset = self.serializer_class.Meta.model.objects.all()

            # Apply specific filters based on provided IDs
            if review_id:
                queryset = queryset.filter(id=review_id)
            else:
                query = Q()
                if product_id:
                    query |= Q(product_id=product_id)
                if sales_product_id:
                    query |= Q(sales_product_id=sales_product_id)
                queryset = queryset.filter(query)

            if not queryset.exists():
                return Response({
                    'status': 'SUCCESS',
                    'message': 'No reviews found',
                    'data': []
                }, status=status.HTTP_200_OK)

            # Apply additional filters if filterset_class is defined
            if hasattr(self, 'filterset_class') and self.filterset_class:
                queryset = self.filterset_class(request.GET, queryset=queryset).qs

            # Paginate the results
            paginated_data, count = paginate_data(queryset, request)

            # Serialize the data
            serializer = self.serializer_class(paginated_data, many=True)

            # Format the response
            response_data = {
                'status': 'SUCCESS',
                'message': 'Reviews retrieved successfully',
                'data': {
                    'count': count,
                    'reviews': serializer.data
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'status': 'ERROR',
                'message': 'Internal server error',
                'error': str(e),
                'data': None
            }, status=Status.HTTP_500_INTERNAL_SERVER_ERROR)
        
from rest_framework.pagination import PageNumberPagination
class LuxurySearchPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# Category Search View
class CategorySearchController:
    serializer_class = PubliccategorySerializer
    filterset_class = PublicCategoryFilter
    pagination_class = LuxurySearchPagination

    def get_categorysearch(self, request):
        search_query = request.GET.get('q', '').strip()
    
        if not search_query:
            return create_response([], "EMPTY_QUERY", 200)
        
        try:
            # Only search by fields that exist in your model
            # categories = Category.objects.filter(
            #     Q(name__icontains=search_query) |
            #     Q(description__icontains=search_query)
            # ).annotate(
            #     search_rank=Case(
            #         When(name__istartswith=search_query, then=3),
            #         When(name__icontains=search_query, then=2),
            #         When(description__icontains=search_query, then=1),
            #         default=0,
            #         output_field=IntegerField(),
            #     )
            # ).order_by('-search_rank', '-created_at').distinct()
            

            categories = Category.objects.filter(name__icontains=search_query).order_by('-created_at').distinct()

            # Paginate results
            paginator = self.pagination_class()
            paginated_categories = paginator.paginate_queryset(categories, request)
            
            # Serialize results
            category_data = self.serializer_class(
                paginated_categories, 
                many=True, 
                context={'request': request}
            ).data
            
            # Format results
            results = {
                'categories': category_data,
                'search_meta': {
                    'query': search_query,
                    'category_count': categories.count(),
                }
            }
            
            return create_response(results, "SUCCESSFUL", 200)
            
        except Exception as e:
            return create_response(
                {"error": str(e)},
                "SERVER_ERROR",
                500
            )

    def get_suggestions(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return create_response([], "EMPTY_QUERY", 200)
            
        # Get category suggestions only
        suggestions = {
            'popular_categories': list(Category.objects.filter(
                Q(name__icontains=query)
            ).order_by('-views')[:5].values('name', 'slug')),
            'trending_categories': list(Category.objects.order_by('-views')[:3].values('name', 'slug'))
        }
        return create_response(suggestions, "SUCCESSFUL", 200)