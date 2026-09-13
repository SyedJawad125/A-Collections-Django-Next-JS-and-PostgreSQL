"""
NOTE: Media, Newsletter, and Campaign serializers were not included in the
code you shared, so they aren't reproduced here. Keep importing them from
wherever they already live and merge this file's contents in around them,
e.g.:

    from .serializers_media_newsletter_campaign import (
        MediaSerializer, NewsletterSerializer, CampaignSerializer
    )
"""

from rest_framework import serializers
from .models import Category, Tag, BlogPost, Comment
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.text import slugify
from utils.enums import *
from config.settings import BACKEND_BASE_URL
from utils.reusable_functions import get_first_error
from django.db import transaction
import re

User = get_user_model()


# ======================= CATEGORY SERIALIZERS =======================

class CategoryListingSerializer(serializers.ModelSerializer):
    """Minimal serializer for category listings in dropdowns/references"""
    subcategories_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'is_active', 'subcategories_count']

    def get_subcategories_count(self, obj):
        if obj.deleted:
            return 0
        return obj.subcategories.filter(deleted=False, is_active=True).count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
        return data


class CategorySerializer(serializers.ModelSerializer):
    """Full category serializer with validations"""
    subcategories_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    parent = serializers.SerializerMethodField()
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'is_active',
            'meta_title', 'meta_description', 'subcategories_count',
            'posts_count', 'created_by', 'updated_by', 'parent',
            'subcategories', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'slug')

    def get_subcategories_count(self, obj):
        if obj.deleted:
            return 0
        return obj.subcategories.filter(deleted=False, is_active=True).count()

    def get_posts_count(self, obj):
        if obj.deleted:
            return 0
        return obj.blogpost_set.filter(deleted=False, status=PUBLISHED).count()

    def get_created_by(self, obj):
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
        return None

    def get_updated_by(self, obj):
        if obj.updated_by:
            full_name = obj.updated_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
        return None

    def get_parent(self, obj):
        if obj.deleted:
            return None
        if obj.parent and not obj.parent.deleted:
            return CategoryListingSerializer(obj.parent).data
        return None

    def get_subcategories(self, obj):
        if obj.deleted:
            return []
        request = self.context.get('request')
        if request and request.method == 'GET':
            if hasattr(obj, 'id') and not isinstance(obj, list):
                subcategories = obj.subcategories.filter(deleted=False, is_active=True)
                return CategoryListingSerializer(subcategories, many=True, context=self.context).data
        return []

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters long")

        qs = Category.objects.filter(name__iexact=value.strip(), deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(f"Category with name '{value}' already exists")

        return value.strip()

    def validate_parent(self, value):
        if value and self.instance and value.id == self.instance.id:
            raise serializers.ValidationError("A category cannot be its own parent")

        if value and self.instance:
            current = value
            while current:
                if current.id == self.instance.id:
                    raise serializers.ValidationError("Circular parent relationship detected")
                current = current.parent

        return value

    def validate(self, attrs):
        if 'name' in attrs and not attrs.get('slug'):
            attrs['slug'] = slugify(attrs['name'])

        if attrs.get('meta_title') and len(attrs['meta_title']) > 160:
            raise serializers.ValidationError({"meta_title": "Meta title cannot exceed 160 characters"})

        if attrs.get('meta_description') and len(attrs['meta_description']) > 320:
            raise serializers.ValidationError({"meta_description": "Meta description cannot exceed 320 characters"})

        return attrs

    def to_representation(self, instance):
        if instance.deleted:
            return {
                'id': instance.id,
                'name': instance.name,
                'message': f'Category "{instance.name}" has been deleted successfully'
            }

        data = super().to_representation(instance)

        if instance.image:
            data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
        else:
            data['image'] = None

        if isinstance(data.get('created_at'), str):
            data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]

        return data


# ======================= TAG SERIALIZERS =======================

class TagListingSerializer(serializers.ModelSerializer):
    """Minimal serializer for tag listings"""
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'color']


class TagSerializer(serializers.ModelSerializer):
    """Full tag serializer with validations"""
    posts_count = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = [
            'id', 'name', 'slug', 'color', 'is_active', 'posts_count',
            'created_by', 'updated_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'slug')

    def get_posts_count(self, obj):
        if obj.deleted:
            return 0
        return obj.blogpost_set.filter(deleted=False, status=PUBLISHED).count()

    def get_created_by(self, obj):
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
        return None

    def get_updated_by(self, obj):
        if obj.updated_by:
            full_name = obj.updated_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
        return None

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Tag name must be at least 2 characters long")

        qs = Tag.objects.filter(name__iexact=value.strip(), deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(f"Tag with name '{value}' already exists")

        return value.strip()

    def validate_color(self, value):
        if value and not re.match(r'^#(?:[0-9a-fA-F]{3}){1,2}$', value):
            raise serializers.ValidationError("Invalid hex color code. Use format like #007bff")
        return value

    def validate(self, attrs):
        if 'name' in attrs and not attrs.get('slug'):
            attrs['slug'] = slugify(attrs['name'])
        return attrs

    def to_representation(self, instance):
        if instance.deleted:
            return {
                'id': instance.id,
                'name': instance.name,
                'message': f'Tag "{instance.name}" has been deleted successfully'
            }

        data = super().to_representation(instance)

        if isinstance(data.get('created_at'), str):
            data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]

        return data


# ======================= BLOG POST SERIALIZERS =======================

class BlogPostListingSerializer(serializers.ModelSerializer):
    """Minimal serializer for blog post listings"""
    author_name = serializers.CharField(source='author', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'excerpt', 'featured_image', 'author_name',
                  'category_name', 'status', 'published_at', 'view_count', 'reading_time']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.featured_image:
            data['featured_image'] = f"{BACKEND_BASE_URL}{instance.featured_image.url}"
        return data


class BlogPostSerializer(serializers.ModelSerializer):
    """
    Full blog post serializer for staff/authenticated write access.

    FIXED: `password` is now excluded from output entirely. Set it via
    validate()/write-only below rather than ever serializing the hash back
    out — no client, staff or otherwise, needs to read it.
    """
    tags_list = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = BlogPost
        exclude = ['deleted']
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by',
                             'slug', 'view_count')

    def get_tags_list(self, obj):
        return TagListingSerializer(obj.tags.filter(deleted=False, is_active=True), many=True).data

    def get_comments_count(self, obj):
        return obj.comments.filter(deleted=False, status=APPROVED).count()

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long")

        qs = BlogPost.objects.filter(title__iexact=value.strip(), deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(f"Blog post with title '{value}' already exists")

        return value.strip()

    def validate_excerpt(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Excerpt cannot exceed 500 characters")
        return value

    def validate_content(self, value):
        if len(value.strip()) < 50:
            raise serializers.ValidationError("Content must be at least 50 characters long")
        return value

    def validate_reading_time(self, value):
        if value and value < 0:
            raise serializers.ValidationError("Reading time cannot be negative")
        return value

    def validate(self, attrs):
        if 'title' in attrs and not attrs.get('slug'):
            base_slug = slugify(attrs['title'])
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug, deleted=False).exclude(
                id=self.instance.id if self.instance else None
            ).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            attrs['slug'] = slug

        visibility = attrs.get('visibility', self.instance.visibility if self.instance else None)
        raw_password = attrs.pop('password', None)

        if visibility == PASSWORD:
            has_existing_password = self.instance and self.instance.password
            if not raw_password and not has_existing_password:
                raise serializers.ValidationError({
                    "password": "Password is required for password-protected posts"
                })

        # Stash the raw password to hash in create()/update() — never keep
        # it around as a plain attrs value that could get saved verbatim.
        if raw_password:
            attrs['_raw_password'] = raw_password

        status = attrs.get('status', self.instance.status if self.instance else None)
        if status == PUBLISHED and not attrs.get('published_at') and (not self.instance or not self.instance.published_at):
            attrs['published_at'] = timezone.now()

        if status == SCHEDULED:
            scheduled_at = attrs.get('scheduled_at', self.instance.scheduled_at if self.instance else None)
            if not scheduled_at:
                raise serializers.ValidationError({
                    "scheduled_at": "Scheduled date/time is required for scheduled posts"
                })
            if scheduled_at <= timezone.now():
                raise serializers.ValidationError({
                    "scheduled_at": "Scheduled date/time must be in the future"
                })

        if attrs.get('meta_title') and len(attrs['meta_title']) > 160:
            raise serializers.ValidationError({"meta_title": "Meta title cannot exceed 160 characters"})

        if attrs.get('meta_description') and len(attrs['meta_description']) > 320:
            raise serializers.ValidationError({"meta_description": "Meta description cannot exceed 320 characters"})

        if 'content' in attrs and not attrs.get('reading_time'):
            word_count = len(attrs['content'].split())
            attrs['reading_time'] = max(1, round(word_count / 200))

        return attrs

    def create(self, validated_data):
        raw_password = validated_data.pop('_raw_password', None)
        instance = super().create(validated_data)
        if raw_password:
            instance.set_password(raw_password)
            instance.save(update_fields=['password'])
        return instance

    def update(self, instance, validated_data):
        raw_password = validated_data.pop('_raw_password', None)
        instance = super().update(instance, validated_data)
        if raw_password:
            instance.set_password(raw_password)
            instance.save(update_fields=['password'])
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('password', None)  # belt-and-suspenders: never leak the hash
        data['created_by'] = instance.created_by.get_full_name() if instance.created_by else None
        data['updated_by'] = instance.updated_by.get_full_name() if instance.updated_by else None

        if instance.category:
            data['category'] = CategoryListingSerializer(instance.category).data

        if instance.featured_image:
            data['featured_image'] = f"{BACKEND_BASE_URL}{instance.featured_image.url}"

        return data


class PublicBlogPostSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for anonymous/public consumption.

    FIXED: `password` is now explicitly excluded (previously leaked via
    `exclude = ['deleted']`, which is the same bug BlogPostSerializer had).
    """
    tags_list = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        exclude = ['deleted', 'password']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].read_only = True

    def get_tags_list(self, obj):
        return TagListingSerializer(obj.tags.filter(deleted=False, is_active=True), many=True).data

    def get_comments_count(self, obj):
        return obj.comments.filter(deleted=False, status=APPROVED).count()

    def get_created_by(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None

    def get_updated_by(self, obj):
        return obj.updated_by.get_full_name() if obj.updated_by else None

    def get_category(self, obj):
        if obj.category:
            return CategoryListingSerializer(obj.category).data
        return None

    def get_featured_image(self, obj):
        if obj.featured_image:
            return f"{BACKEND_BASE_URL}{obj.featured_image.url}"
        return None


# ======================= COMMENT SERIALIZERS =======================

class CommentSerializer(serializers.ModelSerializer):
    """
    Main serializer for all comment operations.

    FIXED: `ip_address` and `user_agent` are now explicitly excluded from
    output. `exclude = [...]` previously only removed the soft-delete
    fields; `read_only_fields` blocks writes but does NOT hide a field from
    a GET response, so every comment's IP and user-agent string was being
    shipped to anyone viewing a post's comments.
    """

    author_name = serializers.SerializerMethodField()
    author_email = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    is_guest = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        exclude = ['deleted', 'deleted_at', 'deleted_by', 'ip_address', 'user_agent']
        read_only_fields = [
            'id', 'user', 'status', 'is_edited', 'edited_at',
            'moderated_by', 'moderated_at', 'moderation_note',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'guest_name': {'required': False},
            'guest_email': {'required': False},
        }

    def get_author_name(self, obj):
        return obj.author_name

    def get_author_email(self, obj):
        # Only show email to staff or the comment's own author
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.is_staff or obj.user == request.user:
                return obj.author_email
        return None

    def get_reply_count(self, obj):
        return obj.replies.filter(status=Comment.APPROVED, deleted=False).count()

    def get_is_guest(self, obj):
        return obj.is_guest

    def get_replies(self, obj):
        if obj.is_reply or not self.context.get('show_replies'):
            return []

        replies = obj.get_approved_replies()
        return CommentSerializer(
            replies, many=True,
            context={'show_replies': False, 'request': self.context.get('request')}
        ).data

    def get_can_edit(self, obj):
        request = self.context.get('request')
        return obj.can_edit(request.user) if request else False

    def get_can_delete(self, obj):
        request = self.context.get('request')
        return obj.can_delete(request.user) if request else False

    def validate_content(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Comment must be at least 3 characters long")
        return value.strip()

    def validate_post(self, value):
        if value and not value.allow_comments:
            raise serializers.ValidationError("This post does not allow comments")

        if value and value.status != 'published':
            raise serializers.ValidationError("Cannot comment on unpublished posts")

        return value

    def validate_parent(self, value):
        if value:
            if value.deleted:
                raise serializers.ValidationError("Cannot reply to deleted comment")

            if value.parent:
                raise serializers.ValidationError("Cannot reply to a reply")

            if value.status != Comment.APPROVED:
                raise serializers.ValidationError("Cannot reply to unapproved comment")

        return value

    def create(self, validated_data):
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)
        comment = Comment.objects.create(**validated_data)
        return comment

    def validate(self, attrs):
        request = self.context.get('request')

        if not self.instance:
            if request and request.user.is_authenticated:
                attrs['user'] = request.user
                attrs.pop('guest_name', None)
                attrs.pop('guest_email', None)
                attrs.pop('guest_website', None)
            else:
                if not attrs.get('guest_name') or not attrs.get('guest_email'):
                    raise serializers.ValidationError("Guest name and email are required")

            if request:
                ip_address = self._get_client_ip(request)
                user = request.user if request.user.is_authenticated else None

                if Comment.check_rate_limit(ip_address=ip_address, user=user):
                    raise serializers.ValidationError(
                        "Too many comments. Please wait before commenting again."
                    )

                attrs['ip_address'] = ip_address
                attrs['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:500]

                if request.user.is_authenticated and request.user.is_staff:
                    attrs['status'] = Comment.APPROVED
        else:
            if not self.instance.can_edit(request.user if request else None):
                raise serializers.ValidationError("Cannot edit this comment")

        return attrs

    def update(self, instance, validated_data):
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)
        instance.content = validated_data.get('content', instance.content)
        instance.mark_as_edited()
        return instance

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.post:
            data['post'] = {
                'id': instance.post.id,
                'title': instance.post.title,
                'slug': instance.post.slug
            }

        if instance.parent:
            data['parent_author'] = instance.parent.author_name

        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.is_staff:
            if instance.moderated_by:
                data['moderated_by'] = instance.moderated_by.get_full_name()

        return data


class CommentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listings"""
    author_name = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'content', 'author_name', 'status',
            'is_edited', 'reply_count', 'created_at', 'updated_at'
        ]

    def get_author_name(self, obj):
        return obj.author_name

    def get_reply_count(self, obj):
        return obj.replies.filter(status=Comment.APPROVED, deleted=False).count()


class CommentModerationSerializer(serializers.Serializer):
    """Simple serializer for moderation actions"""
    action = serializers.ChoiceField(choices=['approve', 'reject', 'spam'])
    note = serializers.CharField(required=False, max_length=500, allow_blank=True)

    def validate(self, attrs):
        request = self.context.get('request')
        instance = self.context.get('instance')

        if not instance.can_moderate(request.user if request else None):
            raise serializers.ValidationError("No permission to moderate")

        return attrs