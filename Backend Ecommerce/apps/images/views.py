
from rest_framework.views import APIView
from rest_framework.response import Response
from utils.reusable_functions import (create_response, get_first_error, get_tokens_for_user)
from rest_framework import status
from utils.response_messages import *
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import (CategoriesSerializer, ImagesSerializer, PublicImagesSerializer, TextBoxCategoriesSerializer, TextBoxImagesSerializer, CategoryDropdownSerializer)
from .filters import (CategoriesFilter, ImagesFilter, PublicImagesFilter, TextBoxImagesFilter, TextCategoriesFilter, CategoryDropdownFilter)
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from config.settings import (SIMPLE_JWT, FRONTEND_BASE_URL, PASSWORD_RESET_VALIDITY)
from django.utils import timezone
from utils.helpers import generate_token
from apps.notification.tasks import send_email
from utils.enums import *
from django.db import transaction
from utils.base_api import BaseView
from collections import defaultdict
from utils.decorator import permission_required
from utils.permission_enums import *

class ImagesView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ImagesSerializer
    filterset_class = ImagesFilter

    @permission_required([CREATE_IMAGE])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_IMAGE])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_IMAGE])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required([DELETE_IMAGE])
    def delete(self, request):
        return super().delete_(request)


# class PublicImagesView(BaseView):
#     serializer_class = PublicImagesSerializer
#     filterset_class = PublicImagesFilter
#     permission_classes = [AllowAny]  # Allow public access without authentication
#     authentication_classes = []  # Disable authentication for public endpoint
    
#     def get(self, request):
#         return super().get_(request)


class PublicImagesView(BaseView):
    serializer_class = PublicImagesSerializer
    filterset_class = PublicImagesFilter
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get_queryset(self):
        # Only return active, non-deleted images
        return Images.objects.filter(
            deleted=False,
            is_active=True,
            is_public=True  # If you have this field
        )
    
    def get(self, request):
        return super().get_(request)


class TextBoxImagesView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = TextBoxImagesSerializer
    filterset_class = TextBoxImagesFilter

    def get(self, request):
        return super().get_(request)


class CategoriesView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CategoriesSerializer
    filterset_class = CategoriesFilter

    @permission_required([CREATE_IMAGE_CATEGORY])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_IMAGE_CATEGORY])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_IMAGE_CATEGORY])
    def patch(self, request):
        return super().patch_(request)
    
    @permission_required([DELETE_IMAGE_CATEGORY])
    def delete(self, request):
        return super().delete_(request)


class TextCategoriesView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = TextBoxCategoriesSerializer
    filterset_class = TextCategoriesFilter

    def get(self, request):
        return super().get_(request)


class CategoryDropdownView(BaseView):
    """Returns id/category list for populating frontend dropdowns.
    Read-only, authenticated (switch to AllowAny if you need it public).
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = CategoryDropdownSerializer
    filterset_class = CategoryDropdownFilter

    def get_queryset(self):
        return Categories.objects.filter(
            deleted=False,
            is_active=True,
        ).order_by('category')

    @permission_required([READ_IMAGE_CATEGORY])
    def get(self, request):
        return super().get_(request)