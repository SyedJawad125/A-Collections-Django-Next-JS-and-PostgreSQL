"""
NOTE: MediaFilter, NewsletterFilter, CampaignFilter were not included in
the code you shared and are left untouched — import them from wherever
they already live.
"""

import django_filters
from django_filters import (
    FilterSet, CharFilter, BooleanFilter, NumberFilter, DateTimeFilter,
    ChoiceFilter, ModelMultipleChoiceFilter, ModelChoiceFilter,
    MultipleChoiceFilter, UUIDFilter, BaseInFilter,
)
from django.db import models
from django.contrib.auth import get_user_model

from .models import BlogPost, Category, Tag, Comment

User = get_user_model()


class CategoryFilter(django_filters.FilterSet):
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    slug = CharFilter(field_name='slug', lookup_expr='iexact')
    parent = CharFilter(field_name='parent__id')
    is_active = BooleanFilter(field_name='is_active')

    class Meta:
        model = Category
        fields = []


class TagFilter(FilterSet):
    id = CharFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    color = CharFilter(field_name='color', lookup_expr='iexact')
    is_active = BooleanFilter(field_name='is_active')

    class Meta:
        model = Tag
        fields = []


class BlogPostFilter(django_filters.FilterSet):
    title = CharFilter(field_name='title', lookup_expr='icontains')
    subtitle = CharFilter(field_name='subtitle', lookup_expr='icontains')
    excerpt = CharFilter(field_name='excerpt', lookup_expr='icontains')
    content = CharFilter(field_name='content', lookup_expr='icontains')

    author = CharFilter(field_name='author', lookup_expr='icontains')
    category = NumberFilter(field_name='category__id')

    tags = ModelMultipleChoiceFilter(field_name="tags__id", queryset=Tag.objects.all())

    status = ChoiceFilter(choices=BlogPost.STATUS_CHOICES)
    visibility = ChoiceFilter(choices=BlogPost.VISIBILITY_CHOICES)

    is_featured = BooleanFilter()
    allow_comments = BooleanFilter()
    is_premium = BooleanFilter()

    created_at__gte = DateTimeFilter(field_name="created_at", lookup_expr='gte')
    created_at__lte = DateTimeFilter(field_name="created_at", lookup_expr='lte')
    published_at__gte = DateTimeFilter(field_name="published_at", lookup_expr='gte')
    published_at__lte = DateTimeFilter(field_name="published_at", lookup_expr='lte')

    class Meta:
        model = BlogPost
        fields = []


class PublicBlogPostFilter(BlogPostFilter):
    """
    Identical filter set to BlogPostFilter, kept as a distinct class so the
    public view can evolve independently (e.g. you may later want to strip
    down which fields anonymous users are allowed to filter on), without
    the two definitions silently drifting apart from being hand-copied.
    """
    class Meta(BlogPostFilter.Meta):
        pass


class CommentFilter(django_filters.FilterSet):
    """
    Filter for Comment model.
    Works with both authenticated and public views.
    """

    post_title = CharFilter(field_name='post__title', lookup_expr='icontains')
    post_slug = CharFilter(field_name='post__slug', lookup_expr='iexact')

    user = ModelChoiceFilter(queryset=User.objects.all())
    username = CharFilter(field_name='user__username', lookup_expr='icontains')
    author_name = CharFilter(method='filter_author_name')

    guest_name = CharFilter(lookup_expr='icontains')
    guest_email = CharFilter(lookup_expr='iexact')
    is_guest = BooleanFilter(field_name='user', lookup_expr='isnull')

    content = CharFilter(lookup_expr='icontains')
    search = CharFilter(method='filter_search')

    status = ChoiceFilter(choices=Comment.STATUS_CHOICES)
    status_in = MultipleChoiceFilter(field_name='status', choices=Comment.STATUS_CHOICES, lookup_expr='in')

    is_reply = BooleanFilter(field_name='parent', lookup_expr='isnull', exclude=True)
    is_top_level = BooleanFilter(field_name='parent', lookup_expr='isnull')

    is_edited = BooleanFilter()

    created_after = DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = DateTimeFilter(field_name='created_at', lookup_expr='lte')
    updated_after = DateTimeFilter(field_name='updated_at', lookup_expr='gte')
    updated_before = DateTimeFilter(field_name='updated_at', lookup_expr='lte')

    moderated_by = ModelChoiceFilter(queryset=User.objects.filter(is_staff=True))
    moderated_after = DateTimeFilter(field_name='moderated_at', lookup_expr='gte')
    moderated_before = DateTimeFilter(field_name='moderated_at', lookup_expr='lte')

    include_deleted = BooleanFilter(method='filter_include_deleted')

    class Meta:
        model = Comment
        fields = []

    def filter_author_name(self, queryset, name, value):
        return queryset.filter(
            models.Q(user__first_name__icontains=value) |
            models.Q(user__last_name__icontains=value) |
            models.Q(user__username__icontains=value) |
            models.Q(guest_name__icontains=value)
        )

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models.Q(content__icontains=value) |
            models.Q(user__username__icontains=value) |
            models.Q(user__first_name__icontains=value) |
            models.Q(user__last_name__icontains=value) |
            models.Q(guest_name__icontains=value)
        )

    def filter_include_deleted(self, queryset, name, value):
        """Include deleted comments (staff only). Always excluded for non-staff."""
        request = self.request
        if request and request.user.is_authenticated and request.user.is_staff:
            if value:
                return Comment.all_objects.all()
        return queryset.filter(deleted=False)

    @property
    def qs(self):
        """Override queryset to handle public vs authenticated access"""
        parent = super().qs
        request = self.request

        if not (request and request.user.is_authenticated and
                request.user.is_staff and
                self.data.get('include_deleted') == 'true'):
            parent = parent.filter(deleted=False)

        if not request or not request.user.is_authenticated:
            parent = parent.filter(status=Comment.APPROVED)

        return parent


class PublicCommentFilter(django_filters.FilterSet):
    """
    Simplified filter for public comment views.
    Only shows approved, non-deleted comments. Fewer filter options for
    security (e.g. no author_name/username lookup that could be used to
    enumerate registered users).
    """

    post_slug = CharFilter(field_name='post__slug', lookup_expr='iexact')
    search = CharFilter(method='filter_search')
    is_top_level = BooleanFilter(field_name='parent', lookup_expr='isnull')

    created_after = DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Comment
        fields = []

    def filter_search(self, queryset, name, value):
        return queryset.filter(content__icontains=value)

    @property
    def qs(self):
        parent = super().qs
        return parent.filter(status=Comment.APPROVED, deleted=False)