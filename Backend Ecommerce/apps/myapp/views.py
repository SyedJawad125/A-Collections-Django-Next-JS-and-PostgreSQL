# from rest_framework.views import APIView
# from rest_framework.response import Response
# from utils.reusable_functions import (create_response, get_first_error, get_tokens_for_user)
# from rest_framework import status
# from utils.response_messages import *
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from .serializers import (BlogPostSerializer, CampaignSerializer, CategorySerializer, CommentSerializer, MediaSerializer, NewsletterSerializer, PublicBlogPostSerializer, TagSerializer, CommentSerializer, CommentModerationSerializer) 
# from .filters import (BlogPostFilter, CampaignFilter, CategoryFilter, CommentFilter, MediaFilter, NewsletterFilter, PublicBlogPostFilter, TagFilter, CommentFilter)
# from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
# from config.settings import (SIMPLE_JWT, FRONTEND_BASE_URL, PASSWORD_RESET_VALIDITY)
# from django.utils import timezone
# from utils.helpers import generate_token, paginate_data
# from apps.notification.tasks import send_email
# from utils.enums import *
# from django.db import transaction
# from utils.base_api import BaseView
# from collections import defaultdict
# from utils.decorator import permission_required
# from utils.permission_enums import *
# from .models import Comment



# class CategoryView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = CategorySerializer
#     filterset_class = CategoryFilter

#     @permission_required([CREATE_CATEGORY])
#     def post(self, request):
#         return super().post_(request)

#     @permission_required([READ_CATEGORY])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required([UPDATE_CATEGORY])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required([DELETE_CATEGORY])
#     def delete(self, request):
#         return super().delete_(request)


# class TagView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = TagSerializer
#     filterset_class = TagFilter

#     @permission_required([CREATE_TAG])
#     def post(self, request):
#         return super().post_(request)

#     @permission_required([READ_TAG])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required([UPDATE_TAG])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required([DELETE_TAG])
#     def delete(self, request):
#         return super().delete_(request)


# class BlogPostView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = BlogPostSerializer
#     filterset_class = BlogPostFilter

#     @permission_required([CREATE_BLOG_POST])
#     def post(self, request):
#         return super().post_(request)

#     @permission_required([READ_BLOG_POST])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required([UPDATE_BLOG_POST])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required([DELETE_BLOG_POST])
#     def delete(self, request):
#         return super().delete_(request)
    
# class PublicBlogPostView(BaseView):
#     serializer_class = PublicBlogPostSerializer
#     filterset_class = PublicBlogPostFilter

#     authentication_classes = []  
#     permission_classes = []      
    
#     def get(self, request):
#         return super().get_(request)


# # class CommentView(BaseView):
# #     permission_classes = (IsAuthenticated,)
# #     serializer_class = CommentSerializer
# #     filterset_class = CommentFilter

# #     @permission_required([CREATE_COMMENT])
# #     def post(self, request):
# #         return super().post_(request)

# #     @permission_required([READ_COMMENT])
# #     def get(self, request):
# #         return super().get_(request)

# #     @permission_required([UPDATE_COMMENT])
# #     def patch(self, request):
# #         return super().patch_(request)
    
# #     @permission_required([DELETE_COMMENT])
# #     def delete(self, request):
# #         return super().delete_(request)


# class MediaView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = MediaSerializer
#     filterset_class = MediaFilter

#     @permission_required([CREATE_MEDIA])
#     def post(self, request):
#         return super().post_(request)

#     @permission_required([READ_MEDIA])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required([UPDATE_MEDIA])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required([DELETE_MEDIA])
#     def delete(self, request):
#         return super().delete_(request)


# class NewsletterView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = NewsletterSerializer
#     filterset_class = NewsletterFilter

#     @permission_required([CREATE_NEWSLETTER])
#     def post(self, request):
#         return super().post_(request)

#     @permission_required([READ_NEWSLETTER])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required([UPDATE_NEWSLETTER])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required([DELETE_NEWSLETTER])
#     def delete(self, request):
#         return super().delete_(request)


# class CampaignView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = CampaignSerializer
#     filterset_class = CampaignFilter

#     @permission_required([CREATE_CAMPAIGN])
#     def post(self, request):
#         return super().post_(request)

#     @permission_required([READ_CAMPAIGN])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required([UPDATE_CAMPAIGN])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required([DELETE_CAMPAIGN])
#     def delete(self, request):
#         return super().delete_(request)
    


# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, IsAdminUser
# from rest_framework import status
# from django.shortcuts import get_object_or_404
# from django.db import models
# from utils.reusable_functions import (create_response, get_first_error)
# from utils.response_messages import *
# from django.contrib.auth import get_user_model

# User = get_user_model()


# class CommentView(BaseView):
#     """
#     Main Comment View for authenticated users
#     Handles CRUD operations with permissions
#     """
#     permission_classes = (IsAuthenticated,)
#     serializer_class = CommentSerializer
#     filterset_class = CommentFilter

#     @permission_required([CREATE_COMMENT])
#     def post(self, request):
#         return super().post_(request)

#     @permission_required([READ_COMMENT])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required([UPDATE_COMMENT])
#     def patch(self, request):
#         return super().patch_(request)
    
#     @permission_required([DELETE_COMMENT])
#     def delete(self, request):
#         return super().delete_(request)


# class PublicCommentView(BaseView):
#     """
#     Public Comment View - allows guests to view and create comments
#     No authentication required
#     """
#     serializer_class = CommentSerializer
#     filterset_class = CommentFilter
#     extra_filters = {'status': Comment.APPROVED}  # Show only approved comments

#     authentication_classes = []  
#     permission_classes = []
    
#     def post_(self, request):
#         """Override post_ to handle guest comments"""
#         try:
#             serialized_data = self.serializer_class(
#                 data=request.data, 
#                 context={'request': request}
#             )
#             if serialized_data.is_valid():
#                 # If user is authenticated, use that user
#                 if request.user.is_authenticated:
#                     obj = serialized_data.save(created_by=request.user)
#                 else:
#                     # For guests, save without user
#                     obj = serialized_data.save()
                
#                 serialized_resp = self.serializer_class(
#                     obj, 
#                     context={'request': request}
#                 ).data
#                 return Response(
#                     create_response(SUCCESSFUL, serialized_resp), 
#                     status=status.HTTP_201_CREATED
#                 )
#             else:
#                 return Response(
#                     create_response(get_first_error(serialized_data.errors)), 
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#         except Exception as e:
#             print(str(e))
#             return Response(
#                 create_response(str(e)), 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def get_(self, request):
#         """Override get_ to always show only approved comments"""
#         try:
#             if request.query_params.get('api_type') and request.query_params.get('api_type') in ['list', 'cards'] and self.list_serializer:
#                 self.serializer_class = self.list_serializer
            
#             if request.query_params.get('id'):
#                 instance = self.serializer_class.Meta.model.objects.filter(
#                     deleted=False, 
#                     id=request.query_params.get('id', None),
#                     status=Comment.APPROVED,  # Only approved
#                     **self.extra_filters
#                 ).first()
#                 if not instance:
#                     return Response(
#                         create_response(NOT_FOUND), 
#                         status=status.HTTP_404_NOT_FOUND
#                     )
#                 serialized_data = self.serializer_class(
#                     instance, 
#                     context={'request': request}
#                 ).data
#                 count = 1
#             else:
#                 order = request.query_params.get('order', 'desc')
#                 order_by = request.query_params.get('order_by', "created_at")
#                 if order and order_by:
#                     if order == "desc":
#                         order_by = f"-{order_by}"
#                     else:
#                         order_by = order_by
                
#                 # Only approved comments for public view
#                 instances = self.serializer_class.Meta.model.objects.filter(
#                     deleted=False,
#                     status=Comment.APPROVED,
#                     **self.extra_filters
#                 ).order_by(order_by)
                
#                 if self.filterset_class:
#                     filtered_instances = self.filterset_class(
#                         request.GET, 
#                         queryset=instances
#                     ).qs
#                     data, count = paginate_data(filtered_instances, request)
#                 else:
#                     data, count = paginate_data(instances, request)
                
#                 serialized_data = self.serializer_class(
#                     data, 
#                     many=True, 
#                     context={'request': request}
#                 ).data
#             return Response(
#                 create_response(SUCCESSFUL, serialized_data, count), 
#                 status=status.HTTP_200_OK
#             )
#         except Exception as e:
#             print(str(e))
#             return Response(
#                 create_response(str(e)), 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class CommentModerationView(APIView):
#     """
#     Comment Moderation View - Staff only
#     Approve, reject, or mark comments as spam
#     """
#     permission_classes = [IsAuthenticated, IsAdminUser]
    
#     def post(self, request, pk=None):
#         """Moderate a comment"""
#         try:
#             # Get comment ID from request data or URL parameter
#             comment_id = pk or request.data.get('id')
            
#             if not comment_id:
#                 return Response(
#                     create_response("Comment ID is required"),
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Get comment
#             try:
#                 comment = Comment.objects.get(pk=comment_id, deleted=False)
#             except Comment.DoesNotExist:
#                 return Response(
#                     create_response("Comment not found"),
#                     status=status.HTTP_404_NOT_FOUND
#                 )
            
#             # Validate moderation action
#             serializer = CommentModerationSerializer(
#                 data=request.data,
#                 context={'request': request, 'instance': comment}
#             )
            
#             if serializer.is_valid():
#                 action = serializer.validated_data['action']
#                 note = serializer.validated_data.get('note', '')
                
#                 # Perform moderation action
#                 if action == 'approve':
#                     comment.approve(moderator=request.user, note=note)
#                 elif action == 'reject':
#                     comment.reject(moderator=request.user, note=note)
#                 elif action == 'spam':
#                     comment.mark_as_spam(moderator=request.user, note=note)
#                 else:
#                     return Response(
#                         create_response(f"Invalid action: {action}"),
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
                
#                 # Return updated comment
#                 serialized_data = CommentSerializer(
#                     comment, 
#                     context={'request': request}
#                 ).data
#                 return Response(
#                     create_response(SUCCESSFUL, serialized_data),
#                     status=status.HTTP_200_OK
#                 )
            
#             return Response(
#                 create_response(get_first_error(serializer.errors)),
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
#         except Exception as e:
#             print(str(e))
#             return Response(
#                 create_response(str(e)),
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def patch(self, request, pk=None):
#         """Moderate a comment using PATCH method"""
#         return self.post(request, pk)


# class PostCommentsView(APIView):
#     """
#     Get all comments for a specific blog post
#     Public endpoint - shows only approved comments to public
#     """
#     permission_classes = []
#     authentication_classes = []
    
#     def get(self, request, post_id=None):
#         """Get comments for a specific post"""
#         try:
#             # Get post_id from URL or query params
#             post_id = post_id or request.query_params.get('post')
            
#             if not post_id:
#                 return Response(
#                     create_response("Post ID is required"),
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Try to convert to integer
#             try:
#                 post_id = int(post_id)
#             except ValueError:
#                 return Response(
#                     create_response("Post ID must be a number"),
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Base queryset - approved comments only for public
#             queryset = Comment.objects.filter(
#                 post_id=post_id,
#                 deleted=False,
#                 status=Comment.APPROVED
#             ).select_related('user', 'post').order_by('-created_at')
            
#             # If staff, show all comments
#             if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
#                 queryset = Comment.objects.filter(
#                     post_id=post_id,
#                     deleted=False
#                 ).select_related('user', 'post').order_by('-created_at')
            
#             # Apply pagination
#             data, count = paginate_data(queryset, request)
            
#             # Serialize
#             serializer = CommentSerializer(
#                 data,
#                 many=True,
#                 context={'request': request, 'show_replies': True}
#             )
            
#             return Response(
#                 create_response(SUCCESSFUL, serializer.data, count),
#                 status=status.HTTP_200_OK
#             )
            
#         except Exception as e:
#             print(str(e))
#             return Response(
#                 create_response(str(e)),
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class UserCommentsView(APIView):
#     """
#     Get all comments by a specific user
#     Shows only approved comments to public
#     """
#     permission_classes = []
#     authentication_classes = []
    
#     def get(self, request, username=None):
#         """Get comments by a specific user"""
#         try:
#             # Get username from URL or query params
#             username = username or request.query_params.get('username')
            
#             if not username:
#                 return Response(
#                     create_response("Username is required"),
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Check if user exists
#             if not User.objects.filter(username=username).exists():
#                 return Response(
#                     create_response("User not found"),
#                     status=status.HTTP_404_NOT_FOUND
#                 )
            
#             # Base queryset
#             queryset = Comment.objects.filter(
#                 user__username=username,
#                 deleted=False
#             ).select_related('user', 'post').order_by('-created_at')
            
#             # Only show approved to public
#             if not (request.user.is_authenticated and 
#                     (request.user.username == username or 
#                      request.user.is_staff or 
#                      request.user.is_superuser)):
#                 queryset = queryset.filter(status=Comment.APPROVED)
            
#             # Apply pagination
#             data, count = paginate_data(queryset, request)
            
#             # Serialize
#             serializer = CommentSerializer(
#                 data,
#                 many=True,
#                 context={'request': request, 'show_replies': False}
#             )
            
#             return Response(
#                 create_response(SUCCESSFUL, serializer.data, count),
#                 status=status.HTTP_200_OK
#             )
            
#         except Exception as e:
#             print(str(e))
#             return Response(
#                 create_response(str(e)),
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )





from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from utils.decorator import permission_required
from utils.base_api import BaseView
from .serializers import (
    ProductSerializer, ColorSerializer, ProductVariantSerializer, InventorySerializer,
    SalesProductSerializer, CategorySerializer, ProductTagSerializer, OrderSerializer,
    ContactSerializer, EmployeeSerializer, ReviewSerializer, PublicReviewSerializer
)
from .filters import (
    ProductFilter, ColorFilter, ProductVariantFilter, InventoryFilter,
    SalesProductFilter, CategoryFilter, ProductTagFilter, OrderFilter,
    ContactFilter, EmployeeFilter, ReviewFilter
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
    
    def get(self, request):
        return self.controller.get_publicproduct(request)

class SliderProductView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = ProductSerializer
    filterset_class = ProductFilter
    
    def get(self, request):
        return self.controller.get_sliderproduct(request)

class DropDownListProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ProductSerializer
    filterset_class = ProductFilter
    
    def get(self, request):
        return self.controller.get_dropdownlistproduct(request)

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
    
    def get(self, request):
        return self.controller.get_publicsalesproduct(request)

class DropDownListSalesProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = SalesProductSerializer
    filterset_class = SalesProductFilter
    
    def get(self, request):
        return self.controller.get_dropdownlistsalesproduct(request)

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
    
    def get(self, request):
        return self.controller.get_publiccategory(request)

class PublicCategoryWiseView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    
    def get(self, request, pk=None):
        return self.controller.get_publiccategorywise(request, pk)

class DropDownListCategoryView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    
    def get(self, request):
        return self.controller.get_dropdownlistcategory(request)

class SliderCategoryView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    
    def get(self, request):
        return self.controller.get_slidercategory(request)

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
    
    def get(self, request):
        return self.controller.get_textboxorder(request)

class PublicOrderView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = OrderSerializer
    
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
    
    def get(self, request):
        return self.controller.get_publiccontact(request)

# Employee View
class EmployeeView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = EmployeeSerializer
    filterset_class = EmployeeFilter
    
    @permission_required(['create_employee'])
    def post(self, request):
        return super().post_(request)
    
    @permission_required(['read_employee'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_employee'])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required(['delete_employee'])
    def delete(self, request):
        return super().delete_(request)

# Review View
class ReviewView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ReviewSerializer
    filterset_class = ReviewFilter
    
    @permission_required(['create_reviews'])
    def post(self, request):
        return super().post_(request)
    
    @permission_required(['read_reviews'])
    def get(self, request):
        return super().get_(request)
    
    @permission_required(['update_reviews'])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required(['delete_reviews'])
    def delete(self, request):
        return super().delete_(request)

class PublicReviewView(BaseView):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = PublicReviewSerializer
    
    def post(self, request):
        return super().post_(request)
    
    def get(self, request):
        return self.controller.get_publicreview(request)
    
    def get_by_id(self, request, pk=None):
        return self.controller.get_publicreview_by_id(request, pk)

# Category Search View
class CategorySearchView(ViewSet):
    permission_classes = ()  # No authentication required for public endpoints
    serializer_class = CategorySerializer
    
    def get(self, request):
        return self.controller.get_categorysearch(request)
    
    def suggestions(self, request):
        return self.controller.get_suggestions(request)