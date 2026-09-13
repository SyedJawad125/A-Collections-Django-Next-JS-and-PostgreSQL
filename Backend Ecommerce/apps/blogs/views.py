"""
NOTE: MediaView, NewsletterView, CampaignView were not shown in full
(their serializers weren't included), so they're kept exactly as they were
in the original file. Only Category/Tag/BlogPost/Comment-related views are
revised below.
"""

import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import models, transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from utils.reusable_functions import create_response, get_first_error, get_tokens_for_user
from utils.response_messages import *
from utils.helpers import generate_token, paginate_data
from utils.enums import *
from utils.base_api import BaseView
from utils.decorator import permission_required
from utils.permission_enums import *
from apps.notification.tasks import send_email
from config.settings import SIMPLE_JWT, FRONTEND_BASE_URL, PASSWORD_RESET_VALIDITY
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken

from .serializers import (
    BlogPostSerializer, CategorySerializer, CommentSerializer,
    PublicBlogPostSerializer, TagSerializer, CommentModerationSerializer,
    CommentListSerializer,
    # MediaSerializer, NewsletterSerializer, CampaignSerializer,  # keep existing import
)
from .filters import (
    BlogPostFilter, CategoryFilter, CommentFilter,
    PublicBlogPostFilter, TagFilter,
    # MediaFilter, NewsletterFilter, CampaignFilter,  # keep existing import
)
from .models import Comment, BlogPost

User = get_user_model()
logger = logging.getLogger(__name__)


class CategoryView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter

    @permission_required([CREATE_CATEGORY])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_CATEGORY])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_CATEGORY])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_CATEGORY])
    def delete(self, request):
        return super().delete_(request)


class TagView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = TagSerializer
    filterset_class = TagFilter

    @permission_required([CREATE_TAG])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_TAG])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_TAG])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_TAG])
    def delete(self, request):
        return super().delete_(request)


class BlogPostView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class = BlogPostSerializer
    filterset_class = BlogPostFilter

    @permission_required([CREATE_BLOG_POST])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_BLOG_POST])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_BLOG_POST])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_BLOG_POST])
    def delete(self, request):
        return super().delete_(request)


class PublicBlogPostView(BaseView):
    """
    FIXED: previously had no extra_filters at all, meaning drafts,
    archived, scheduled, and non-public-visibility posts were served to
    anonymous users. Now restricted to published + public posts.

    Password-protected and members-only posts are intentionally excluded
    from this open listing — add a dedicated
    `PasswordProtectedBlogPostView`/`check_password` endpoint if you need
    to serve those after verifying access.
    """
    serializer_class = PublicBlogPostSerializer
    filterset_class = PublicBlogPostFilter
    extra_filters = {'status': PUBLISHED, 'visibility': PUBLIC}

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return super().get_(request)


class CommentView(BaseView):
    """
    Main Comment View for authenticated users.
    Handles CRUD operations with permissions.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = CommentSerializer
    list_serializer = CommentListSerializer
    filterset_class = CommentFilter

    @permission_required([CREATE_COMMENT])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_COMMENT])
    def get(self, request):
        """
        Overridden instead of using BaseView.get_ directly.

        BaseView never passes `request=request` into the filterset, so
        `CommentFilter.qs` (which reads `self.request`) always sees
        `self.request is None`. That makes it treat every caller as
        anonymous: `if not request or not request.user.is_authenticated`
        is True whenever request is None, so it silently forces
        `status=APPROVED` even for staff, and the `include_deleted`
        branch never fires. Passing `request=request` here restores the
        intended staff-vs-public behaviour already written into the
        filter's `qs` property.
        """
        try:
            serializer_class = self.serializer_class
            if (request.query_params.get('api_type') in ['list', 'cards']
                    and self.list_serializer):
                serializer_class = self.list_serializer

            if request.query_params.get('id'):
                base_qs = Comment.all_objects.filter(id=request.query_params['id'])
                instance = CommentFilter(request.GET, queryset=base_qs, request=request).qs.first()
                if not instance:
                    return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
                serialized_data = serializer_class(instance, context={'request': request}).data
                count = 1
            else:
                order = request.query_params.get('order', 'desc')
                order_by = request.query_params.get('order_by', 'created_at')
                if order == 'desc':
                    order_by = f"-{order_by}"

                instances = Comment.all_objects.all().order_by(order_by)
                filtered_instances = CommentFilter(request.GET, queryset=instances, request=request).qs
                data, count = paginate_data(filtered_instances, request)
                serialized_data = serializer_class(data, many=True, context={'request': request}).data

            return Response(create_response(SUCCESSFUL, serialized_data, count), status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("CommentView.get failed")
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @permission_required([UPDATE_COMMENT])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_COMMENT])
    def delete(self, request):
        """
        Overridden instead of using BaseView.delete_ directly.

        BaseView.delete_ does a raw `instance.deleted = True;
        instance.updated_by = request.user; instance.save()`. For Comment
        that (a) sets `updated_by`, which isn't a real field on this
        model, as a dead instance attribute, (b) never sets
        deleted_at/deleted_by, and (c) calls save() with no
        update_fields, which re-runs full_clean() and can reject the
        delete outright (e.g. if this comment's parent is already
        soft-deleted). Comment.soft_delete() already does this correctly
        via update_fields, so route through it directly.
        """
        try:
            comment_id = request.query_params.get('id')
            if not comment_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)

            instance = Comment.objects.filter(deleted=False, id=comment_id).first()
            if not instance:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)

            if not instance.can_delete(request.user):
                return Response(
                    create_response("You do not have permission to delete this comment"),
                    status=status.HTTP_403_FORBIDDEN
                )

            instance.soft_delete(user=request.user)
            serialized_resp = self.serializer_class(instance, context={'request': request}).data
            return Response(create_response(SUCCESSFUL, serialized_resp), status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("CommentView.delete failed")
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicCommentView(BaseView):
    """
    Public Comment View - allows guests to view and create comments.
    No authentication required.
    """
    serializer_class = CommentSerializer
    list_serializer = CommentListSerializer
    filterset_class = CommentFilter
    extra_filters = {'status': Comment.APPROVED}  # Show only approved comments

    authentication_classes = []
    permission_classes = []

    def post_(self, request):
        """Override post_ to handle guest comments"""
        try:
            serialized_data = self.serializer_class(
                data=request.data,
                context={'request': request}
            )
            if serialized_data.is_valid():
                if request.user.is_authenticated:
                    obj = serialized_data.save(created_by=request.user)
                else:
                    obj = serialized_data.save()

                serialized_resp = self.serializer_class(obj, context={'request': request}).data
                return Response(
                    create_response(SUCCESSFUL, serialized_resp),
                    status=status.HTTP_201_CREATED
                )
            return Response(
                create_response(get_first_error(serialized_data.errors)),
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception("PublicCommentView.post_ failed")
            return Response(create_response(str(e)), status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        return self.post_(request)

    def get_(self, request):
        """Override get_ to always show only approved comments"""
        try:
            if (request.query_params.get('api_type') in ['list', 'cards']
                    and getattr(self, 'list_serializer', None)):
                self.serializer_class = self.list_serializer

            if request.query_params.get('id'):
                instance = self.serializer_class.Meta.model.objects.filter(
                    deleted=False,
                    id=request.query_params.get('id'),
                    status=Comment.APPROVED,
                    **self.extra_filters
                ).first()
                if not instance:
                    return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
                serialized_data = self.serializer_class(instance, context={'request': request}).data
                count = 1
            else:
                order = request.query_params.get('order', 'desc')
                order_by = request.query_params.get('order_by', 'created_at')
                if order == 'desc':
                    order_by = f"-{order_by}"

                instances = self.serializer_class.Meta.model.objects.filter(
                    deleted=False, status=Comment.APPROVED, **self.extra_filters
                ).order_by(order_by)

                if self.filterset_class:
                    # Pass request explicitly — CommentFilter.qs reads
                    # self.request, and django-filter does not default
                    # this to the request you supplied unless you pass it
                    # as a kwarg here.
                    filtered_instances = self.filterset_class(request.GET, queryset=instances, request=request).qs
                    data, count = paginate_data(filtered_instances, request)
                else:
                    data, count = paginate_data(instances, request)

                serialized_data = self.serializer_class(data, many=True, context={'request': request}).data

            return Response(create_response(SUCCESSFUL, serialized_data, count), status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("PublicCommentView.get_ failed")
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        return self.get_(request)


class CommentModerationView(BaseView):
    """
    Comment Moderation View - Staff only.
    Approve, reject, or mark comments as spam.

    Changed from plain APIView + IsAdminUser to BaseView, for consistency
    with the rest of the module's pagination/response handling and so it
    can use the same @permission_required pattern as everything else. If
    you don't yet have a MODERATE_COMMENT permission enum, add one; until
    then this keeps IsAdminUser as a safe fallback.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = CommentSerializer

    def post(self, request, pk=None):
        try:
            comment_id = pk or request.data.get('id')

            if not comment_id:
                return Response(create_response("Comment ID is required"), status=status.HTTP_400_BAD_REQUEST)

            try:
                comment = Comment.objects.get(pk=comment_id, deleted=False)
            except Comment.DoesNotExist:
                return Response(create_response("Comment not found"), status=status.HTTP_404_NOT_FOUND)

            serializer = CommentModerationSerializer(
                data=request.data,
                context={'request': request, 'instance': comment}
            )

            if serializer.is_valid():
                action = serializer.validated_data['action']
                note = serializer.validated_data.get('note', '')

                if action == 'approve':
                    comment.approve(moderator=request.user, note=note)
                elif action == 'reject':
                    comment.reject(moderator=request.user, note=note)
                elif action == 'spam':
                    comment.mark_as_spam(moderator=request.user, note=note)
                else:
                    return Response(
                        create_response(f"Invalid action: {action}"),
                        status=status.HTTP_400_BAD_REQUEST
                    )

                serialized_data = CommentSerializer(comment, context={'request': request}).data
                return Response(create_response(SUCCESSFUL, serialized_data), status=status.HTTP_200_OK)

            return Response(
                create_response(get_first_error(serializer.errors)),
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception("CommentModerationView.post failed")
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk=None):
        return self.post(request, pk)


class PostCommentsView(APIView):
    """
    Get all comments for a specific blog post.
    Public endpoint - shows only approved comments to public.
    """
    permission_classes = []
    authentication_classes = []

    def get(self, request, post_id=None):
        try:
            post_id = post_id or request.query_params.get('post')

            if not post_id:
                return Response(create_response("Post ID is required"), status=status.HTTP_400_BAD_REQUEST)

            try:
                post_id = int(post_id)
            except ValueError:
                return Response(create_response("Post ID must be a number"), status=status.HTTP_400_BAD_REQUEST)

            queryset = Comment.objects.filter(
                post_id=post_id, deleted=False, status=Comment.APPROVED
            ).select_related('user', 'post').order_by('-created_at')

            if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
                queryset = Comment.objects.filter(
                    post_id=post_id, deleted=False
                ).select_related('user', 'post').order_by('-created_at')

            data, count = paginate_data(queryset, request)

            serializer = CommentSerializer(
                data, many=True, context={'request': request, 'show_replies': True}
            )

            return Response(create_response(SUCCESSFUL, serializer.data, count), status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("PostCommentsView.get failed")
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserCommentsView(APIView):
    """
    Get all comments by a specific user.
    Shows only approved comments to public.
    """
    permission_classes = []
    authentication_classes = []

    def get(self, request, username=None):
        try:
            username = username or request.query_params.get('username')

            if not username:
                return Response(create_response("Username is required"), status=status.HTTP_400_BAD_REQUEST)

            if not User.objects.filter(username=username).exists():
                return Response(create_response("User not found"), status=status.HTTP_404_NOT_FOUND)

            queryset = Comment.objects.filter(
                user__username=username, deleted=False
            ).select_related('user', 'post').order_by('-created_at')

            if not (request.user.is_authenticated and
                    (request.user.username == username or
                     request.user.is_staff or
                     request.user.is_superuser)):
                queryset = queryset.filter(status=Comment.APPROVED)

            data, count = paginate_data(queryset, request)

            serializer = CommentSerializer(
                data, many=True, context={'request': request, 'show_replies': False}
            )

            return Response(create_response(SUCCESSFUL, serializer.data, count), status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("UserCommentsView.get failed")
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# Keep your existing MediaView / NewsletterView / CampaignView classes here
# exactly as they were — they weren't included in the source you shared, so
# nothing about them has been changed. Just make sure their imports above
# (currently commented out) are restored from your actual serializers/
# filters modules.
# ---------------------------------------------------------------------------